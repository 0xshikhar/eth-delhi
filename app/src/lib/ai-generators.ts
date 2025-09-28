'use client';

import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { z } from 'zod';
import { DatasetSchema, DatasetField } from './schemas';

// Get API keys from environment variables (client-side accessible)
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

/**
 * Base interface for AI generators
 */
export interface AIGenerator {
  id: string;
  name: string;
  provider: string;
  generateSyntheticData(schema: DatasetSchema, sampleCount: number, options?: GenerationOptions): Promise<GenerationResult>;
  generateText(prompt: string, options?: GenerationOptions): Promise<string>;
}

/**
 * Generation options for AI models
 */
export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Result of AI generation
 */
export interface GenerationResult {
  data: any[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

/**
 * OpenAI Generator using Vercel AI SDK
 */
export class OpenAIGenerator implements AIGenerator {
  id = 'openai';
  name = 'OpenAI GPT';
  provider = 'openai';
  private openaiInstance: ReturnType<typeof createOpenAI>;

  constructor() {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is missing. Pass it using the \'apiKey\' parameter or the OPENAI_API_KEY environment variable.');
    }

    // Create OpenAI instance with API key
    this.openaiInstance = createOpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  private getModel(modelName?: string) {
    const model = modelName || 'gpt-4o';
    return this.openaiInstance(model);
  }

  async generateSyntheticData(
    schema: DatasetSchema,
    sampleCount: number,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const { temperature = 0.7, maxTokens = 4000, model } = options;

    console.log('🚀 Starting OpenAI data generation:', {
      schema: schema.name,
      sampleCount,
      temperature,
      maxTokens,
      model,
      fieldsCount: schema.fields.length
    });

    // Create Zod schema for validation
    const zodSchema = this.createZodSchema(schema);
    const arraySchema = z.array(zodSchema);

    const prompt = this.createPrompt(schema, sampleCount);
    console.log('📝 Generated prompt:', prompt);

    try {
      console.log('🔄 Calling OpenAI API...');
      const result = await generateText({
        model: this.getModel(model),
        prompt: `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON array with no additional text, explanations, or formatting. The response must be complete and parseable JSON.`,
        temperature,
        maxOutputTokens: maxTokens,
      });

      console.log('✅ OpenAI API response received:', {
        textLength: result.text.length,
        usage: result.usage,
        firstChars: result.text.substring(0, 200),
        lastChars: result.text.substring(Math.max(0, result.text.length - 200))
      });
      console.log('📄 Full OpenAI response text:', result.text);

      // Parse the JSON response
      let parsedData;
      try {
        console.log('🔍 Attempting direct JSON parse...');
        // First, try to parse the response directly
        parsedData = JSON.parse(result.text);
        console.log('✅ Direct JSON parse successful:', { dataLength: parsedData.length });
      } catch (parseError) {
        console.log('❌ Direct JSON parse failed:', parseError);
        console.log('🔍 Attempting to extract JSON from response...');

        // Try to extract JSON from the response if it's wrapped in other text
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          console.log('🎯 Found JSON array pattern:', jsonMatch[0].substring(0, 200) + '...');
          try {
            parsedData = JSON.parse(jsonMatch[0]);
            console.log('✅ JSON array extraction successful:', { dataLength: parsedData.length });
          } catch (extractError) {
            console.error('❌ Failed to parse extracted JSON:', extractError);
            console.error('🔍 Extracted content:', jsonMatch[0]);
            throw new Error(`Failed to parse JSON response. Raw response: ${result.text.substring(0, 500)}...`);
          }
        } else {
          console.log('🔍 No JSON array found, trying code block extraction...');
          // Try to find JSON objects wrapped in code blocks
          const codeBlockMatch = result.text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
          if (codeBlockMatch) {
            console.log('🎯 Found JSON in code block:', codeBlockMatch[1].substring(0, 200) + '...');
            try {
              parsedData = JSON.parse(codeBlockMatch[1]);
              console.log('✅ Code block JSON extraction successful:', { dataLength: parsedData.length });
            } catch (codeBlockError) {
              console.error('❌ Failed to parse code block JSON:', codeBlockError);
              console.error('🔍 Code block content:', codeBlockMatch[1]);
              throw new Error(`Failed to parse JSON response. Raw response: ${result.text.substring(0, 500)}...`);
            }
          } else {
            // Step 4: Try to fix incomplete JSON by adding missing closing brackets
            console.log('🔧 Attempting to fix incomplete JSON...');
            let fixedJson = result.text.trim();

            // Count opening and closing brackets
            const openBrackets = (fixedJson.match(/\[/g) || []).length;
            const closeBrackets = (fixedJson.match(/\]/g) || []).length;
            const openBraces = (fixedJson.match(/\{/g) || []).length;
            const closeBraces = (fixedJson.match(/\}/g) || []).length;

            console.log('🔍 Bracket analysis:', { openBrackets, closeBrackets, openBraces, closeBraces });

            // If we have unmatched brackets, try to fix them
            if (openBrackets > closeBrackets || openBraces > closeBraces) {
              // Remove any trailing incomplete object
              const lastCompleteObject = fixedJson.lastIndexOf('}');
              if (lastCompleteObject > 0) {
                fixedJson = fixedJson.substring(0, lastCompleteObject + 1);
              }

              // Add missing closing braces
              const missingBraces = openBraces - (fixedJson.match(/\}/g) || []).length;
              for (let i = 0; i < missingBraces; i++) {
                fixedJson += '\n  }';
              }

              // Add missing closing brackets
              const missingBrackets = openBrackets - (fixedJson.match(/\]/g) || []).length;
              for (let i = 0; i < missingBrackets; i++) {
                fixedJson += '\n]';
              }

              console.log('🔧 Attempting to parse fixed JSON...');
              try {
                parsedData = JSON.parse(fixedJson);
                console.log('✅ Fixed JSON parse successful:', { dataLength: parsedData.length });
              } catch (parseError) {
                console.log('❌ Fixed JSON parse failed:', parseError);
                console.error('❌ No JSON found in response');
                console.error('🔍 Full response for debugging:', result.text);
                throw new Error(`Failed to parse JSON response. Raw response: ${result.text.substring(0, 500)}...`);
              }
            } else {
              console.error('❌ No JSON found in response');
              console.error('🔍 Full response for debugging:', result.text);
              throw new Error(`Failed to parse JSON response. Raw response: ${result.text.substring(0, 500)}...`);
            }
          }
        }
      }

