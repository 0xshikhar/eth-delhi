"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedVerificationStatus } from "@/components/verification/enhanced-verification-status";
import { QualityMetricsDashboard } from "@/components/verification/quality-metrics-dashboard";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Database,
  Shield
} from "lucide-react";

// Mock data for demonstration
const mockDatasets = [
  {
    id: "1",
    name: "Climate Data 2024",
    description: "Comprehensive climate measurements from global weather stations",
    size: "2.3 GB",
    format: "CSV",
    uploadDate: "2024-01-15",
    verificationStatus: "verified" as const,
    qualityScore: 92,
    verifier: "Climate Research Institute",
    tags: ["climate", "weather", "temperature"],
    rating: 4.8
  },
  {
    id: "2", 
    name: "Financial Markets Dataset",
    description: "Stock prices and trading volumes for major exchanges",
    size: "1.8 GB",
    format: "JSON",
    uploadDate: "2024-01-14",
    verificationStatus: "pending" as const,
    qualityScore: 78,
    verifier: null,
    tags: ["finance", "stocks", "trading"],
    rating: 4.2
  },
  {
    id: "3",
    name: "Medical Research Data",
    description: "Anonymized patient data for drug efficacy studies",
    size: "950 MB",
    format: "CSV",
    uploadDate: "2024-01-13",
    verificationStatus: "rejected" as const,
    qualityScore: 45,
    verifier: "Medical Data Authority",
    tags: ["medical", "research", "clinical"],
    rating: 2.1
  },
  {
    id: "4",
    name: "IoT Sensor Network",
    description: "Real-time sensor data from smart city infrastructure",
    size: "3.1 GB",
    format: "Parquet",
    uploadDate: "2024-01-12",
    verificationStatus: "verified" as const,
    qualityScore: 88,
    verifier: "Smart City Consortium",
    tags: ["iot", "sensors", "smart-city"],
    rating: 4.6
  }
];

const mockStats = {
  totalDatasets: 1247,
  verifiedDatasets: 892,
  pendingVerification: 234,
  rejectedDatasets: 121,
  averageQualityScore: 84.2,
  totalVerifiers: 45
};

export default function VerificationDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const filteredDatasets = mockDatasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || dataset.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Verification Dashboard</h1>
        <p className="text-gray-600">Monitor and manage dataset verification status and quality metrics</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Datasets</p>
                <p className="text-2xl font-bold">{mockStats.totalDatasets.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{mockStats.verifiedDatasets}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{mockStats.pendingVerification}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{mockStats.rejectedDatasets}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Quality</p>
                <p className="text-2xl font-bold text-blue-600">{mockStats.averageQualityScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verifiers</p>
                <p className="text-2xl font-bold text-purple-600">{mockStats.totalVerifiers}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="datasets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="datasets">Dataset Verification</TabsTrigger>
          <TabsTrigger value="quality">Quality Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-6">
          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search datasets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dataset List */}
          <div className="grid gap-4">
            {filteredDatasets.map((dataset) => (
              <Card key={dataset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{dataset.name}</h3>
                        <Badge className={getStatusColor(dataset.verificationStatus)}>
                          {getStatusIcon(dataset.verificationStatus)}
                          <span className="ml-1 capitalize">{dataset.verificationStatus}</span>
                        </Badge>
                        <Badge variant="outline" className={getQualityColor(dataset.qualityScore)}>
                          Quality: {dataset.qualityScore}%
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{dataset.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {dataset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Size: {dataset.size}</span>
                        <span>Format: {dataset.format}</span>
                        <span>Uploaded: {dataset.uploadDate}</span>
                        {dataset.verifier && (
                          <span>Verified by: {dataset.verifier}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <EnhancedVerificationStatus 
                        datasetId={dataset.id}
                        showQualityMetrics={true}
                        compact={true}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDataset(dataset.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDatasets.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No datasets found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <QualityMetricsDashboard datasetId={selectedDataset || "1"} />
        </TabsContent>
      </Tabs>
    </div>
  );
}