"use client";

import React from 'react';
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
  Activity
} from "lucide-react";

export default function SmartContractsPage() {
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">All contracts operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Saved</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">Through optimization</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Transaction success</p>
          </CardContent>
        </Card>
      </div>

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
                  Verified smart contract addresses on Filethetic Network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dataset Registry</span>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                    0x742d35Cc6634C0532925a3b8D4C9db...
                  </code>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">USDFC Token</span>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                    0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063...
                  </code>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Verification Oracle</span>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                    0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984...
                  </code>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Marketplace</span>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D...
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Information */}
      <Card>
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
      </Card>
    </div>
  );
}