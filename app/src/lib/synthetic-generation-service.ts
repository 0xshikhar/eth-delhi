'use client';

import { GeneratorFactory, GenerationResult as AIGenerationResult } from './ai-generators';
import { DatasetSchema, DatasetGenerationRequest, getSchemaById } from './schemas';
import { GenerationConfig, GenerationResult } from './models';
import { generateSyntheticDataset as generateHuggingFaceDataset } from './generation';

/**
 * Enhanced generation result that includes metadata
 */
export interface EnhancedGenerationResult {
  data: any[];
  metadata: {
    mode: 'synthetic' | 'augment';
    schema?: DatasetSchema;
    sampleCount: number;
    provider: string;
    model: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    generatedAt: string;
    processingTime: number;
  };
}

/**
 * Progress callback for generation updates
 */
export type ProgressCallback = (progress: number, status: string) => void;

/**
 * Main service for dataset generation supporting both synthetic and augmentation modes
 */
export class DatasetGenerationService {
  /**
   * Generate a dataset based on the provided request
   */
  static async generateDataset(
    request: DatasetGenerationRequest,
    aiProvider: string = 'openai',
    aiModel?: string,
    onProgress?: ProgressCallback
  ): Promise<EnhancedGenerationResult> {
    const startTime = Date.now();
    
    console.log('🚀 [DatasetGenerationService] Starting dataset generation');
    console.log('📋 [DatasetGenerationService] Request details:', {
      mode: request.mode,
      sampleCount: request.sampleCount,
      aiProvider,
      aiModel,
      schemaId: request.schemaId,
      hasCustomSchema: !!request.customSchema,
      hasHuggingFaceConfig: !!request.huggingFaceConfig
    });
    
    try {
      onProgress?.(10, 'Initializing generation...');

      if (request.mode === 'synthetic') {
        console.log('🔄 [DatasetGenerationService] Using synthetic generation mode');
        return await this.generateSyntheticDataset(request, aiProvider, aiModel, onProgress);
      } else {
        console.log('🔄 [DatasetGenerationService] Using augmented generation mode');
        return await this.generateAugmentedDataset(request, aiProvider, aiModel, onProgress);
      }
    } catch (error) {
      console.error('❌ [DatasetGenerationService] Dataset generation failed:', error);
      console.error('❌ [DatasetGenerationService] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Dataset generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate completely synthetic dataset from schema
   */
  private static async generateSyntheticDataset(
    request: DatasetGenerationRequest,
    aiProvider: string,
    aiModel?: string,
    onProgress?: ProgressCallback
  ): Promise<EnhancedGenerationResult> {
    const startTime = Date.now();

    console.log('🔄 [SyntheticGeneration] Starting synthetic dataset generation');
    console.log('📋 [SyntheticGeneration] Provider:', aiProvider, 'Model:', aiModel);

    onProgress?.(20, 'Loading schema...');

    // Get schema from predefined schemas or use custom schema
    let schema: DatasetSchema;
    if (request.schemaId) {
      console.log('📋 [SyntheticGeneration] Loading predefined schema:', request.schemaId);
      const predefinedSchema = getSchemaById(request.schemaId);
      if (!predefinedSchema) {
        throw new Error(`Schema with ID ${request.schemaId} not found`);
      }
      schema = predefinedSchema;
    } else if (request.customSchema) {
      console.log('📋 [SyntheticGeneration] Using custom schema:', request.customSchema.name);
      schema = {
        id: 'custom',
        name: request.customSchema.name,
        description: request.customSchema.description,
        category: 'Custom',
        fields: request.customSchema.fields,
        sampleSize: { min: 1, max: 10000, default: 100 },
        tags: ['custom']
      };
    } else {
      throw new Error('Either schemaId or customSchema must be provided for synthetic generation');
    }

    console.log('✅ [SyntheticGeneration] Schema loaded:', {
      id: schema.id,
      name: schema.name,
      fieldsCount: schema.fields.length,
      fields: schema.fields.map(f => ({ name: f.name, type: f.type }))
    });

    onProgress?.(40, 'Initializing AI generator...');

    // Get AI generator
    console.log('🤖 [SyntheticGeneration] Getting AI generator for provider:', aiProvider);
    const generator = GeneratorFactory.getGenerator(aiProvider);
    console.log('✅ [SyntheticGeneration] AI generator initialized');

    onProgress?.(60, 'Generating synthetic data...');

    console.log('🎯 [SyntheticGeneration] Starting data generation with config:', {
      sampleCount: request.sampleCount,
      model: aiModel,
      temperature: 0.7,
      maxTokens: Math.min(4000, request.sampleCount * 50)
    });

    // Generate the data
    const result = await generator.generateSyntheticData(schema, request.sampleCount, {
      model: aiModel,
      temperature: 0.7,
      maxTokens: Math.max(8000, request.sampleCount * 150), // Increased token limit for complete responses
    });

    console.log('✅ [SyntheticGeneration] Data generation completed:', {
      dataLength: result.data.length,
      provider: result.provider,
      model: result.model,
      usage: result.usage
    });

    onProgress?.(90, 'Processing results...');

    const processingTime = Date.now() - startTime;

    onProgress?.(100, 'Generation complete!');

    console.log('🎉 [SyntheticGeneration] Synthetic dataset generation completed successfully');
    console.log('📊 [SyntheticGeneration] Final stats:', {
      totalSamples: result.data.length,
      processingTime: `${processingTime}ms`,
      tokensUsed: result.usage.totalTokens
    });

    return {
      data: result.data,
      metadata: {
        mode: 'synthetic',
        schema,
        sampleCount: result.data.length,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        generatedAt: new Date().toISOString(),
        processingTime,
      }
    };
  }

  /**
   * Generate augmented dataset from existing HuggingFace dataset
   */
  private static async generateAugmentedDataset(
    request: DatasetGenerationRequest,
    aiProvider: string,
    aiModel?: string,
    onProgress?: ProgressCallback
  ): Promise<EnhancedGenerationResult> {
    const startTime = Date.now();

    if (!request.huggingFaceConfig) {
      throw new Error('HuggingFace configuration is required for augment mode');
    }

    onProgress?.(20, 'Preparing HuggingFace dataset configuration...');

    // Create generation config for the existing system
    const generationConfig: GenerationConfig = {
      model: aiModel || (aiProvider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20241022'),
      inputFeature: request.huggingFaceConfig.inputFeature,
      maxTokens: 2000,
      temperature: 0.7,
      prompt: `Enhance and expand the following input with additional relevant information and context. Make it more detailed and comprehensive while maintaining the original meaning and style.

Input: {input}

Enhanced version:`,
    };

    onProgress?.(40, 'Starting HuggingFace dataset processing...');

    // Use the existing HuggingFace generation system
    const { results } = await generateHuggingFaceDataset(
      request.huggingFaceConfig.datasetPath,
      request.huggingFaceConfig.config,
      request.huggingFaceConfig.split,
      generationConfig
    );

    onProgress?.(90, 'Processing augmented results...');

    // Calculate total usage from all results
    const totalUsage = results.reduce(
      (acc, result) => ({
        promptTokens: acc.promptTokens + result.usage.promptTokens,
        completionTokens: acc.completionTokens + result.usage.completionTokens,
        totalTokens: acc.totalTokens + result.usage.totalTokens,
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    );

    const processingTime = Date.now() - startTime;

    onProgress?.(100, 'Augmentation complete!');

    return {
      data: results.map(result => ({
        original: result.input,
        enhanced: result.output,
        ...result
      })),
      metadata: {
        mode: 'augment',
        sampleCount: results.length,
        provider: aiProvider,
        model: generationConfig.model,
        usage: totalUsage,
        generatedAt: new Date().toISOString(),
        processingTime,
      }
    };
  }

  /**
   * Preview dataset generation (generate small sample)
   */
  static async previewDataset(
    request: DatasetGenerationRequest,
    aiProvider: string = 'openai',
    aiModel?: string,
    previewSize: number = 3
  ): Promise<EnhancedGenerationResult> {
    const previewRequest = {
      ...request,
      sampleCount: Math.min(previewSize, request.sampleCount)
    };

    return await this.generateDataset(previewRequest, aiProvider, aiModel);
  }

  /**
   * Validate generation request
   */
  static validateRequest(request: DatasetGenerationRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (request.mode === 'synthetic') {
      if (!request.schemaId && !request.customSchema) {
        errors.push('Either schemaId or customSchema is required for synthetic generation');
      }
      
      if (request.customSchema) {
        if (!request.customSchema.name || request.customSchema.name.length < 3) {
          errors.push('Custom schema name must be at least 3 characters');
        }
        if (!request.customSchema.description || request.customSchema.description.length < 10) {
          errors.push('Custom schema description must be at least 10 characters');
        }
        if (!request.customSchema.fields || request.customSchema.fields.length === 0) {
          errors.push('Custom schema must have at least one field');
        }
      }
    } else if (request.mode === 'augment') {
      if (!request.huggingFaceConfig) {
        errors.push('HuggingFace configuration is required for augment mode');
      } else {
        if (!request.huggingFaceConfig.datasetPath) {
          errors.push('Dataset path is required for HuggingFace augmentation');
        }
        if (!request.huggingFaceConfig.inputFeature) {
          errors.push('Input feature is required for HuggingFace augmentation');
        }
      }
    }

    if (request.sampleCount < 1 || request.sampleCount > 10000) {
      errors.push('Sample count must be between 1 and 10000');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get estimated cost for generation
   */
  static estimateGenerationCost(
    request: DatasetGenerationRequest,
    aiProvider: string,
    aiModel?: string
  ): { estimatedTokens: number; estimatedCost: number; currency: string } {
    // Rough estimates based on typical usage
    const baseTokensPerSample = request.mode === 'synthetic' ? 100 : 50;
    const estimatedTokens = request.sampleCount * baseTokensPerSample;

    // Rough cost estimates (these should be updated with real pricing)
    const costPerMillionTokens = aiProvider === 'openai' ? 5.0 : 3.0; // USD
    const estimatedCost = (estimatedTokens / 1000000) * costPerMillionTokens;

    return {
      estimatedTokens,
      estimatedCost: Math.round(estimatedCost * 100) / 100, // Round to 2 decimal places
      currency: 'USD'
    };
  }
}