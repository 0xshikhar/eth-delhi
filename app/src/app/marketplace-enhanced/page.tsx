"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedDatasetCard } from '@/components/enhanced-dataset-card';
import { DatasetPreview } from '@/components/demo/dataset-preview';
import { DatasetStats } from '@/components/visualization/data-charts';
import { mockDatasets } from '@/lib/mock-data';
import { Dataset } from '@/types/dataset';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  TrendingUp, 
  Star, 
  Download,
  Shield,
  Clock,
  BarChart3,
  Eye
} from 'lucide-react';

export default function EnhancedMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Enhanced mock datasets with ratings and tags
  const enhancedDatasets = useMemo(() => {
    return mockDatasets.map(dataset => ({
      ...dataset,
      rating: Math.random() * 2 + 3, // 3-5 star rating
      tags: [
        ...(dataset.categories || []),
        dataset.isVerified ? 'verified' : 'unverified',
        dataset.price ? 'premium' : 'free',
        `${Math.floor(Math.random() * 5) + 1}k-downloads`
      ].slice(0, 4)
    }));
  }, []);

  // Filter and sort datasets
  const filteredDatasets = useMemo(() => {
    let filtered = enhancedDatasets.filter(dataset => {
      const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             dataset.categories?.includes(selectedCategory) ||
                             dataset.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort datasets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'popular':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [enhancedDatasets, searchTerm, selectedCategory, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    enhancedDatasets.forEach(dataset => {
      dataset.categories?.forEach(cat => cats.add(cat));
      if (dataset.category) cats.add(dataset.category);
    });
    return Array.from(cats);
  }, [enhancedDatasets]);

  // Calculate marketplace stats
  const marketplaceStats = useMemo(() => {
    const totalDatasets = enhancedDatasets.length;
    const verifiedDatasets = enhancedDatasets.filter(d => d.isVerified).length;
    const totalDownloads = enhancedDatasets.reduce((sum, d) => sum + (d.downloads || 0), 0);
    const averageRating = enhancedDatasets.reduce((sum, d) => sum + (d.rating || 0), 0) / totalDatasets;
    const freeDatasets = enhancedDatasets.filter(d => !d.price || d.price === 0).length;

    return {
      totalRows: enhancedDatasets.reduce((sum, d) => sum + (d.numRows || 0), 0),
      totalColumns: enhancedDatasets.reduce((sum, d) => sum + (d.numColumns || 0), 0),
      dataTypes: {
        'Text': Math.floor(totalDatasets * 0.4),
        'Numeric': Math.floor(totalDatasets * 0.3),
        'Image': Math.floor(totalDatasets * 0.2),
        'Audio': Math.floor(totalDatasets * 0.1)
      },
      nullValues: Math.floor(totalDatasets * 0.05),
      duplicateRows: Math.floor(totalDatasets * 0.02),
      fileSize: `${(totalDatasets * 2.5).toFixed(1)} GB`,
      lastUpdated: new Date().toISOString()
    };
  }, [enhancedDatasets]);

  const handlePreview = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setShowPreview(true);
  };

  const handleDownload = (dataset: Dataset) => {
    console.log('Downloading dataset:', dataset.name);
    // Implement download logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enhanced Dataset Marketplace
          </h1>
          <p className="text-lg text-gray-600">
            Discover, preview, and download high-quality datasets with advanced visualization
          </p>
        </div>

        {/* Marketplace Stats */}
        <div className="mb-8">
          <DatasetStats stats={marketplaceStats} />
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search datasets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => setSelectedCategory('AI/ML')}
              >
                <Star className="w-3 h-3 mr-1" />
                AI/ML
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-green-100"
                onClick={() => setSortBy('popular')}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Popular
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-purple-100"
                onClick={() => {
                  const verified = enhancedDatasets.filter(d => d.isVerified);
                  console.log('Showing verified datasets:', verified.length);
                }}
              >
                <Shield className="w-3 h-3 mr-1" />
                Verified Only
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-yellow-100"
                onClick={() => setSortBy('newest')}
              >
                <Clock className="w-3 h-3 mr-1" />
                Recently Added
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredDatasets.length} of {enhancedDatasets.length} datasets
          </p>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Enhanced with visualizations</span>
          </div>
        </div>

        {/* Dataset Grid/List */}
        <div className={`grid gap-6 mb-8 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredDatasets.map((dataset) => (
            <EnhancedDatasetCard
              key={dataset.id}
              dataset={dataset}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredDatasets.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No datasets found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dataset Preview Modal */}
        {showPreview && selectedDataset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Dataset Preview
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPreview(false)}
                  >
                    ×
                  </Button>
                </div>
                <DatasetPreview />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}