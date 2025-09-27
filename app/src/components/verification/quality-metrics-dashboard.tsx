"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Database, 
  Shield,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Star,
  Target
} from "lucide-react";
import { DataDistributionChart, QualityRadarChart, DataQualityMetrics } from "@/components/visualization/data-charts";

interface QualityMetric {
  name: string;
  value: number;
  description: string;
  status: "excellent" | "good" | "fair" | "poor";
  trend?: "up" | "down" | "stable";
}

interface QualityReport {
  overallScore: number;
  grade: string;
  metrics: QualityMetric[];
  lastUpdated: Date;
  validator: string;
  recommendations: string[];
}

interface QualityMetricsDashboardProps {
  datasetId: string;
  showRecommendations?: boolean;
  interactive?: boolean;
}

export function QualityMetricsDashboard({ 
  datasetId, 
  showRecommendations = true,
  interactive = true 
}: QualityMetricsDashboardProps) {
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQualityMetrics() {
      try {
        setLoading(true);
        
        // Mock quality report data - in real implementation, fetch from blockchain/API
        const mockReport: QualityReport = {
          overallScore: 87.5,
          grade: "A-",
          lastUpdated: new Date(Date.now() - Math.random() * 86400000 * 3),
          validator: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e",
          metrics: [
            {
              name: "Completeness",
              value: 92,
              description: "Percentage of non-null values across all fields",
              status: "excellent",
              trend: "up"
            },
            {
              name: "Consistency",
              value: 88,
              description: "Data format and type consistency across records",
              status: "good",
              trend: "stable"
            },
            {
              name: "Accuracy",
              value: 95,
              description: "Correctness of data values and relationships",
              status: "excellent",
              trend: "up"
            },
            {
              name: "Uniqueness",
              value: 78,
              description: "Absence of duplicate records",
              status: "good",
              trend: "down"
            },
            {
              name: "Timeliness",
              value: 84,
              description: "Recency and relevance of the data",
              status: "good",
              trend: "stable"
            },
            {
              name: "Validity",
              value: 91,
              description: "Adherence to defined business rules and constraints",
              status: "excellent",
              trend: "up"
            }
          ],
          recommendations: [
            "Consider implementing duplicate detection algorithms to improve uniqueness score",
            "Regular data refresh cycles could enhance timeliness metrics",
            "Add validation rules for improved data consistency",
            "Implement automated quality monitoring for continuous improvement"
          ]
        };

        setQualityReport(mockReport);
      } catch (error) {
        console.error("Error fetching quality metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    if (datasetId) {
      fetchQualityMetrics();
    }
  }, [datasetId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-100";
      case "good": return "text-blue-600 bg-blue-100";
      case "fair": return "text-yellow-600 bg-yellow-100";
      case "poor": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600 bg-green-100";
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-100";
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down": return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      case "stable": return <Activity className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!qualityReport) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No quality metrics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Quality Assessment
              </CardTitle>
              <CardDescription>
                Last updated {qualityReport.lastUpdated.toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{qualityReport.overallScore}%</div>
              <Badge className={getGradeColor(qualityReport.grade)}>
                Grade {qualityReport.grade}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={qualityReport.overallScore} className="h-3 mb-4" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Validated by {qualityReport.validator.slice(0, 6)}...{qualityReport.validator.slice(-4)}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="visualization">Charts</TabsTrigger>
          {showRecommendations && <TabsTrigger value="recommendations">Insights</TabsTrigger>}
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {qualityReport.metrics.map((metric) => (
              <Card 
                key={metric.name}
                className={`cursor-pointer transition-all ${
                  selectedMetric === metric.name ? "ring-2 ring-blue-500" : ""
                } ${interactive ? "hover:shadow-md" : ""}`}
                onClick={() => interactive && setSelectedMetric(
                  selectedMetric === metric.name ? null : metric.name
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metric.value}%</span>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedMetric && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {qualityReport.metrics.find(m => m.name === selectedMetric)?.name} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">
                    {qualityReport.metrics.find(m => m.name === selectedMetric)?.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Current Score:</span>
                      <span className="ml-2">
                        {qualityReport.metrics.find(m => m.name === selectedMetric)?.value}%
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${getStatusColor(
                          qualityReport.metrics.find(m => m.name === selectedMetric)?.status || "fair"
                        )}`}
                      >
                        {qualityReport.metrics.find(m => m.name === selectedMetric)?.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Quality Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataQualityMetrics 
                  metrics={{
                    completeness: qualityReport.metrics.find(m => m.name === 'Completeness')?.value || 0,
                    accuracy: qualityReport.metrics.find(m => m.name === 'Accuracy')?.value || 0,
                    consistency: qualityReport.metrics.find(m => m.name === 'Consistency')?.value || 0,
                    validity: qualityReport.metrics.find(m => m.name === 'Validity')?.value || 0,
                    uniqueness: qualityReport.metrics.find(m => m.name === 'Uniqueness')?.value || 0
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quality Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QualityRadarChart 
                  data={qualityReport.metrics.map(m => ({
                    metric: m.name,
                    value: m.value,
                    fullMark: 100
                  }))}
                  title="Quality Metrics Overview"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {showRecommendations && (
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Quality Improvement Recommendations
                </CardTitle>
                <CardDescription>
                  Actionable insights to enhance your dataset quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {qualityReport.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900">{recommendation}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Detailed Quality Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}