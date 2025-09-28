'use client';

import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { Loader2, Database, Bot, ArrowRight, CheckCircle, AlertCircle, Clock, Upload, Zap, Eye, Sparkles } from 'lucide-react';
import { Model, getModels, MODEL_PROVIDERS } from '@/lib/models';
import { DatasetGenerationService } from '@/lib/synthetic-generation-service';
import { DATASET_SCHEMAS, getSchemaById, GENERATION_MODES } from '@/lib/schemas';
import { useDataUpload } from '@/hooks/storage/useDataUpload';
import { useDatasetPublisher } from '@/hooks/blockchain/useDatasetPublisher';

// Enhanced form schema for new generation system
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Dataset name must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Price must be a non-negative number",
  }),
  visibility: z.enum(["public", "private"], {
    required_error: "You must select a visibility option",
  }),
  allowNFTAccess: z.boolean().default(false),
  
  // Generation mode selection
  generationMode: z.enum(["synthetic", "augment"], {
    required_error: "You must select a generation mode",
  }),
  
  // Schema selection for synthetic generation
  schemaId: z.string().optional(),
  
  // AI Model configuration
  aiProvider: z.string().min(1, {
    message: "AI provider is required",
  }),
  modelId: z.string().min(1, {
    message: "Model is required",
  }),
  
  // Synthetic generation parameters
  sampleCount: z.number().min(10).max(10000).default(100),
  customPrompt: z.string().optional(),
  
  // HuggingFace augmentation parameters (for augment mode)
  datasetPath: z.string().optional(),
  datasetConfig: z.string().default("default"),
  datasetSplit: z.string().default("train"),
  inputFeature: z.string().optional(),
  augmentPrompt: z.string().optional(),
  
  maxTokens: z.number().min(100).max(8000).default(1000),
});

type ProcessStep = 'idle' | 'generating' | 'uploading' | 'publishing' | 'completed' | 'error';

interface StepIndicatorProps {
  currentStep: ProcessStep;
  error?: string | null;
}

