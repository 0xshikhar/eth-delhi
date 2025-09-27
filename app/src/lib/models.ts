'use client';

import { z } from 'zod';

/**
 * Types for model integration
 */
export interface ModelProvider {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  apiKeyRequired: boolean;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  taskId: number;
  pricePerMillionTokens: number;
  maxTokens: number;
}

export interface GenerationConfig {
  model: string;
  inputFeature: string;
  maxTokens: number;
  temperature: number;
  prompt: string;
  jsonSchema?: z.ZodType<any>;
}

export interface GenerationResult {
  input: any;
  output: any;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  signature?: string;
  responseHash?: string;
}

/**
 * Available model providers
 */
export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI API for GPT models',
    baseUrl: 'https://api.openai.com/v1',
    apiKeyRequired: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Anthropic API for Claude models',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKeyRequired: true
  }
];

/**
 * Fetch available models from a provider
 */
export async function getModels(providerId: string): Promise<Model[]> {
  // This would typically be an API call to the provider
  // For now, we'll return mock data based on the provider
  
  switch (providerId) {
    case 'openai':
      return [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          provider: 'openai',
          taskId: 1,
          pricePerMillionTokens: 5000,
          maxTokens: 128000
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          provider: 'openai',
          taskId: 1,
          pricePerMillionTokens: 10000,
          maxTokens: 128000
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          taskId: 1,
          pricePerMillionTokens: 1000,
          maxTokens: 16000
        }
      ];
    case 'anthropic':
      return [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          taskId: 4,
          pricePerMillionTokens: 15000,
          maxTokens: 200000
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          provider: 'anthropic',
          taskId: 5,
          pricePerMillionTokens: 3000,
          maxTokens: 200000
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          provider: 'anthropic',
          taskId: 5,
          pricePerMillionTokens: 250,
          maxTokens: 200000
        }
      ];
    default:
      return [];
  }
}

/**
 * Template interface for dataset generation
 */
export interface DatasetTemplate {
  id: string;
  name: string;
  description: string;
  datasetSource: {
    path: string;
    config: string;
    split: string;
  };
  prompt: string;
  inputFeature: string;
  maxTokens: number;
  recommendedModel: string;
  price: number;
  jsonSchema?: z.ZodType<any>;
}

/**
 * Predefined templates for dataset generation
 */
export const DATASET_TEMPLATES: DatasetTemplate[] = [
  {
    id: 'ultrachat-instruct',
    name: 'UltraChat Instruct',
    description: 'Large-scale Dialogue Data',
    datasetSource: {
      path: 'HuggingFaceH4/ultrachat_200k',
      config: 'default',
      split: 'train_sft',
    },
    prompt: 'Read the following text and answer the questions contained within it based only on the information provided in the text: {input}',
    inputFeature: 'prompt',
    maxTokens: 1000,
    recommendedModel: 'gpt-4o',
    price: 1
  },
  {
    id: 'medical-transcription',
    name: 'Medical Transcription',
    description: 'Medical Transcription Data',
    datasetSource: {
      path: 'galileo-ai/medical_transcription_40',
      config: 'default',
      split: 'train',
    },
    prompt: 'Given the following medical transcription, classify it into one of these categories: [Pain Management, Chiropractic, Podiatry, Pediatrics - Neonatal, Discharge Summary, Cosmetic / Plastic Surgery, Neurology, Endocrinology, Rheumatology, Orthopedic, Dentistry, Allergy / Immunology, Psychiatry / Psychology, Consult - History and Phy., Dermatology, Radiology, Speech - Language, Physical Medicine - Rehab, Sleep Medicine, Hospice - Palliative Care, Diets and Nutritions, Urology, ENT - Otolaryngology, Gastroenterology, Letters, Surgery, Bariatrics, Ophthalmology, Neurosurgery, Emergency Room Reports, Nephrology, Lab Medicine - Pathology, Office Notes, Cardiovascular / Pulmonary, SOAP / Chart / Progress Notes, Autopsy, General Medicine, IME-QME-Work Comp etc., Obstetrics / Gynecology, Hematology - Oncology]. After classifying, explain your reasoning for the chosen category. Medical Transcription: {input}',
    inputFeature: 'text',
    maxTokens: 3000,
    recommendedModel: 'gpt-4o',
    price: 5
  }
];
