'use client';

import { z } from 'zod';

/**
 * Base schema types for synthetic dataset generation
 */
export interface DatasetField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'json' | 'array';
  description: string;
  required: boolean;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    format?: string;
  };
  examples?: any[];
}

export interface DatasetSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: DatasetField[];
  sampleSize: {
    min: number;
    max: number;
    default: number;
  };
  tags: string[];
}

export interface GenerationMode {
  id: 'synthetic' | 'augment';
  name: string;
  description: string;
  icon?: string;
}

/**
 * Generation modes available
 */
export const GENERATION_MODES: GenerationMode[] = [
  {
    id: 'synthetic',
    name: 'True Synthetic Generation',
    description: 'Generate completely new data from scratch using AI models'
  },
  {
    id: 'augment',
    name: 'Augment Existing Dataset',
    description: 'Enhance existing HuggingFace datasets with AI-generated content'
  }
];

/**
 * Predefined dataset schemas for common use cases
 */
export const DATASET_SCHEMAS: DatasetSchema[] = [
  {
    id: 'ecommerce-products',
    name: 'E-commerce Products',
    description: 'Product catalog with descriptions, prices, and categories',
    category: 'E-commerce',
    fields: [
      {
        name: 'product_name',
        type: 'string',
        description: 'Product name or title',
        required: true,
        constraints: { min: 5, max: 100 },
        examples: ['Wireless Bluetooth Headphones', 'Organic Cotton T-Shirt', 'Smart Home Security Camera']
      },
      {
        name: 'description',
        type: 'string',
        description: 'Detailed product description',
        required: true,
        constraints: { min: 50, max: 500 },
        examples: ['High-quality wireless headphones with noise cancellation and 30-hour battery life']
      },
      {
        name: 'price',
        type: 'number',
        description: 'Product price in USD',
        required: true,
        constraints: { min: 0.01, max: 10000 },
        examples: [29.99, 149.99, 599.00]
      },
      {
        name: 'category',
        type: 'string',
        description: 'Product category',
        required: true,
        constraints: { 
          enum: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Automotive'] 
        },
        examples: ['Electronics', 'Clothing']
      },
      {
        name: 'brand',
        type: 'string',
        description: 'Brand name',
        required: false,
        constraints: { min: 2, max: 50 },
        examples: ['Apple', 'Nike', 'Samsung']
      },
      {
        name: 'rating',
        type: 'number',
        description: 'Average customer rating (1-5)',
        required: false,
        constraints: { min: 1, max: 5 },
        examples: [4.2, 3.8, 4.9]
      },
      {
        name: 'in_stock',
        type: 'boolean',
        description: 'Whether the product is in stock',
        required: true,
        examples: [true, false]
      }
    ],
    sampleSize: { min: 10, max: 10000, default: 100 },
    tags: ['ecommerce', 'products', 'retail', 'catalog']
  },
  {
    id: 'customer-reviews',
    name: 'Customer Reviews',
    description: 'Product or service reviews with ratings and sentiment',
    category: 'E-commerce',
    fields: [
      {
        name: 'review_text',
        type: 'string',
        description: 'Customer review content',
        required: true,
        constraints: { min: 20, max: 1000 },
        examples: ['Great product! Exceeded my expectations. Fast shipping and excellent quality.']
      },
      {
        name: 'rating',
        type: 'number',
        description: 'Star rating (1-5)',
        required: true,
        constraints: { min: 1, max: 5 },
        examples: [5, 4, 3, 2, 1]
      },
      {
        name: 'product_name',
        type: 'string',
        description: 'Name of the reviewed product',
        required: true,
        constraints: { min: 5, max: 100 },
        examples: ['Wireless Bluetooth Headphones', 'Coffee Maker Pro']
      },
      {
        name: 'reviewer_name',
        type: 'string',
        description: 'Name of the reviewer',
        required: false,
        constraints: { min: 2, max: 50 },
        examples: ['John D.', 'Sarah M.', 'Anonymous']
      },
      {
        name: 'verified_purchase',
        type: 'boolean',
        description: 'Whether the reviewer purchased the product',
        required: true,
        examples: [true, false]
      },
      {
        name: 'helpful_votes',
        type: 'number',
        description: 'Number of helpful votes received',
        required: false,
        constraints: { min: 0, max: 1000 },
        examples: [12, 5, 0, 45]
      }
    ],
    sampleSize: { min: 10, max: 5000, default: 200 },
    tags: ['reviews', 'sentiment', 'ecommerce', 'feedback']
  },
  {
    id: 'medical-records',
    name: 'Medical Records',
    description: 'Synthetic patient medical records for healthcare research',
    category: 'Healthcare',
    fields: [
      {
        name: 'patient_id',
        type: 'string',
        description: 'Unique patient identifier',
        required: true,
        constraints: { pattern: '^P[0-9]{6}$' },
        examples: ['P123456', 'P789012']
      },
      {
        name: 'age',
        type: 'number',
        description: 'Patient age in years',
        required: true,
        constraints: { min: 0, max: 120 },
        examples: [25, 45, 67, 82]
      },
      {
        name: 'gender',
        type: 'string',
        description: 'Patient gender',
        required: true,
        constraints: { enum: ['Male', 'Female', 'Other'] },
        examples: ['Male', 'Female']
      },
      {
        name: 'diagnosis',
        type: 'string',
        description: 'Primary diagnosis',
        required: true,
        constraints: { min: 10, max: 200 },
        examples: ['Type 2 Diabetes Mellitus', 'Hypertension', 'Acute Bronchitis']
      },
      {
        name: 'symptoms',
        type: 'array',
        description: 'List of reported symptoms',
        required: true,
        examples: [['fatigue', 'headache'], ['chest pain', 'shortness of breath']]
      },
      {
        name: 'treatment_plan',
        type: 'string',
        description: 'Recommended treatment plan',
        required: true,
        constraints: { min: 20, max: 500 },
        examples: ['Metformin 500mg twice daily, dietary modifications, regular exercise']
      },
      {
        name: 'blood_pressure',
        type: 'string',
        description: 'Blood pressure reading',
        required: false,
        constraints: { pattern: '^[0-9]{2,3}/[0-9]{2,3}$' },
        examples: ['120/80', '140/90', '110/70']
      }
    ],
    sampleSize: { min: 50, max: 2000, default: 500 },
    tags: ['healthcare', 'medical', 'patient-data', 'synthetic']
  },
  {
    id: 'financial-transactions',
    name: 'Financial Transactions',
    description: 'Banking and financial transaction records',
    category: 'Financial',
    fields: [
      {
        name: 'transaction_id',
        type: 'string',
        description: 'Unique transaction identifier',
        required: true,
        constraints: { pattern: '^TXN[0-9A-F]{8}$' },
        examples: ['TXN12AB34CD', 'TXN98EF76GH']
      },
      {
        name: 'amount',
        type: 'number',
        description: 'Transaction amount in USD',
        required: true,
        constraints: { min: -50000, max: 50000 },
        examples: [1250.50, -89.99, 3500.00]
      },
      {
        name: 'transaction_type',
        type: 'string',
        description: 'Type of transaction',
        required: true,
        constraints: { 
          enum: ['Purchase', 'Transfer', 'Deposit', 'Withdrawal', 'Fee', 'Interest'] 
        },
        examples: ['Purchase', 'Transfer']
      },
      {
        name: 'merchant_name',
        type: 'string',
        description: 'Name of merchant or recipient',
        required: false,
        constraints: { min: 3, max: 100 },
        examples: ['Amazon.com', 'Starbucks Coffee', 'Shell Gas Station']
      },
      {
        name: 'category',
        type: 'string',
        description: 'Transaction category',
        required: true,
        constraints: { 
          enum: ['Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities', 'Entertainment', 'Healthcare', 'Other'] 
        },
        examples: ['Food & Dining', 'Shopping']
      },
      {
        name: 'account_balance',
        type: 'number',
        description: 'Account balance after transaction',
        required: true,
        constraints: { min: -10000, max: 1000000 },
        examples: [2450.75, 890.23, 15670.00]
      },
      {
        name: 'is_fraudulent',
        type: 'boolean',
        description: 'Whether transaction is flagged as fraudulent',
        required: true,
        examples: [false, true]
      }
    ],
    sampleSize: { min: 100, max: 10000, default: 1000 },
    tags: ['financial', 'banking', 'transactions', 'fraud-detection']
  }
];