      console.log('🔍 Validating data with Zod schema...');
      // Validate with Zod schema
      const validatedData = arraySchema.parse(parsedData);
      console.log('✅ Data validation successful:', { validatedCount: validatedData.length });

      const finalResult = {
        data: validatedData,
        usage: {
          promptTokens: (result.usage as any)?.promptTokens || 0,
          completionTokens: (result.usage as any)?.completionTokens || 0,
          totalTokens: (result.usage as any)?.totalTokens || 0,
        },
        model: model || 'gpt-4o',
        provider: this.provider,
      };

      console.log('🎉 OpenAI generation completed successfully:', {
        dataCount: finalResult.data.length,
        usage: finalResult.usage
      });

      return finalResult;
    } catch (error) {
      console.error('💥 OpenAI generation error:', error);
      console.error('🔍 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateText(prompt: string, options: GenerationOptions = {}): Promise<string> {
    const { temperature = 0.7, maxTokens = 1000, model } = options;

    try {
      const result = await generateText({
        model: this.getModel(model),
        prompt,
        temperature,
        maxOutputTokens: maxTokens,
      });

      return result.text;
    } catch (error) {
      console.error('OpenAI text generation error:', error);
      throw new Error(`OpenAI text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createZodSchema(schema: DatasetSchema): z.ZodType<any> {
    const schemaObject: Record<string, z.ZodType<any>> = {};

    schema.fields.forEach(field => {
      let zodField: z.ZodType<any>;

      switch (field.type) {
        case 'string':
          zodField = z.string();
          if (field.constraints?.min) {
            zodField = (zodField as z.ZodString).min(field.constraints.min);
          }
          if (field.constraints?.max) {
            zodField = (zodField as z.ZodString).max(field.constraints.max);
          }
          if (field.constraints?.enum) {
            zodField = z.enum(field.constraints.enum as [string, ...string[]]);
          }
          break;
        case 'number':
          zodField = z.number();
          if (field.constraints?.min !== undefined) {
            zodField = (zodField as z.ZodNumber).min(field.constraints.min);
          }
          if (field.constraints?.max !== undefined) {
            zodField = (zodField as z.ZodNumber).max(field.constraints.max);
          }
          break;
        case 'boolean':
          zodField = z.boolean();
          break;
        case 'date':
          zodField = z.string().datetime();
          break;
        case 'email':
          zodField = z.string().email();
          break;
        case 'url':
          zodField = z.string().url();
          break;
        case 'array':
          zodField = z.array(z.any());
          break;
        case 'json':
          zodField = z.any();
          break;
        default:
          zodField = z.string();
      }

      if (!field.required) {
        zodField = zodField.optional();
      }

      schemaObject[field.name] = zodField;
    });

    return z.object(schemaObject);
  }

  private createPrompt(schema: DatasetSchema, sampleCount: number): string {
    const fieldDescriptions = schema.fields.map(field => {
      let desc = `- ${field.name} (${field.type}${field.required ? ', required' : ', optional'}): ${field.description}`;

      if (field.constraints?.enum) {
        desc += ` [Must be one of: ${field.constraints.enum.join(', ')}]`;
      }
      if (field.constraints?.min !== undefined || field.constraints?.max !== undefined) {
        desc += ` [Range: ${field.constraints.min || 'no min'} - ${field.constraints.max || 'no max'}]`;
      }
      if (field.examples && field.examples.length > 0) {
        desc += ` [Examples: ${field.examples.slice(0, 3).map(ex => JSON.stringify(ex)).join(', ')}]`;
      }

      return desc;
    }).join('\n');

    return `Generate ${sampleCount} realistic synthetic data samples for a ${schema.name} dataset.

Description: ${schema.description}

Required fields:
${fieldDescriptions}

Requirements:
1. Generate exactly ${sampleCount} unique, realistic samples
2. Ensure all required fields are present and non-empty
3. Follow the specified constraints for each field exactly (especially minimum lengths)
4. For description fields with minimum length requirements, ensure they meet or exceed the minimum
5. Make the data diverse and realistic
6. Use realistic, varied values that would be found in real-world scenarios
7. For enum fields, only use the specified values
8. For numeric fields, stay within the specified ranges
9. Make each sample unique and different from others

CRITICAL: For any field with a minimum length constraint (like description fields requiring 20+ characters), ensure the generated content meets or exceeds that requirement.

IMPORTANT: Return ONLY a valid JSON array containing the ${sampleCount} data objects. Do not include any explanatory text, markdown formatting, or code blocks. The response must be parseable as JSON.

Example format:
[
  {"field1": "value1", "field2": "value2"},
  {"field1": "value3", "field2": "value4"}
]`;
  }
}

/**
 * Anthropic Generator using Vercel AI SDK
 */
export class AnthropicGenerator implements AIGenerator {
  id = 'anthropic';
  name = 'Anthropic Claude';
  provider = 'anthropic';
  private anthropicInstance: ReturnType<typeof createAnthropic>;

  constructor() {
    // Check if API key is available
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key is missing. Pass it using the \'apiKey\' parameter or the ANTHROPIC_API_KEY environment variable.');
    }

    // Create Anthropic instance with API key
    this.anthropicInstance = createAnthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
  }

  private getModel(modelName?: string) {
    const model = modelName || 'claude-3-5-sonnet-20241022';
    return this.anthropicInstance(model);
  }

  async generateSyntheticData(
    schema: DatasetSchema,
    sampleCount: number,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const { temperature = 0.7, maxTokens = 4000, model } = options;

    // Create Zod schema for validation
    const zodSchema = this.createZodSchema(schema);
    const arraySchema = z.array(zodSchema);

    const prompt = this.createPrompt(schema, sampleCount);

    try {
      const result = await generateText({
        model: this.getModel(model),
        prompt: `${prompt}\n\nReturn only a valid JSON array with no additional text or formatting.`,
        temperature,
        maxOutputTokens: maxTokens,
      });

      // Parse the JSON response
      let parsedData;
      try {
        // First, try to parse the response directly
        parsedData = JSON.parse(result.text);
      } catch (parseError) {
        console.log('Direct JSON parse failed, attempting to extract JSON from response:', result.text);

        // Try to extract JSON from the response if it's wrapped in other text
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            console.error('Failed to parse extracted JSON:', jsonMatch[0]);
            throw new Error(`Failed to parse JSON response. Raw response: ${result.text.substring(0, 500)}...`);
          }
        } else {
          // Try to find JSON objects wrapped in code blocks
          const codeBlockMatch = result.text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
          if (codeBlockMatch) {
            try {
              parsedData = JSON.parse(codeBlockMatch[1]);
            } catch (codeBlockError) {
              console.error('Failed to parse code block JSON:', codeBlockMatch[1]);
              throw new Error(`Failed to parse JSON response. Raw response: ${result.text.substring(0, 500)}...`);
            }
          } else {
            console.error('No JSON found in response:', result.text);
            throw new Error(`Failed to parse JSON response. Raw response: ${result.text.substring(0, 500)}...`);
          }
        }
      }

      // Validate with Zod schema
      const validatedData = arraySchema.parse(parsedData);

      return {
        data: validatedData,
        usage: {
          promptTokens: (result.usage as any)?.promptTokens || 0,
          completionTokens: (result.usage as any)?.completionTokens || 0,
          totalTokens: (result.usage as any)?.totalTokens || 0,
        },
        model: model || 'claude-3-5-sonnet-20241022',
        provider: this.provider,
      };
    } catch (error) {
      console.error('Anthropic generation error:', error);
      throw new Error(`Anthropic generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateText(prompt: string, options: GenerationOptions = {}): Promise<string> {
    const { temperature = 0.7, maxTokens = 1000, model } = options;

    try {
      const result = await generateText({
        model: this.getModel(model),
        prompt,
        temperature,
        maxOutputTokens: maxTokens,
      });

      return result.text;
    } catch (error) {
      console.error('Anthropic text generation error:', error);
      throw new Error(`Anthropic text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createZodSchema(schema: DatasetSchema): z.ZodType<any> {
    const schemaObject: Record<string, z.ZodType<any>> = {};

    schema.fields.forEach(field => {
      let zodField: z.ZodType<any>;

      switch (field.type) {
        case 'string':
          zodField = z.string();
          if (field.constraints?.min) {
            zodField = (zodField as z.ZodString).min(field.constraints.min);
          }
          if (field.constraints?.max) {
            zodField = (zodField as z.ZodString).max(field.constraints.max);
          }
          if (field.constraints?.enum) {
            zodField = z.enum(field.constraints.enum as [string, ...string[]]);
          }
          break;
        case 'number':
          zodField = z.number();
          if (field.constraints?.min !== undefined) {
            zodField = (zodField as z.ZodNumber).min(field.constraints.min);
          }
          if (field.constraints?.max !== undefined) {
            zodField = (zodField as z.ZodNumber).max(field.constraints.max);
          }
          break;
        case 'boolean':
          zodField = z.boolean();
          break;
        case 'date':
          zodField = z.string().datetime();
          break;
        case 'email':
          zodField = z.string().email();
          break;
        case 'url':
          zodField = z.string().url();
          break;
        case 'array':
          zodField = z.array(z.any());
          break;
        case 'json':
          zodField = z.any();
          break;
        default:
          zodField = z.string();
      }

      if (!field.required) {
        zodField = zodField.optional();
      }

      schemaObject[field.name] = zodField;
    });

    return z.object(schemaObject);
  }

  private createPrompt(schema: DatasetSchema, sampleCount: number): string {
    const fieldDescriptions = schema.fields.map(field => {
      let desc = `- ${field.name} (${field.type}${field.required ? ', required' : ', optional'}): ${field.description}`;

      if (field.constraints?.enum) {
        desc += ` [Must be one of: ${field.constraints.enum.join(', ')}]`;
      }
      if (field.constraints?.min !== undefined || field.constraints?.max !== undefined) {
        desc += ` [Range: ${field.constraints.min || 'no min'} - ${field.constraints.max || 'no max'}]`;
      }
      if (field.examples && field.examples.length > 0) {
        desc += ` [Examples: ${field.examples.slice(0, 3).map(ex => JSON.stringify(ex)).join(', ')}]`;
      }

      return desc;
    }).join('\n');

    return `Generate ${sampleCount} realistic synthetic data samples for a ${schema.name} dataset.

Description: ${schema.description}

Required fields:
${fieldDescriptions}

Requirements:
1. Generate exactly ${sampleCount} unique, realistic samples
2. Ensure all required fields are present and non-empty
3. Follow the specified constraints for each field exactly (especially minimum lengths)
4. For description fields with minimum length requirements, ensure they meet or exceed the minimum
5. Make the data diverse and realistic
6. Use realistic, varied values that would be found in real-world scenarios
7. For enum fields, only use the specified values
8. For numeric fields, stay within the specified ranges
9. Make each sample unique and different from others

CRITICAL: For any field with a minimum length constraint (like description fields requiring 50+ characters), ensure the generated content meets or exceeds that requirement.

IMPORTANT: Return ONLY a valid JSON array containing the ${sampleCount} data objects. Do not include any explanatory text, markdown formatting, or code blocks. The response must be parseable as JSON.

Example format:
[
  {"field1": "value1", "field2": "value2"},
  {"field1": "value3", "field2": "value4"}
]`;
  }
}

/**
 * Generator factory to create appropriate generator instances
 */
export class GeneratorFactory {
  private static generators: Map<string, AIGenerator> = new Map();

  static getGenerator(providerId: string): AIGenerator {
    if (!this.generators.has(providerId)) {
      switch (providerId) {
        case 'openai':
          this.generators.set(providerId, new OpenAIGenerator());
          break;
        case 'anthropic':
          this.generators.set(providerId, new AnthropicGenerator());
          break;
        default:
          throw new Error(`Unsupported AI provider: ${providerId}`);
      }
    }

    const generator = this.generators.get(providerId);
    if (!generator) {
      throw new Error(`Failed to create generator for provider: ${providerId}`);
    }

    return generator;
  }

  static getAvailableProviders(): string[] {
    return ['openai', 'anthropic'];
  }

  static isProviderSupported(providerId: string): boolean {
    return this.getAvailableProviders().includes(providerId);
  }
}

/**
 * Helper function to validate environment variables for AI providers
 */
export function validateAIProviderConfig(): { [key: string]: boolean } {
  return {
    openai: !!OPENAI_API_KEY,
    anthropic: !!ANTHROPIC_API_KEY,
  };
}

/**
 * Get available AI models for each provider
 */
export function getAvailableModels() {
  return {
    openai: [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000 },
    ],
    anthropic: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', maxTokens: 200000 },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', maxTokens: 200000 },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 200000 },
    ],
  };
}