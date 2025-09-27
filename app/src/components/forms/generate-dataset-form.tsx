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
import { Loader2, Database, Bot, ArrowRight, CheckCircle, AlertCircle, Clock, Upload, Zap } from 'lucide-react';
import { DATASET_TEMPLATES, DatasetTemplate, Model, GenerationResult, getModels, MODEL_PROVIDERS, GenerationConfig } from '@/lib/models';
import { generateSyntheticDataset } from '@/lib/generation';
import { TemplateList } from '@/components/ui/template-card';
import { useDataUpload } from '@/hooks/storage/useDataUpload';
import { useDatasetPublisher } from '@/hooks/blockchain/useDatasetPublisher';

// Define the form schema
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
  modelId: z.string().min(1, {
    message: "Model is required",
  }),
  datasetPath: z.string().min(1, {
    message: "Dataset path is required",
  }),
  datasetConfig: z.string().default("default"),
  datasetSplit: z.string().default("train"),
  inputFeature: z.string().min(1, {
    message: "Input feature is required",
  }),
  prompt: z.string().min(10, {
    message: "Prompt template must be at least 10 characters",
  }),
  maxTokens: z.number().min(1000, {
    message: "Max tokens must be at least 1000",
  }),
});

type ProcessStep = 'idle' | 'generating' | 'uploading' | 'publishing' | 'completed' | 'error';

interface StepIndicatorProps {
  currentStep: ProcessStep;
  error?: string | null;
}

