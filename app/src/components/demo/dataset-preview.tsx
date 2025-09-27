"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Eye, 
  Download, 
  Shield, 
  BarChart3, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Zap,
  Clock,
  Users,
  Star
} from "lucide-react";
import { sampleDataPreviews } from "@/lib/demo-scenarios";
import type { SampleDataPreview } from "@/lib/demo-scenarios";
import { 
  DataDistributionChart, 
  TimeSeriesChart, 
  DataQualityMetrics, 
  DatasetStats,
  MultiSeriesChart 
} from "@/components/visualization/data-charts";

interface DatasetPreviewProps {
  datasetId?: string;
  onDownload?: (datasetId: string) => void;
  onPurchase?: (datasetId: string) => void;
}

export function DatasetPreview({ datasetId, onDownload, onPurchase }: DatasetPreviewProps) {
  const [selectedPreview, setSelectedPreview] = useState<SampleDataPreview | null>(
    datasetId ? sampleDataPreviews.find(p => p.id === datasetId) || sampleDataPreviews[0] : sampleDataPreviews[0]
  );
  const [activeTab, setActiveTab] = useState("overview");

  if (!selectedPreview) return null;

  const renderDataSample = () => {
    const sample = selectedPreview.sampleData;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Sample Data ({sample.length} rows shown)</h4>
          <Badge variant="outline">{selectedPreview.format}</Badge>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                {Object.keys(sample[0] || {}).map((key) => (
                  <th key={key} className="border border-gray-200 px-3 py-2 text-left font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sample.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-200 px-3 py-2">
                      {typeof value === 'string' && value.length > 50 
                        ? `${value.substring(0, 50)}...` 
                        : String(value)
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="text-xs text-muted-foreground">
          * This is a preview of the first {sample.length} rows. Full dataset contains {selectedPreview.totalRows.toLocaleString()} rows.
        </div>
      </div>
    );
  };

  const renderQualityMetrics = () => {
    // Generate comprehensive quality metrics
    const qualityMetrics = {
      completeness: 85 + Math.random() * 10,
      accuracy: 80 + Math.random() * 15,
      consistency: 90 + Math.random() * 8,
      validity: 75 + Math.random() * 20,
      uniqueness: 95 + Math.random() * 5
    };

    const datasetStats = {
      totalRows: selectedPreview.totalRows,
      totalColumns: selectedPreview.schema.length,
      dataTypes: selectedPreview.schema.reduce((acc, field) => {
        acc[field.type] = (acc[field.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      nullValues: Math.floor(selectedPreview.totalRows * 0.02),
      duplicateRows: Math.floor(selectedPreview.totalRows * 0.001),
      fileSize: `${(selectedPreview.totalRows * selectedPreview.schema.length * 0.001).toFixed(1)} MB`
    };

    return (
      <div className="space-y-6">
        <DataQualityMetrics metrics={qualityMetrics} />
        <DatasetStats stats={datasetStats} />
        
        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <h4 className="font-semibold flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4" />
            Quality Assurance
          </h4>
          <ul className="text-sm space-y-1">
            <li>• All data points validated against schema requirements</li>
            <li>• Privacy-preserving synthetic generation techniques used</li>
            <li>• Statistical properties preserved from original distribution</li>
            <li>• No personally identifiable information (PII) included</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderVisualization = () => {
    // Generate sample visualization data based on dataset type
    const generateVisualizationData = () => {
      const category = selectedPreview.name.toLowerCase();
      
      if (category.includes('medical') || category.includes('health')) {
        return {
          distribution: [
            { name: 'Normal', value: 65 },
            { name: 'Abnormal', value: 25 },
            { name: 'Inconclusive', value: 10 }
          ],
          timeSeries: Array.from({ length: 12 }, (_, i) => ({
            date: `2024-${String(i + 1).padStart(2, '0')}`,
            value: Math.floor(Math.random() * 1000) + 500
          })),
          multiSeries: Array.from({ length: 6 }, (_, i) => ({
            month: `Month ${i + 1}`,
            accuracy: 85 + Math.random() * 10,
            precision: 80 + Math.random() * 15,
            recall: 75 + Math.random() * 20
          }))
        };
      } else if (category.includes('financial') || category.includes('market')) {
        return {
          distribution: [
            { name: 'Positive', value: 45 },
            { name: 'Negative', value: 35 },
            { name: 'Neutral', value: 20 }
          ],
          timeSeries: Array.from({ length: 30 }, (_, i) => ({
            date: `Day ${i + 1}`,
            value: Math.floor(Math.random() * 200) + 100
          })),
          multiSeries: Array.from({ length: 12 }, (_, i) => ({
            month: `Q${Math.floor(i / 3) + 1}M${(i % 3) + 1}`,
            sentiment: 0.3 + Math.random() * 0.4,
            volume: Math.floor(Math.random() * 10000) + 5000,
            volatility: Math.random() * 0.5
          }))
        };
      } else {
        return {
          distribution: [
            { name: 'Category A', value: 40 },
            { name: 'Category B', value: 30 },
            { name: 'Category C', value: 20 },
            { name: 'Category D', value: 10 }
          ],
          timeSeries: Array.from({ length: 12 }, (_, i) => ({
            date: `2024-${String(i + 1).padStart(2, '0')}`,
            value: Math.floor(Math.random() * 1000) + 200
          })),
          multiSeries: Array.from({ length: 8 }, (_, i) => ({
            period: `Period ${i + 1}`,
            metric1: Math.random() * 100,
            metric2: Math.random() * 100,
            metric3: Math.random() * 100
          }))
        };
      }
    };

    const vizData = generateVisualizationData();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataDistributionChart
            data={vizData.distribution}
            title="Data Distribution"
            description="Distribution of key categories in the dataset"
            type="pie"
          />
          
          <TimeSeriesChart
            data={vizData.timeSeries}
            title="Trend Analysis"
            description="Data trends over time"
            type="area"
            trend={{ value: 12.5, label: 'vs last period' }}
          />
        </div>

        <MultiSeriesChart
          data={vizData.multiSeries}
          title="Multi-Metric Analysis"
          description="Comparison of multiple metrics across time periods"
          series={[
            { key: Object.keys(vizData.multiSeries[0])[1], name: 'Primary Metric', color: '#3b82f6' },
            { key: Object.keys(vizData.multiSeries[0])[2], name: 'Secondary Metric', color: '#10b981' },
            { key: Object.keys(vizData.multiSeries[0])[3], name: 'Tertiary Metric', color: '#f59e0b' }
          ]}
          xAxisKey={Object.keys(vizData.multiSeries[0])[0]}
        />
      </div>
    );
  };

  const renderSchema = () => (
    <div className="space-y-4">
      <h4 className="font-semibold">Dataset Schema</h4>
      <div className="grid gap-3">
        {selectedPreview.schema.map((field, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div>
                <div className="font-medium">{field.name}</div>
                <div className="text-sm text-muted-foreground">{field.description}</div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary">{field.type}</Badge>
              {field.required && (
                <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Dataset Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Dataset Preview
          </CardTitle>
          <CardDescription>
            Explore sample data and quality metrics before purchasing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {sampleDataPreviews.map((preview) => (
              <Button
                key={preview.id}
                variant={selectedPreview.id === preview.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPreview(preview)}
              >
                {preview.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Dataset Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{selectedPreview.name}</CardTitle>
              <CardDescription className="text-base">{selectedPreview.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedPreview.verified && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge variant="outline" className="text-lg px-3 py-1">
                ${selectedPreview.price}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Rows</div>
                <div className="font-semibold">{selectedPreview.totalRows.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Columns</div>
                <div className="font-semibold">{selectedPreview.schema.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Updated</div>
                <div className="font-semibold">{selectedPreview.lastUpdated}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Downloads</div>
                <div className="font-semibold">{selectedPreview.downloads}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => onPurchase?.(selectedPreview.id)}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Purchase & Download
            </Button>
            <Button 
              variant="outline"
              onClick={() => onDownload?.(selectedPreview.id)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sample">Sample Data</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="visualization">Charts</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dataset Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Use Cases</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPreview.useCases.map((useCase, index) => (
                    <Badge key={index} variant="secondary">{useCase}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="space-y-2">
                  {selectedPreview.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" />
                  Why This Dataset?
                </h4>
                <p className="text-sm text-gray-700">{selectedPreview.whyChoose}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sample" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Sample Data Preview
              </CardTitle>
              <CardDescription>
                Preview the structure and quality of the dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderDataSample()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dataset Schema
              </CardTitle>
              <CardDescription>
                Detailed field definitions and data types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSchema()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Data Visualization
              </CardTitle>
              <CardDescription>
                Visual representation of dataset patterns and distributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderVisualization()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Quality Metrics
              </CardTitle>
              <CardDescription>
                Comprehensive quality assessment and validation results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQualityMetrics()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}