function StepIndicator({ currentStep, error }: StepIndicatorProps) {
  const steps = [
    { id: 'generating', label: 'Generating Dataset', icon: Sparkles },
    { id: 'uploading', label: 'Uploading to IPFS', icon: Upload },
    { id: 'publishing', label: 'Publishing On-Chain', icon: Database },
  ];

  const getStepStatus = (stepId: string) => {
    if (error && currentStep === stepId) return 'error';
    if (currentStep === stepId) return 'active';
    
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (currentStep === 'completed') return 'completed';
    if (stepIndex < currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="flex items-center justify-center space-x-4 py-6">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              status === 'completed' ? 'bg-green-100 text-green-700' :
              status === 'active' ? 'bg-blue-100 text-blue-700' :
              status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {status === 'completed' ? (
                <CheckCircle className="w-4 h-4" />
              ) : status === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : status === 'active' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className={`w-4 h-4 mx-4 ${
                status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function GenerateDatasetForm() {
  const { isConnected, address } = useAccount();
  const {
    uploadDataMutation,
    progress: uploadProgress,
    status: uploadStatus,
    uploadedInfo,
    handleReset,
  } = useDataUpload();
  const { mutateAsync: uploadData, isPending: isUploading } = uploadDataMutation;
  const { publish, isPublishing } = useDatasetPublisher();

  const [activeTab, setActiveTab] = useState<string>("configure");
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedData, setGeneratedData] = useState<any[] | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessStep>('idle');
  const [processError, setProcessError] = useState<string | null>(null);

  const resetUpload = useCallback(() => {
    handleReset();
  }, [handleReset]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "public",
      price: "0",
      allowNFTAccess: false,
      generationMode: "synthetic",
      aiProvider: "openai",
      modelId: "",
      sampleCount: 100,
      maxTokens: 1000,
      datasetConfig: "default",
      datasetSplit: "train",
    },
  });

  const watchGenerationMode = form.watch("generationMode");
  const watchAiProvider = form.watch("aiProvider");
  const watchSchemaId = form.watch("schemaId");

  useEffect(() => {
    loadModels();
  }, [watchAiProvider]);

  useEffect(() => {
    console.log('🔄 [GenerateDatasetForm] Checking upload transition:', {
      hasGeneratedData: !!generatedData,
      isUploading,
      hasUploadedInfo: !!uploadedInfo,
      currentStep
    });

    if (generatedData && !isUploading && !uploadedInfo && currentStep === 'generating') {
      console.log('📤 [GenerateDatasetForm] Transitioning to uploading step');
      setCurrentStep('uploading');
      uploadGeneratedData();
    }
  }, [generatedData, isUploading, uploadedInfo, currentStep]);

  useEffect(() => {
    console.log('🔄 [GenerateDatasetForm] Checking publishing transition:', {
      hasUploadedInfo: !!uploadedInfo,
      uploadedInfo,
      isPublishing,
      currentStep
    });

    if (uploadedInfo && !isPublishing && currentStep === 'uploading') {
      console.log('🚀 [GenerateDatasetForm] Transitioning to publishing step');
      setCurrentStep('publishing');
      publishDataset();
    }
  }, [uploadedInfo, isPublishing, currentStep]);

  const loadModels = async () => {
    if (!watchAiProvider) return;
    
    setModelsLoading(true);
    setModelsError(null);
    try {
      const modelList = await getModels(watchAiProvider);
      setModels(modelList);
      if (modelList.length > 0 && !form.getValues("modelId")) {
        form.setValue("modelId", modelList[0].id);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setModelsError('Failed to load models');
      toast.error('Failed to load models');
    } finally {
      setModelsLoading(false);
    }
  };

  const handlePreview = async () => {
    const values = form.getValues();
    
    try {
      const generationRequest = {
        mode: values.generationMode,
        schemaId: values.schemaId,
        sampleCount: Math.min(values.sampleCount, 5), // Limit preview to 5 rows
        customPrompt: values.customPrompt,
        huggingFaceConfig: values.generationMode === 'augment' ? {
          datasetPath: values.datasetPath || '',
          config: values.datasetConfig,
          split: values.datasetSplit,
          inputFeature: values.inputFeature || '',
        } : undefined,
      };

      const preview = await DatasetGenerationService.previewDataset(
        generationRequest,
        values.aiProvider,
        values.modelId
      );
      
      setPreviewData(preview.data);
      toast.success('Preview generated successfully!');
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('Failed to generate preview');
    }
  };

  const uploadGeneratedData = async () => {
    if (!generatedData) return;

    try {
      console.log('📤 Uploading generated data:', {
        dataSize: JSON.stringify(generatedData).length,
        sampleCount: generatedData.length,
        firstItem: generatedData[0]
      });
      
      // Pass raw data to the upload hook - it will create the File object internally
      await uploadData(generatedData);
    } catch (error) {
      console.error('Upload failed:', error);
      setProcessError('Failed to upload dataset');
      setCurrentStep('error');
      toast.error('Failed to upload dataset');
    }
  };

  const publishDataset = async () => {
    console.log('🎯 [GenerateDatasetForm] publishDataset called with:', {
      hasUploadedInfo: !!uploadedInfo,
      hasGeneratedData: !!generatedData,
      uploadedInfo,
      generatedDataLength: generatedData?.length
    });

    if (!uploadedInfo || !generatedData) {
      console.error('❌ [GenerateDatasetForm] Missing required data for publishing:', {
        uploadedInfo,
        generatedData
      });
      return;
    }

    try {
      const values = form.getValues();
      console.log('📋 [GenerateDatasetForm] Form values for publishing:', values);

      const publishProps = {
        name: values.name,
        description: values.description,
        price: values.price,
        visibility: values.visibility,
        modelId: values.modelId,
        generatedData: generatedData, // Pass the actual generated data array directly
        commp: uploadedInfo.commp || '',
        onSuccess: () => {
          console.log('🎉 [GenerateDatasetForm] Publishing onSuccess callback triggered');
          setCurrentStep('completed');
          toast.success('Dataset published successfully!');
        }
      };

      console.log('🚀 [GenerateDatasetForm] Calling publish with props:', publishProps);
      await publish(publishProps);
      console.log('✅ [GenerateDatasetForm] publish call completed');
    } catch (error) {
      console.error('💥 [GenerateDatasetForm] Publishing failed:', error);
      setProcessError('Failed to publish dataset');
      setCurrentStep('error');
      toast.error('Failed to publish dataset');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsGenerating(true);
    setCurrentStep('generating');
    setProcessError(null);
    resetUpload();

    try {
      const generationRequest = {
        mode: values.generationMode,
        schemaId: values.schemaId,
        sampleCount: values.sampleCount,
        customPrompt: values.customPrompt,
        huggingFaceConfig: values.generationMode === 'augment' ? {
          datasetPath: values.datasetPath || '',
          config: values.datasetConfig,
          split: values.datasetSplit,
          inputFeature: values.inputFeature || '',
        } : undefined,
      };

      const result = await DatasetGenerationService.generateDataset(
        generationRequest,
        values.aiProvider,
        values.modelId,
        (progress) => {
          setGenerationProgress(progress);
        }
      );

      setGeneratedData(result.data);
      toast.success(`Generated ${result.data.length} rows successfully!`);
    } catch (error) {
      console.error('Generation failed:', error);
      setProcessError('Failed to generate dataset');
      setCurrentStep('error');
      toast.error('Failed to generate dataset');
    } finally {
      setIsGenerating(false);
    }
  };

  const isProcessing = isGenerating || isUploading || isPublishing;
  const selectedSchema = watchSchemaId ? getSchemaById(watchSchemaId) : null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Generate Synthetic Dataset</h1>
        <p className="text-muted-foreground">
          Create AI-powered synthetic datasets or augment existing HuggingFace datasets
        </p>
      </div>

      {(currentStep !== 'idle' && currentStep !== 'completed') && (
        <Card>
          <CardContent className="pt-6">
            <StepIndicator currentStep={currentStep} error={processError} />
            {isGenerating && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Generating dataset...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'completed' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Dataset generated and published successfully! You can now view it in your dashboard.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="preview" disabled={!previewData}>Preview</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Generation Mode Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Generation Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="generationMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            {GENERATION_MODES.map((mode) => (
                              <div
                                key={mode.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  field.value === mode.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => field.onChange(mode.id)}
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  <Bot className="w-5 h-5" />
                                  <h3 className="font-semibold">{mode.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{mode.description}</p>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Schema Selection for Synthetic Mode */}
              {watchGenerationMode === "synthetic" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dataset Schema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="schemaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {DATASET_SCHEMAS.map((schema) => (
                                <div
                                  key={schema.id}
                                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                    field.value === schema.id
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => field.onChange(schema.id)}
                                >
                                  <h3 className="font-semibold mb-2">{schema.name}</h3>
                                  <p className="text-sm text-muted-foreground mb-3">{schema.description}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {schema.fields.slice(0, 3).map((schemaField) => (
                                      <Badge key={schemaField.name} variant="secondary" className="text-xs">
                                        {schemaField.name}
                                      </Badge>
                                    ))}
                                    {schema.fields.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{schema.fields.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* AI Model Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aiProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MODEL_PROVIDERS.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="modelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={modelsLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={modelsLoading ? "Loading..." : "Select model"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generation Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle>Generation Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watchGenerationMode === "synthetic" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sampleCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Rows</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={10}
                                  max={10000}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Generate between 10-10,000 rows</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maxTokens"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Tokens</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={100}
                                  max={8000}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="customPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Prompt (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add custom instructions for data generation..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Override the default schema prompt with custom instructions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="datasetPath"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HuggingFace Dataset Path</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., squad, imdb" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="inputFeature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Input Feature</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., text, question" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="augmentPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Augmentation Prompt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe how to augment the existing data..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Dataset Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Dataset Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Synthetic Dataset" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your dataset..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USDC)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Set to 0 for free dataset</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibility</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="allowNFTAccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">NFT Access</FormLabel>
                          <FormDescription>
                            Allow NFT holders to access this dataset for free
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={isProcessing || !watchSchemaId}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Dataset
                </Button>
                
                <Button
                  type="submit"
                  disabled={isProcessing || !isConnected}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate & Publish
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {previewData && (
            <Card>
              <CardHeader>
                <CardTitle>Dataset Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showing {previewData.length} sample rows
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {previewData.map((row, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="text-sm font-medium mb-2">Row {index + 1}</div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(row, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Generate</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review your configuration and start the generation process
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Mode:</span> {watchGenerationMode}
                  </div>
                  <div>
                    <span className="font-medium">Schema:</span> {selectedSchema?.name || 'Custom'}
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span> {watchAiProvider}
                  </div>
                  <div>
                    <span className="font-medium">Rows:</span> {form.watch("sampleCount")}
                  </div>
                </div>
                
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isProcessing || !isConnected}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Generation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