function StepIndicator({ currentStep, error }: StepIndicatorProps) {
  const steps = [
    { id: 'generating', label: 'Generate Data', icon: Bot },
    { id: 'uploading', label: 'Upload to Filecoin', icon: Upload },
    { id: 'publishing', label: 'Publish On-Chain', icon: Zap },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (currentStep === 'error') return 'error';
    if (currentStep === 'completed') return 'completed';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-lg">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
              status === 'active' ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
              status === 'error' ? 'bg-red-500 border-red-500 text-white' :
              'bg-muted border-muted-foreground/30 text-muted-foreground'
            }`}>
              {status === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : status === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : status === 'active' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                status === 'active' ? 'text-blue-600' :
                status === 'completed' ? 'text-green-600' :
                status === 'error' ? 'text-red-600' :
                'text-muted-foreground'
              }`}>
                {step.label}
              </p>
              {status === 'active' && (
                <p className="text-xs text-muted-foreground">In progress...</p>
              )}
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

  const [activeTab, setActiveTab] = useState<string>("template");
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedData, setGeneratedData] = useState<GenerationResult[] | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessStep>('idle');
  const [processError, setProcessError] = useState<string | null>(null);

  // Memoize resetUpload to stabilize useEffect dependencies
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
      modelId: "",
      prompt: "",
      maxTokens: 10000,
      inputFeature: "",
      datasetPath: "",
      datasetConfig: "",
      datasetSplit: "",
    },
  });

  useEffect(() => {
    loadModels();
  }, []);

  // Effect to upload data after it has been generated
  useEffect(() => {
    if (generatedData && !isUploading && !uploadedInfo && currentStep === 'generating') {
      setCurrentStep('uploading');
      const toastId = toast.loading("Uploading dataset to Filecoin...");
      uploadData(generatedData, {
        onSuccess: () => {
          toast.success("Dataset uploaded successfully!", { id: toastId });
        },
        onError: (error) => {
          setCurrentStep('error');
          setProcessError(`Upload failed: ${error.message}`);
          toast.error(`Upload failed: ${error.message}`, { id: toastId });
        },
      });
    }
  }, [generatedData, isUploading, uploadedInfo, uploadData, currentStep]);

  // Effect to publish dataset on-chain after it has been uploaded
  useEffect(() => {
    if (uploadedInfo?.commp && !isPublishing && !isPublished && generatedData && currentStep === 'uploading') {
      if (!address) {
        setCurrentStep('error');
        setProcessError("Wallet not connected. Cannot publish dataset.");
        toast.error("Wallet not connected. Cannot publish dataset.");
        return;
      }
      
      setCurrentStep('publishing');
      const formValues = form.getValues();
      console.log('Form values being passed to publish:', formValues);
      console.log('Generated data sample:', generatedData?.slice(0, 2));
      console.log('Upload info:', uploadedInfo);
      
      publish({
        ...formValues,
        generatedData,
        commp: uploadedInfo.commp,
        onSuccess: () => {
          setCurrentStep('completed');
          toast.success("Dataset published successfully!");
          setIsPublished(true);
          form.reset();
          setGeneratedData(null);
          resetUpload();
          // Reset to idle after a delay
          setTimeout(() => {
            setCurrentStep('idle');
            setIsPublished(false);
          }, 3000);
        },
      }).catch((error: any) => {
        setCurrentStep('error');
        setProcessError(`Publishing failed: ${error.message}`);
        toast.error(`Publishing failed: ${error.message}`);
      });
    }
  }, [uploadedInfo, isPublishing, isPublished, generatedData, publish, form, address, resetUpload, currentStep]);

  async function loadModels() {
    setModelsLoading(true);
    setModelsError(null);
    try {
      const allModelsPromises = MODEL_PROVIDERS.map(provider => getModels(provider.id));
      const modelsByProvider = await Promise.all(allModelsPromises);
      const allModels = modelsByProvider.flat();
      setModels(allModels);
      toast.success("Models loaded successfully!");
    } catch (error: any) {
      console.error("Failed to load models:", error);
      setModelsError(error.message || "Failed to load models.");
      toast.error(error.message || "Failed to load models.");
    } finally {
      setModelsLoading(false);
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to generate a dataset.");
      return;
    }

    setCurrentStep('generating');
    setProcessError(null);
    const toastId = toast.loading("Starting dataset generation...");
    setIsGenerating(true);
    setGeneratedData(null);
    setGenerationProgress(0);

    const generationConfig: GenerationConfig = {
      model: values.modelId,
      prompt: values.prompt,
      inputFeature: values.inputFeature,
      maxTokens: values.maxTokens,
      temperature: 0.7, // Default temperature
    };

    try {
      const { results } = await generateSyntheticDataset(
        values.datasetPath,
        values.datasetConfig,
        values.datasetSplit,
        generationConfig
      );
      setGeneratedData(results);
      setGenerationProgress(100);
      toast.success("Dataset generated successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Generation failed:", error);
      setCurrentStep('error');
      setProcessError(`Generation failed: ${error.message}`);
      toast.error("Dataset generation failed. Please check the console for details.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (template: DatasetTemplate) => {
    form.reset({
      ...form.getValues(), // keep existing values
      prompt: template.prompt,
      inputFeature: template.inputFeature,
      maxTokens: template.maxTokens,
      datasetPath: template.datasetSource.path,
      datasetConfig: template.datasetSource.config,
      datasetSplit: template.datasetSource.split,
      modelId: template.recommendedModel,
      price: String(template.price),
      name: template.name,
      description: template.description,
    });
    setActiveTab("customize");
    toast.info(`Template "${template.name}" selected. Configure your model.`);
  };

  const resetProcess = () => {
    setCurrentStep('idle');
    setProcessError(null);
    setGeneratedData(null);
    setIsPublished(false);
    resetUpload();
  };

  const isProcessing = currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'error';

  return (
    <div className="space-y-8">
      {/* Connection Status */}
      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to generate and publish datasets.
          </AlertDescription>
        </Alert>
      )}

      {/* Process Steps Indicator */}
      {(isProcessing || currentStep === 'completed' || currentStep === 'error') && (
        <StepIndicator currentStep={currentStep} error={processError} />
      )}

      {/* Error Display */}
      {processError && currentStep === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{processError}</span>
            <Button variant="outline" size="sm" onClick={resetProcess}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {currentStep === 'completed' && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Dataset successfully generated and published! Check your profile to view it.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="template" disabled={isProcessing}>
            <Database className="w-4 h-4 mr-2" />
            Choose Template
          </TabsTrigger>
          <TabsTrigger value="customize" disabled={isProcessing}>
            <Bot className="w-4 h-4 mr-2" />
            Customize & Generate
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="template" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Select a Template</h2>
                <p className="text-muted-foreground">
                  Choose a predefined template to quickly generate a synthetic dataset
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Quick Start
              </Badge>
            </div>
            <TemplateList templates={DATASET_TEMPLATES} onSelect={handleTemplateSelect} />
          </div>
        </TabsContent>
        
        <TabsContent value="customize" className="space-y-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <Input placeholder="My Synthetic Dataset" {...field} disabled={isProcessing} />
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
                              disabled={isProcessing}
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
                                step="0.01" 
                                placeholder="0.00" 
                                {...field} 
                                disabled={isProcessing}
                              />
                            </FormControl>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select visibility" />
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">NFT Access</FormLabel>
                            <FormDescription>
                              Allow NFT holders to access this dataset
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isProcessing}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      AI Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="modelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Model
                            {modelsLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isProcessing || modelsLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select a model"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {model.provider}
                                    </Badge>
                                    {model.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {modelsError && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {modelsError}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="datasetPath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dataset Path</FormLabel>
                            <FormControl>
                              <Input placeholder="dataset/path" {...field} disabled={isProcessing} />
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
                              <Input placeholder="text" {...field} disabled={isProcessing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prompt Template</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Use {input} as a placeholder for the dataset value" 
                              className="min-h-[100px]"
                              {...field} 
                              disabled={isProcessing}
                            />
                          </FormControl>
                          <FormDescription>
                            Use {'{input}'} as a placeholder for the dataset value
                          </FormDescription>
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
                              step="1000" 
                              placeholder="10000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                              disabled={isProcessing}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of tokens to generate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Progress Display */}
              {isProcessing && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {currentStep === 'generating' && `Generation Progress: ${generationProgress}%`}
                      {currentStep === 'uploading' && uploadStatus}
                      {currentStep === 'publishing' && 'Publishing dataset on-chain...'}
                    </p>
                    <Badge variant="secondary" className="animate-pulse">
                      {currentStep === 'generating' && 'Generating'}
                      {currentStep === 'uploading' && 'Uploading'}
                      {currentStep === 'publishing' && 'Publishing'}
                    </Badge>
                  </div>
                  <Progress 
                    value={
                      currentStep === 'generating' ? generationProgress : 
                      currentStep === 'uploading' ? uploadProgress : 
                      undefined
                    } 
                    className="w-full" 
                  />
                </div>
              )}

              {/* Generated Data Preview */}
              {generatedData && !isProcessing && (
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold">Generated Data Preview</h4>
                    <Badge variant="secondary">{generatedData.length} samples</Badge>
                  </div>
                  <pre className="text-xs overflow-auto max-h-48 bg-background p-3 rounded border">
                    {JSON.stringify(generatedData.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}

              {/* Upload Info */}
              {uploadedInfo && (
                <div className="mt-4 p-4 border rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <h4 className="font-semibold">Upload Complete!</h4>
                  </div>
                  {uploadedInfo.commp && <p className="text-xs font-mono break-all">Commp: {uploadedInfo.commp}</p>}
                  {uploadedInfo.txHash && <p className="text-xs font-mono break-all">Tx: {uploadedInfo.txHash}</p>}
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  disabled={isProcessing || !isConnected || modelsLoading}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentStep === 'generating' && "Generating..."}
                      {currentStep === 'uploading' && "Uploading..."}
                      {currentStep === 'publishing' && "Publishing..."}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate & Publish Dataset
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
