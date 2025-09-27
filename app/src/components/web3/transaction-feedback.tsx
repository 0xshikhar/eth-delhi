"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  ExternalLink, 
  Copy, 
  AlertTriangle,
  Zap,
  DollarSign,
  Timer
} from "lucide-react";
import { toast } from "sonner";

export interface TransactionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  txHash?: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  error?: string;
}

interface TransactionFeedbackProps {
  steps: TransactionStep[];
  currentStep: number;
  onRetry?: (stepId: string) => void;
  onCancel?: () => void;
  showGasEstimate?: boolean;
  estimatedGas?: string;
  networkName?: string;
  explorerUrl?: string;
}

export function TransactionFeedback({
  steps,
  currentStep,
  onRetry,
  onCancel,
  showGasEstimate = true,
  estimatedGas,
  networkName = "Ethereum",
  explorerUrl = "https://etherscan.io"
}: TransactionFeedbackProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const getStepIcon = (step: TransactionStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (step.status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else if (step.status === 'in_progress') {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    } else if (index < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepStatus = (step: TransactionStep, index: number) => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'failed') return 'failed';
    if (step.status === 'in_progress') return 'in_progress';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'in_progress';
    return 'pending';
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (error) {
      toast.error(`Failed to copy ${type}`);
    }
  };

  const openInExplorer = (txHash: string) => {
    window.open(`${explorerUrl}/tx/${txHash}`, '_blank');
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const failedSteps = steps.filter(step => step.status === 'failed').length;
  const progress = (completedSteps / steps.length) * 100;

  const currentStepData = steps[currentStep];
  const isCompleted = completedSteps === steps.length;
  const hasFailed = failedSteps > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : hasFailed ? (
                <XCircle className="h-6 w-6 text-red-500" />
              ) : (
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              )}
              Transaction Progress
            </CardTitle>
            <CardDescription>
              {isCompleted 
                ? "All transactions completed successfully"
                : hasFailed
                ? "Some transactions failed"
                : `Processing step ${currentStep + 1} of ${steps.length}`
              }
            </CardDescription>
          </div>
          <Badge variant={isCompleted ? "default" : hasFailed ? "destructive" : "secondary"}>
            {completedSteps}/{steps.length} Complete
          </Badge>
        </div>
        
        <Progress value={progress} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Gas Estimate */}
        {showGasEstimate && estimatedGas && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Estimated gas cost: {estimatedGas} ETH</span>
              <Badge variant="outline" className="ml-2">
                {networkName}
              </Badge>
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step, index);
            
            return (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-all ${
                  status === 'in_progress' 
                    ? 'border-blue-200 bg-blue-50' 
                    : status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : status === 'failed'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStepIcon(step, index)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      {status === 'in_progress' && (
                        <Badge variant="secondary" className="text-xs">
                          <Timer className="h-3 w-3 mr-1" />
                          Processing
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    {/* Transaction Details */}
                    {step.txHash && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Transaction Hash:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {step.txHash.slice(0, 10)}...{step.txHash.slice(-8)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(step.txHash!, 'Transaction hash')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => openInExplorer(step.txHash!)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {step.gasUsed && (
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Gas Used: {step.gasUsed}</span>
                            {step.gasPrice && <span>Gas Price: {step.gasPrice} Gwei</span>}
                            {step.blockNumber && <span>Block: {step.blockNumber}</span>}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {step.status === 'failed' && step.error && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {step.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Retry Button */}
                    {step.status === 'failed' && onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => onRetry(step.id)}
                      >
                        Retry Transaction
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          {onCancel && !isCompleted && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            {isCompleted && (
              <Button variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            )}
            
            {hasFailed && onRetry && (
              <Button variant="destructive" onClick={() => {
                const failedStep = steps.find(step => step.status === 'failed');
                if (failedStep) onRetry(failedStep.id);
              }}>
                Retry Failed
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        {isCompleted && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All transactions have been completed successfully. Your changes are now live on the blockchain.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for managing transaction state
export function useTransactionFeedback() {
  const [steps, setSteps] = useState<TransactionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const initializeSteps = (stepDefinitions: Omit<TransactionStep, 'status'>[]) => {
    setSteps(stepDefinitions.map(step => ({ ...step, status: 'pending' })));
    setCurrentStep(0);
  };

  const updateStep = (stepId: string, updates: Partial<TransactionStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const setStepInProgress = (stepId: string) => {
    updateStep(stepId, { status: 'in_progress' });
  };

  const setStepCompleted = (stepId: string, txHash?: string, gasUsed?: string, blockNumber?: number) => {
    updateStep(stepId, { 
      status: 'completed', 
      txHash, 
      gasUsed, 
      blockNumber 
    });
    nextStep();
  };

  const setStepFailed = (stepId: string, error: string) => {
    updateStep(stepId, { status: 'failed', error });
  };

  const reset = () => {
    setSteps([]);
    setCurrentStep(0);
  };

  return {
    steps,
    currentStep,
    initializeSteps,
    updateStep,
    nextStep,
    setStepInProgress,
    setStepCompleted,
    setStepFailed,
    reset
  };
}