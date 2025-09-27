"use client";

import React, { useState } from 'react';
import { DemoDashboard } from '@/components/demo/demo-dashboard';
import { DatasetPreview } from '@/components/demo/dataset-preview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Presentation, 
  Database, 
  Play, 
  Settings,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import Link from 'next/link';

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showDatasetPreview, setShowDatasetPreview] = useState(false);

  const handleStartDemo = (scenarioId: string) => {
    setActiveDemo(scenarioId);
    // You could add logic here to navigate to specific parts of the app
    console.log(`Starting demo scenario: ${scenarioId}`);
  };

  const handleDatasetPurchase = (datasetId: string) => {
    console.log(`Purchasing dataset: ${datasetId}`);
    // Add purchase logic here
  };

  const handleDatasetDownload = (datasetId: string) => {
    console.log(`Downloading dataset preview: ${datasetId}`);
    // Add download logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Demo Center
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Demo Mode Active
            </Badge>
            <Link href="/marketplace">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowDatasetPreview(false)}>
            <CardContent className="p-6 text-center">
              <Presentation className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold mb-2">Demo Scenarios</h3>
              <p className="text-sm text-muted-foreground">Interactive presentation guides</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowDatasetPreview(true)}>
            <CardContent className="p-6 text-center">
              <Database className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold mb-2">Dataset Previews</h3>
              <p className="text-sm text-muted-foreground">Explore sample datasets</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-semibold mb-2">Demo Settings</h3>
              <p className="text-sm text-muted-foreground">Configure presentation mode</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={showDatasetPreview ? "datasets" : "scenarios"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="scenarios" 
              onClick={() => setShowDatasetPreview(false)}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Demo Scenarios
            </TabsTrigger>
            <TabsTrigger 
              value="datasets" 
              onClick={() => setShowDatasetPreview(true)}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Dataset Previews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            <DemoDashboard onStartDemo={handleStartDemo} />
          </TabsContent>

          <TabsContent value="datasets">
            <DatasetPreview 
              onPurchase={handleDatasetPurchase}
              onDownload={handleDatasetDownload}
            />
          </TabsContent>
        </Tabs>

        {/* Demo Status */}
        {activeDemo && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Play className="w-5 h-5" />
                Active Demo Session
              </CardTitle>
              <CardDescription>
                Demo scenario "{activeDemo}" is currently active. Use the demo dashboard to navigate through steps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveDemo(null)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  End Demo Session
                </Button>
                <Link href="/marketplace">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Go to Live Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            This is the Filethetic Demo Center. Use this interface to prepare and deliver compelling demonstrations
            of the decentralized synthetic data marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}