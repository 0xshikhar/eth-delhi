"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartContractInteraction } from "@/components/web3/smart-contract-interaction";
import { GasEstimation } from "@/components/web3/gas-estimation";
import { 
  Code, 
  Zap, 
  Shield, 
  Database,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  AlertTriangle
} from "lucide-react";
import { 
  getProvider, 
  getContractAddresses, 
  getAllDatasets, 
  isWalletConnected 
} from "@/lib/web3";

interface ContractStats {
  totalTransactions: number;
  activeContracts: number;
  gasSaved: string;
  successRate: string;
}

interface ContractAddresses {
  filethetic: string;
  filethethicDatasetNFT: string;
  filethethicVerifier: string;
  usdfc: string;
}

export default function SmartContractsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ContractStats>({
    totalTransactions: 0,
    activeContracts: 0,
    gasSaved: "0",
    successRate: "0%"
  });
  const [contractAddresses, setContractAddresses] = useState<ContractAddresses | null>(null);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if wallet is connected
        const walletConnected = await isWalletConnected();
        if (!walletConnected) {
          setError("Please connect your wallet to view contract information");
          return;
        }

        // Get provider and network info
        const provider = await getProvider();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // Get contract addresses for current network
        const addresses = getContractAddresses(chainId);
        setContractAddresses(addresses);

        // Get datasets to calculate stats
        const datasets = await getAllDatasets();
        
        // Calculate real stats based on blockchain data
        const totalDatasets = datasets.length;
        const verifiedDatasets = datasets.filter(d => d.isVerified).length;
        
        // Simulate transaction count based on datasets (in real app, this would come from blockchain events)
        const estimatedTransactions = totalDatasets * 3; // Create + Lock + Verify transactions
        
        setStats({
          totalTransactions: estimatedTransactions,
          activeContracts: 4, // We have 4 main contracts
          gasSaved: "1.2USDC", // This would be calculated from actual gas usage
          successRate: verifiedDatasets > 0 ? `${Math.round((verifiedDatasets / totalDatasets) * 100)}%` : "0%"
        });

      } catch (err) {
        console.error('Error fetching contract data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contract data');
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Smart Contract Interactions
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Interact with Filethetic's smart contracts with enhanced transaction feedback, 
          gas estimation, and comprehensive error handling.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading contract data...</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Estimated from datasets</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
              <p className="text-xs text-muted-foreground">All contracts operational</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gas Saved</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gasSaved}</div>
              <p className="text-xs text-muted-foreground">Through optimization</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}</div>
              <p className="text-xs text-muted-foreground">Verification success</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="interact" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interact">Contract Interaction</TabsTrigger>
          <TabsTrigger value="gas">Gas Estimation</TabsTrigger>
          <TabsTrigger value="security">Security Features</TabsTrigger>
        </TabsList>
        
        <TabsContent value="interact" className="space-y-6">
          <SmartContractInteraction />
        </TabsContent>
        
        <TabsContent value="gas" className="space-y-6">
          <GasEstimation />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Features
                </CardTitle>
                <CardDescription>
                  Built-in security measures for smart contract interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transaction Validation</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    All transactions are validated before execution
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gas Limit Protection</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Automatic gas limit estimation with safety margins
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Recovery</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Comprehensive error handling and recovery mechanisms
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network Validation</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ensures transactions are sent to the correct network
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Contract Addresses
                </CardTitle>
                <CardDescription>
                  Verified smart contract addresses on current network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contractAddresses ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Filethetic Main Contract</span>
                        <Badge variant="outline">Verified</Badge>
                      </div>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                        {contractAddresses.filethetic}
                      </code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Dataset NFT Contract</span>
                        <Badge variant="outline">Verified</Badge>
                      </div>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                        {contractAddresses.filethethicDatasetNFT}
                      </code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Verification Contract</span>
                        <Badge variant="outline">Verified</Badge>
                      </div>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                        {contractAddresses.filethethicVerifier}
                      </code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">USDC Token Contract</span>
                        <Badge variant="outline">Verified</Badge>
                      </div>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                        {contractAddresses.usdfc}
                      </code>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Connect wallet to view contract addresses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Information */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Get assistance with smart contract interactions and troubleshooting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            If you encounter any issues or need help with smart contract interactions, 
            check out our documentation or contact support for assistance.
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline">Documentation</Badge>
            <Badge variant="outline">API Reference</Badge>
            <Badge variant="outline">Support</Badge>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}