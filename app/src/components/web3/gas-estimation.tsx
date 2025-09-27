"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  isWalletConnected,
  getWalletAddress
} from "@/lib/web3";
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: string;
  estimatedCostUSD?: string;
  confidence: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

interface GasEstimationProps {
  contractAddress?: string;
  functionName?: string;
  functionData?: string;
  value?: string;
  onEstimateReady?: (estimate: GasEstimate) => void;
  showDetailedBreakdown?: boolean;
}

export function GasEstimation({
  contractAddress,
  functionName,
  functionData,
  value = "0",
  onEstimateReady,
  showDetailedBreakdown = true
}: GasEstimationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<GasEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gasPriceHistory, setGasPriceHistory] = useState<number[]>([]);

  // Check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await isWalletConnected();
      setIsConnected(connected);
      if (connected) {
        const address = await getWalletAddress();
        setAccount(address);
      }
    };
    checkConnection();
  }, []);

  // Mock gas price history for demonstration
  useEffect(() => {
    // In a real implementation, this would fetch historical gas prices
    const mockHistory = Array.from({ length: 24 }, (_, i) => 
      Math.floor(Math.random() * 50) + 20 + Math.sin(i / 4) * 10
    );
    setGasPriceHistory(mockHistory);
  }, []);

  const performGasEstimation = async () => {
    if (!isConnected || !contractAddress || !functionData) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock gas estimation - in real implementation, this would use ethers.js
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      const mockEstimate: GasEstimate = {
        gasLimit: BigInt(150000),
        gasPrice: BigInt(25000000000), // 25 gwei
        maxFeePerGas: BigInt(30000000000), // 30 gwei
        maxPriorityFeePerGas: BigInt(2000000000), // 2 gwei
        estimatedCost: "0.00375", // ETH
        estimatedCostUSD: "8.25", // USD
        confidence: 'high',
        estimatedTime: "2-3 minutes"
      };

      setEstimate(mockEstimate);
      onEstimateReady?.(mockEstimate);

    } catch (err: any) {
      console.error('Gas estimation failed:', err);
      setError(err.message || 'Failed to estimate gas');
      toast.error('Failed to estimate transaction cost');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contractAddress && functionData) {
      performGasEstimation();
    }
  }, [contractAddress, functionData, value]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const formatGwei = (wei: bigint) => {
    return (Number(wei) / 1e9).toFixed(2);
  };

  const formatEth = (wei: bigint) => {
    return (Number(wei) / 1e18).toFixed(6);
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Connect your wallet to see gas estimates
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Gas Estimation
          </CardTitle>
          <CardDescription>
            Estimated transaction costs and timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : estimate ? (
            <div className="space-y-4">
              {/* Main Cost Display */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {estimate.estimatedCost} ETH
                  </div>
                  {estimate.estimatedCostUSD && (
                    <div className="text-sm text-gray-600">
                      ≈ ${estimate.estimatedCostUSD} USD
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <Badge className={`${getConfidenceColor(estimate.confidence)} mb-2`}>
                    {getConfidenceIcon(estimate.confidence)}
                    <span className="ml-1 capitalize">{estimate.confidence} Confidence</span>
                  </Badge>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {estimate.estimatedTime}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              {showDetailedBreakdown && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Gas Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gas Limit:</span>
                        <span className="font-mono">{estimate.gasLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gas Price:</span>
                        <span className="font-mono">{formatGwei(estimate.gasPrice)} gwei</span>
                      </div>
                      {estimate.maxFeePerGas && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Fee:</span>
                          <span className="font-mono">{formatGwei(estimate.maxFeePerGas)} gwei</span>
                        </div>
                      )}
                      {estimate.maxPriorityFeePerGas && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority Fee:</span>
                          <span className="font-mono">{formatGwei(estimate.maxPriorityFeePerGas)} gwei</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Network Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Network:</span>
                        <span>Filethetic Network</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Gas:</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-red-500" />
                          High
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Congestion:</span>
                        <Badge variant="outline" className="text-xs">
                          Moderate
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gas Price Trend */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">24h Gas Price Trend</h4>
                <div className="h-16 flex items-end gap-1">
                  {gasPriceHistory.map((price, index) => (
                    <div
                      key={index}
                      className="bg-blue-200 rounded-t"
                      style={{
                        height: `${(price / Math.max(...gasPriceHistory)) * 100}%`,
                        width: `${100 / gasPriceHistory.length}%`
                      }}
                      title={`${price} gwei`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>24h ago</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={performGasEstimation}
                  disabled={isLoading}
                >
                  <Fuel className="h-4 w-4 mr-2" />
                  Refresh Estimate
                </Button>
                
                {estimate.confidence === 'low' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Implement gas price adjustment
                      toast.info('Gas price adjustment coming soon');
                    }}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Adjust Gas
                  </Button>
                )}
              </div>

              {/* Warnings */}
              {estimate.confidence === 'low' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Low confidence estimate. Network congestion may cause higher costs or delays.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Fuel className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Provide transaction details to estimate gas costs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for using gas estimation in other components
export function useGasEstimation() {
  const [estimate, setEstimate] = useState<GasEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimateGas = async (
    contractAddress: string,
    functionData: string,
    value: string = "0"
  ): Promise<GasEstimate | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation - replace with actual gas estimation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockEstimate: GasEstimate = {
        gasLimit: BigInt(150000),
        gasPrice: BigInt(25000000000),
        maxFeePerGas: BigInt(30000000000),
        maxPriorityFeePerGas: BigInt(2000000000),
        estimatedCost: "0.00375",
        estimatedCostUSD: "8.25",
        confidence: 'high',
        estimatedTime: "2-3 minutes"
      };

      setEstimate(mockEstimate);
      return mockEstimate;

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to estimate gas';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    estimate,
    isLoading,
    error,
    estimateGas
  };
}