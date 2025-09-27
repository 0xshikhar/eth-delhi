import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dataset } from '@/types/dataset';
import { DataDistributionChart } from '@/components/visualization/data-charts';
import { 
  Star, 
  Download, 
  Eye, 
  Shield, 
  Clock, 
  Database,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users
} from 'lucide-react';

interface EnhancedDatasetCardProps {
  dataset: Dataset;
  onSelect?: (dataset: Dataset) => void;
  onPreview?: (dataset: Dataset) => void;
  onDownload?: (dataset: Dataset) => void;
}

export function EnhancedDatasetCard({ 
  dataset, 
  onSelect, 
  onPreview, 
  onDownload 
}: EnhancedDatasetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate quality score based on available metadata
  const calculateQualityScore = (dataset: Dataset): number => {
    let score = 0;
    if (dataset.isVerified) score += 30;
    if (dataset.metadata?.schema) score += 20;
    if (dataset.metadata?.sampleData) score += 15;
    if (dataset.metadata?.metrics) score += 15;
    if (dataset.description && dataset.description.length > 50) score += 10;
    if (dataset.numRows && dataset.numRows > 1000) score += 10;
    return Math.min(score, 100);
  };

  const qualityScore = calculateQualityScore(dataset);
  const rating = dataset.rating || (qualityScore / 20); // Convert to 5-star scale

  // Generate sample distribution data for mini chart
  const generateMiniChartData = (dataset: Dataset) => {
    if (dataset.metadata?.sampleData) {
      // Use actual sample data if available
      const sampleData = dataset.metadata.sampleData;
      if (Array.isArray(sampleData) && sampleData.length > 0) {
        const firstRow = sampleData[0];
        return Object.keys(firstRow).slice(0, 4).map((key, index) => ({
          name: key,
          value: Math.random() * 100 + 20,
          fill: `hsl(${index * 60}, 70%, 50%)`
        }));
      }
    }
    
    // Fallback to generated data
    return [
      { name: 'Category A', value: 35, fill: '#8884d8' },
      { name: 'Category B', value: 25, fill: '#82ca9d' },
      { name: 'Category C', value: 20, fill: '#ffc658' },
      { name: 'Category D', value: 20, fill: '#ff7c7c' }
    ];
  };

  const miniChartData = generateMiniChartData(dataset);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {dataset.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {dataset.description}
            </p>
          </div>
          {dataset.isVerified && (
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Rating and Tags */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">
                ({rating.toFixed(1)})
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              Quality: {qualityScore}%
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {dataset.price ? `$${dataset.price}` : 'Free'}
            </p>
          </div>
        </div>

        {/* Tags */}
        {dataset.tags && dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {dataset.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
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
      </CardHeader>

      <CardContent className="pt-0">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Database className="w-4 h-4 text-blue-500 mr-1" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {dataset.numRows?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">Rows</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Download className="w-4 h-4 text-green-500 mr-1" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {dataset.downloads?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500">Downloads</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-purple-500 mr-1" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {dataset.createdAt 
                ? new Date(dataset.createdAt).toLocaleDateString()
                : 'N/A'
              }
            </p>
            <p className="text-xs text-gray-500">Created</p>
          </div>
        </div>

        {/* Quality Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Data Quality</span>
            <span className="text-xs text-gray-500">{qualityScore}%</span>
          </div>
          <Progress value={qualityScore} className="h-2" />
        </div>

        {/* Mini Data Distribution Chart */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Data Distribution Preview
          </h4>
          <div className="h-24">
            <DataDistributionChart 
              data={miniChartData}
              title=""
              type="pie"
            />
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="border-t pt-4 mt-4 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Owner</h4>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{dataset.owner}</span>
              </div>
            </div>
            
            {dataset.categories && dataset.categories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {dataset.categories.map((category: string) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {dataset.model && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Model</h4>
                <p className="text-sm text-gray-600">{dataset.model}</p>
              </div>
            )}

            {dataset.metadata?.metrics && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(dataset.metadata.metrics).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{key}:</span>
                      <span className="text-gray-700">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Less Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                More Details
              </>
            )}
          </Button>

          <div className="flex space-x-2">
            {onPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(dataset)}
                className="flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            )}
            
            {onDownload && (
              <Button
                size="sm"
                onClick={() => onDownload(dataset)}
                className="flex items-center bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-1" />
                {dataset.price ? 'Purchase' : 'Download'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}