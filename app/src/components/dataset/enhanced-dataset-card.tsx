"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Download, 
  Eye, 
  Star, 
  Calendar, 
  DollarSign, 
  Users, 
  Shield, 
  TrendingUp,
  BarChart3,
  FileText,
  Tag,
  Lock,
  Unlock,
  ChevronRight
} from "lucide-react";
import { Dataset } from "@/types/dataset";
import { DataDistributionChart } from "@/components/visualization/data-charts";

interface EnhancedDatasetCardProps {
  dataset: Dataset;
  viewMode?: 'grid' | 'list';
  onPurchase?: (dataset: Dataset) => void;
  onPreview?: (dataset: Dataset) => void;
  onLock?: (dataset: Dataset) => void;
  showVisualization?: boolean;
  className?: string;
}

export function EnhancedDatasetCard({ 
  dataset, 
  viewMode = 'grid',
  onPurchase,
  onPreview,
  onLock,
  showVisualization = false,
  className 
}: EnhancedDatasetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const getQualityScore = () => {
    // Calculate quality score based on various factors
    let score = 0;
    if (dataset.isVerified) score += 30;
    if (dataset.downloads && dataset.downloads > 100) score += 20;
    if (dataset.rating && dataset.rating >= 4) score += 25;
    if (dataset.metadata?.metrics?.accuracy) score += dataset.metadata.metrics.accuracy * 0.25;
    return Math.min(100, score + Math.random() * 20);
  };

  const generateMiniVisualization = () => {
    // Generate simple distribution data for mini chart
    const categories = dataset.categories || ['Data'];
    return categories.slice(0, 4).map((cat, index) => ({
      name: cat,
      value: Math.floor(Math.random() * 50) + 10
    }));
  };

  if (viewMode === 'list') {
    return (
      <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Dataset Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg truncate">{dataset.name}</CardTitle>
                    {dataset.isVerified && (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {dataset.isPrivate && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm line-clamp-2">
                    {dataset.description}
                  </CardDescription>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-blue-600">{dataset.price} FIL</div>
                  <div className="text-xs text-muted-foreground">per dataset</div>
                </div>
              </div>

              {/* Tags */}
              {dataset.tags && dataset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {dataset.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {dataset.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{dataset.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  <span>{dataset.numRows?.toLocaleString()} rows</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{dataset.downloads?.toLocaleString()} downloads</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(dataset.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                {dataset.rating && (
                  <div className="flex items-center gap-1">
                    {renderRating(dataset.rating)}
                  </div>
                )}
              </div>

              {/* Quality Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Quality Score</span>
                  <span className="font-medium">{getQualityScore().toFixed(0)}%</span>
                </div>
                <Progress value={getQualityScore()} className="h-2" />
              </div>
            </div>

            {/* Mini Visualization */}
            {showVisualization && (
              <div className="w-32 h-24 flex-shrink-0">
                <DataDistributionChart
                  data={generateMiniVisualization()}
                  title=""
                  type="pie"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button size="sm" onClick={() => onPreview?.(dataset)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button size="sm" variant="outline" onClick={() => onPurchase?.(dataset)}>
                <Download className="w-4 h-4 mr-2" />
                Purchase
              </Button>
              {onLock && (
                <Button size="sm" variant="ghost" onClick={() => onLock(dataset)}>
                  <Lock className="w-4 h-4 mr-2" />
                  Lock
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate mb-1">{dataset.name}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {dataset.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {dataset.isVerified && (
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {dataset.isPrivate && (
              <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        {dataset.tags && dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dataset.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{dataset.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Mini Visualization */}
        {showVisualization && (
          <div className="h-32">
            <DataDistributionChart
              data={generateMiniVisualization()}
              title="Data Distribution"
              type="pie"
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <div>
              <div className="font-medium">{dataset.numRows?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Rows</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <div>
              <div className="font-medium">{dataset.downloads?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Downloads</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <div>
              <div className="font-medium">
                {new Date(dataset.createdAt || Date.now()).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground">Created</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <div>
              <div className="font-medium">{dataset.price} FIL</div>
              <div className="text-xs text-muted-foreground">Price</div>
            </div>
          </div>
        </div>

        {/* Rating */}
        {dataset.rating && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rating</span>
            {renderRating(dataset.rating)}
          </div>
        )}

        {/* Quality Score */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Quality Score</span>
            <span className="font-medium">{getQualityScore().toFixed(0)}%</span>
          </div>
          <Progress value={getQualityScore()} className="h-2" />
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <div>
              <h4 className="text-sm font-medium mb-2">Dataset Details</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Owner: {dataset.owner}</div>
                <div>Model: {dataset.model}</div>
                {dataset.metadata?.schema && (
                  <div>Columns: {dataset.metadata.schema.length}</div>
                )}
              </div>
            </div>
            
            {dataset.metadata?.sampleData && (
              <div>
                <h4 className="text-sm font-medium mb-2">Sample Data</h4>
                <div className="text-xs bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(dataset.metadata.sampleData.slice(0, 2), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onPreview?.(dataset)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onPurchase?.(dataset)}
          >
            <Download className="w-4 h-4 mr-2" />
            Purchase
          </Button>
          {onLock && (
            <Button size="sm" variant="ghost" onClick={() => onLock(dataset)}>
              <Lock className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Expand/Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </Button>
      </CardContent>
    </Card>
  );
}