/**
 * Validation schema for dataset generation requests
 */
export const DatasetGenerationSchema = z.object({
  mode: z.enum(['synthetic', 'augment']),
  schemaId: z.string().optional(),
  customSchema: z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    fields: z.array(z.object({
      name: z.string().min(1),
      type: z.enum(['string', 'number', 'boolean', 'date', 'email', 'url', 'json', 'array']),
      description: z.string().min(5),
      required: z.boolean(),
      constraints: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        enum: z.array(z.string()).optional(),
        format: z.string().optional(),
      }).optional(),
      examples: z.array(z.any()).optional(),
    })).min(1)
  }).optional(),
  sampleCount: z.number().min(1).max(10000),
  // For augment mode
  huggingFaceConfig: z.object({
    datasetPath: z.string(),
    config: z.string().default('default'),
    split: z.string().default('train'),
    inputFeature: z.string(),
  }).optional(),
});

export type DatasetGenerationRequest = z.infer<typeof DatasetGenerationSchema>;

/**
 * Helper functions for schema management
 */
export function getSchemaById(id: string): DatasetSchema | undefined {
  return DATASET_SCHEMAS.find(schema => schema.id === id);
}

export function getSchemasByCategory(category: string): DatasetSchema[] {
  return DATASET_SCHEMAS.filter(schema => schema.category === category);
}

export function validateSchema(schema: DatasetSchema): boolean {
  return schema.fields.length > 0 && 
         schema.name.length > 0 && 
         schema.description.length > 0;
}

export function generateSchemaPrompt(schema: DatasetSchema, sampleCount: number): string {
  const fieldDescriptions = schema.fields.map(field => {
    let desc = `- ${field.name} (${field.type}${field.required ? ', required' : ', optional'}): ${field.description}`;
    
    if (field.constraints?.enum) {
      desc += ` [Options: ${field.constraints.enum.join(', ')}]`;
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
3. Follow the specified constraints for each field
4. Make the data diverse and realistic
5. Return the data as a JSON array of objects
6. Each object should have all the specified fields
7. Use realistic, varied values that would be found in real-world scenarios

The response should be a valid JSON array containing ${sampleCount} objects, each representing one data sample.`;
}