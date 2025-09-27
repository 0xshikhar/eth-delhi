"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TransactionFeedback, useTransactionFeedback, TransactionStep } from "./transaction-feedback";
import { 
  createDataset, 
  purchaseDataset, 
  lockDataset, 
  verifyDataset,
  getDataset,
  getAllDatasets,
  connectWallet,
  isWalletConnected,
  getWalletAddress
} from "@/lib/web3";
import { 
  Database, 
  ShoppingCart, 
  Lock, 
  Shield, 
  Search,
  Upload,
  DollarSign,
  FileText,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface CreateDatasetForm {
  name: string;
  description: string;
  price: string;
  isPublic: boolean;
  modelName: string;
  taskId: number;
  nodeId: number;
  computeUnitsPrice: number;
  maxComputeUnits: number;
}

interface PurchaseDatasetForm {
  datasetId: number;
  price: string;
}

interface LockDatasetForm {
  datasetId: number;
  cid: string;
  numRows: number;
  numTokens: number;
}

interface VerifyDatasetForm {
  datasetId: number;
  datasetHash: string;
  signature: string;
  signerAddress: string;
}

export function SmartContractInteraction() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  
  // Check wallet connection on mount
  React.useEffect(() => {
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

  const {
    steps,
    currentStep,
    initializeSteps,
    setStepInProgress,
    setStepCompleted,
    setStepFailed,
    reset
  } = useTransactionFeedback();

  // Form states
  const [createForm, setCreateForm] = useState<CreateDatasetForm>({
    name: '',
    description: '',
    price: '0',
    isPublic: true,
    modelName: 'gpt-4',
    taskId: 1,
    nodeId: 1,
    computeUnitsPrice: 100,
    maxComputeUnits: 1000000
  });

  const [purchaseForm, setPurchaseForm] = useState<PurchaseDatasetForm>({
    datasetId: 0,
    price: '0'
  });

  const [lockForm, setLockForm] = useState<LockDatasetForm>({
    datasetId: 0,
    cid: '',
    numRows: 0,
    numTokens: 0
  });

  const [verifyForm, setVerifyForm] = useState<VerifyDatasetForm>({
    datasetId: 0,
    datasetHash: '',
    signature: '',
    signerAddress: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  // Create Dataset Transaction
  const handleCreateDataset = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    reset();

    const transactionSteps: Omit<TransactionStep, 'status'>[] = [
      {
        id: 'estimate',
        title: 'Estimating Gas',
        description: 'Calculating transaction costs'
      },
      {
        id: 'create',
        title: 'Creating Dataset',
        description: 'Submitting dataset creation transaction'
      },
      {
        id: 'confirm',
        title: 'Confirming Transaction',
        description: 'Waiting for blockchain confirmation'
      }
    ];

    initializeSteps(transactionSteps);

    try {
      // Step 1: Estimate gas
      setStepInProgress('estimate');
      
      // Note: Gas estimation would be done here in a real implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate estimation
      
      setStepCompleted('estimate');

      // Step 2: Create dataset
      setStepInProgress('create');
      
      const result = await createDataset(
        createForm.name,
        createForm.description,
        createForm.price,
        createForm.isPublic,
        createForm.modelName,
        createForm.taskId,
        createForm.nodeId,
        createForm.computeUnitsPrice,
        createForm.maxComputeUnits
      );

      setStepCompleted('create', result.receipt.hash);

      // Step 3: Confirm transaction
      setStepInProgress('confirm');
      
      // Wait for confirmation (already done in createDataset)
      setStepCompleted('confirm', result.receipt.hash, 
        result.receipt.gasUsed?.toString(), 
        result.receipt.blockNumber
      );

      toast.success(`Dataset created successfully! ID: ${result.datasetId}`);
      
      // Reset form
      setCreateForm({
        name: '',
        description: '',
        price: '0',
        isPublic: true,
        modelName: 'gpt-4',
        taskId: 1,
        nodeId: 1,
        computeUnitsPrice: 100,
        maxComputeUnits: 1000000
      });

    } catch (error: any) {
      console.error('Error creating dataset:', error);
      setStepFailed(steps[currentStep]?.id || 'create', error.message || 'Transaction failed');
      toast.error('Failed to create dataset');
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase Dataset Transaction
  const handlePurchaseDataset = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    reset();

    const transactionSteps: Omit<TransactionStep, 'status'>[] = [
      {
        id: 'approve',
        title: 'Approve USDC',
        description: 'Approving USDC token transfer'
      },
      {
        id: 'purchase',
        title: 'Purchase Dataset',
        description: 'Completing dataset purchase'
      }
    ];

    initializeSteps(transactionSteps);

    try {
      setStepInProgress('approve');
      
      const result = await purchaseDataset(purchaseForm.datasetId, purchaseForm.price);
      
      setStepCompleted('approve');
      setStepInProgress('purchase');
      setStepCompleted('purchase', result.hash, result.gasUsed?.toString(), result.blockNumber);

      toast.success('Dataset purchased successfully!');
      
    } catch (error: any) {
      console.error('Error purchasing dataset:', error);
      setStepFailed(steps[currentStep]?.id || 'purchase', error.message || 'Transaction failed');
      toast.error('Failed to purchase dataset');
    } finally {
      setIsLoading(false);
    }
  };

  // Lock Dataset Transaction
  const handleLockDataset = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    reset();

    const transactionSteps: Omit<TransactionStep, 'status'>[] = [
      {
        id: 'lock',
        title: 'Lock Dataset',
        description: 'Locking dataset with IPFS CID'
      }
    ];

    initializeSteps(transactionSteps);

    try {
      setStepInProgress('lock');
      
      const result = await lockDataset(
        lockForm.datasetId,
        lockForm.cid,
        lockForm.numRows,
        lockForm.numTokens
      );
      
      setStepCompleted('lock', result.hash, result.gasUsed?.toString(), result.blockNumber);
      toast.success('Dataset locked successfully!');
      
    } catch (error: any) {
      console.error('Error locking dataset:', error);
      setStepFailed('lock', error.message || 'Transaction failed');
      toast.error('Failed to lock dataset');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Dataset Transaction
  const handleVerifyDataset = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    reset();

    const transactionSteps: Omit<TransactionStep, 'status'>[] = [
      {
        id: 'verify',
        title: 'Verify Dataset',
        description: 'Submitting verification with cryptographic proof'
      }
    ];

    initializeSteps(transactionSteps);

    try {
      setStepInProgress('verify');
      
      const result = await verifyDataset(
        verifyForm.datasetId,
        verifyForm.datasetHash,
        verifyForm.signature,
        verifyForm.signerAddress
      );
      
      setStepCompleted('verify', result.hash, result.gasUsed?.toString(), result.blockNumber);
      toast.success('Dataset verified successfully!');
      
    } catch (error: any) {
      console.error('Error verifying dataset:', error);
      setStepFailed('verify', error.message || 'Transaction failed');
      toast.error('Failed to verify dataset');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Database className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600">
                Please connect your wallet to interact with smart contracts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Connected to Filethetic Network as {account?.slice(0, 6)}...{account?.slice(-4)}
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="purchase" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchase
          </TabsTrigger>
          <TabsTrigger value="lock" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Lock
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verify
          </TabsTrigger>
        </TabsList>

        {/* Create Dataset Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Create New Dataset
              </CardTitle>
              <CardDescription>
                Create a new dataset on the blockchain with metadata and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Dataset Name</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter dataset name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USDC)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={createForm.price}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your dataset"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelName">Model Name</Label>
                  <Input
                    id="modelName"
                    value={createForm.modelName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, modelName: e.target.value }))}
                    placeholder="gpt-4"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taskId">Task ID</Label>
                  <Input
                    id="taskId"
                    type="number"
                    value={createForm.taskId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, taskId: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nodeId">Node ID</Label>
                  <Input
                    id="nodeId"
                    type="number"
                    value={createForm.nodeId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, nodeId: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={createForm.isPublic}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">Make dataset public (sellable)</Label>
              </div>

              <Button 
                onClick={handleCreateDataset} 
                disabled={isLoading || !createForm.name || !createForm.description}
                className="w-full"
              >
                <Database className="h-4 w-4 mr-2" />
                Create Dataset
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Dataset Tab */}
        <TabsContent value="purchase" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Dataset
              </CardTitle>
              <CardDescription>
                Purchase access to an existing dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDatasetId">Dataset ID</Label>
                  <Input
                    id="purchaseDatasetId"
                    type="number"
                    value={purchaseForm.datasetId}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, datasetId: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter dataset ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Price (USDC)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={purchaseForm.price}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Button 
                onClick={handlePurchaseDataset} 
                disabled={isLoading || !purchaseForm.datasetId}
                className="w-full"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Purchase Dataset
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lock Dataset Tab */}
        <TabsContent value="lock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Lock Dataset
              </CardTitle>
              <CardDescription>
                Lock dataset with IPFS CID and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lockDatasetId">Dataset ID</Label>
                  <Input
                    id="lockDatasetId"
                    type="number"
                    value={lockForm.datasetId}
                    onChange={(e) => setLockForm(prev => ({ ...prev, datasetId: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter dataset ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cid">IPFS CID</Label>
                  <Input
                    id="cid"
                    value={lockForm.cid}
                    onChange={(e) => setLockForm(prev => ({ ...prev, cid: e.target.value }))}
                    placeholder="QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numRows">Number of Rows</Label>
                  <Input
                    id="numRows"
                    type="number"
                    value={lockForm.numRows}
                    onChange={(e) => setLockForm(prev => ({ ...prev, numRows: parseInt(e.target.value) || 0 }))}
                    placeholder="1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numTokens">Number of Tokens</Label>
                  <Input
                    id="numTokens"
                    type="number"
                    value={lockForm.numTokens}
                    onChange={(e) => setLockForm(prev => ({ ...prev, numTokens: parseInt(e.target.value) || 0 }))}
                    placeholder="50000"
                  />
                </div>
              </div>

              <Button 
                onClick={handleLockDataset} 
                disabled={isLoading || !lockForm.datasetId || !lockForm.cid}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Lock Dataset
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verify Dataset Tab */}
        <TabsContent value="verify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verify Dataset
              </CardTitle>
              <CardDescription>
                Submit cryptographic verification for a dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="verifyDatasetId">Dataset ID</Label>
                  <Input
                    id="verifyDatasetId"
                    type="number"
                    value={verifyForm.datasetId}
                    onChange={(e) => setVerifyForm(prev => ({ ...prev, datasetId: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter dataset ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signerAddress">Signer Address</Label>
                  <Input
                    id="signerAddress"
                    value={verifyForm.signerAddress}
                    onChange={(e) => setVerifyForm(prev => ({ ...prev, signerAddress: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="datasetHash">Dataset Hash</Label>
                <Input
                  id="datasetHash"
                  value={verifyForm.datasetHash}
                  onChange={(e) => setVerifyForm(prev => ({ ...prev, datasetHash: e.target.value }))}
                  placeholder="0x..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">Signature</Label>
                <Textarea
                  id="signature"
                  value={verifyForm.signature}
                  onChange={(e) => setVerifyForm(prev => ({ ...prev, signature: e.target.value }))}
                  placeholder="0x..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleVerifyDataset} 
                disabled={isLoading || !verifyForm.datasetId || !verifyForm.datasetHash || !verifyForm.signature}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Verify Dataset
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Feedback */}
      {steps.length > 0 && (
        <TransactionFeedback
          steps={steps}
          currentStep={currentStep}
          networkName="Filethetic Network"
          explorerUrl="https://explorer.filethetic.io"
          onRetry={(stepId) => {
            // Implement retry logic based on step
            console.log('Retrying step:', stepId);
          }}
          onCancel={() => {
            reset();
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
}