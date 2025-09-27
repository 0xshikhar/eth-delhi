"use client";

import { useEffect, useState, useCallback } from 'react';
import { getAllDatasets, lockDataset } from '@/lib/web3';
import { Dataset as DatasetType } from '@/lib/types';
import { DatasetCard } from '@/components/ui/dataset-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Search, Filter, RefreshCw, Grid, List, TrendingUp, Star, Clock, DollarSign, Users, Database } from 'lucide-react';
import { useAccount } from 'wagmi';


// Local Dataset interface that matches what's used in the component
type Dataset = {
  id: number;
  name: string;
  description: string;
  price: string;
  owner: string;
  locked: boolean;
  verified: boolean;
  cid: string;
  category?: string;
  tags?: string[];
  createdAt?: Date;
  downloads?: number;
  rating?: number;
};

// Dataset categories for filtering
const DATASET_CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: Database },
  { value: 'medical', label: 'Medical', icon: Users },
  { value: 'financial', label: 'Financial', icon: DollarSign },
  { value: 'text', label: 'Text & NLP', icon: Users },
  { value: 'image', label: 'Image & Vision', icon: Users },
  { value: 'audio', label: 'Audio', icon: Users },
  { value: 'other', label: 'Other', icon: Database },
];

export function DatasetBrowser() {
  const { address, isConnected } = useAccount();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterOwn, setFilterOwn] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<'all' | 'free' | 'paid'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Mock function to assign categories and additional metadata to datasets
  const enhanceDatasetWithMetadata = (dataset: Dataset): Dataset => {
    const categories = ['medical', 'financial', 'text', 'image', 'audio'];
    const tags = [
      ['synthetic', 'healthcare', 'patient-data'],
      ['financial', 'transactions', 'market-data'],
      ['nlp', 'text-generation', 'language-model'],
      ['computer-vision', 'image-classification', 'synthetic-images'],
      ['audio-processing', 'speech', 'sound-generation']
    ];
    
    const categoryIndex = dataset.id % categories.length;
    return {
      ...dataset,
      category: categories[categoryIndex],
      tags: tags[categoryIndex],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      downloads: Math.floor(Math.random() * 1000),
      rating: 3.5 + Math.random() * 1.5, // Random rating between 3.5-5
    };
  };

  // Fetch all datasets from the blockchain
  const fetchDatasets = async () => {
    setIsLoading(true);
    try {
      const fetchedDatasets = await getAllDatasets();
      console.log("Fetched datasets from contract:", fetchedDatasets);
      // Transform the fetched datasets to match our local Dataset type
      const transformedDatasets = fetchedDatasets.map((dataset: DatasetType) => {
        const baseDataset = {
          id: dataset.id,
          name: dataset.name,
          description: dataset.description,
          price: dataset.price,
          owner: dataset.owner,
          locked: dataset.cid !== '',  // If CID exists, consider it locked
          verified: dataset.isVerified || false,
          cid: dataset.cid
        };
        return enhanceDatasetWithMetadata(baseDataset);
      });
      console.log("Transformed datasets for display:", transformedDatasets);
      setDatasets(transformedDatasets);
      setFilteredDatasets(transformedDatasets);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      toast.error("Error fetching datasets", {
        description: "Failed to fetch datasets. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dataset locking
  const handleLockDataset = async (id: number): Promise<void> => {
    try {
      // Mock values since we're not providing the actual lockDataset parameters in this UI
      // In a real implementation, these would come from the dataset or user input
      const cid = "mock-cid-for-now";  // This would be the actual IPFS CID
      const numRows = 1000;              // Example value
      const numTokens = 5000;            // Example value
      
      await lockDataset(id, cid, numRows, numTokens);
      
      // Update local state
      const updatedDatasets = datasets.map(dataset => 
        dataset.id === id ? { ...dataset, locked: true } : dataset
      );
      
      setDatasets(updatedDatasets);
      setFilteredDatasets(
        filterAndSortDatasets(
          updatedDatasets,
          searchTerm,
          selectedCategory,
          filterOwn,
          sortOption,
          priceRange,
          verificationFilter
        )
      );
      
      toast.success("Dataset Locked", {
        description: "The dataset has been successfully locked and is now immutable.",
      });
    } catch (error: any) {
      console.error("Error locking dataset:", error);
      toast.error("Error locking dataset", {
        description: error.message || "Failed to lock dataset",
      });
    }
  };

  // Enhanced filter and sort datasets
  const filterAndSortDatasets = useCallback((
    datasetList: Dataset[],
    search: string,
    category: string,
    ownOnly: boolean,
    sort: string,
    priceFilter: string,
    verificationStatus: string
  ) => {
    // Apply filters
    let filtered = datasetList.filter(dataset => {
      // Filter by search term (name, description, tags)
      const matchesSearch = 
        dataset.name.toLowerCase().includes(search.toLowerCase()) ||
        dataset.description.toLowerCase().includes(search.toLowerCase()) ||
        (dataset.tags && dataset.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
      
      // Filter by category
      const matchesCategory = category === 'all' || dataset.category === category;
      
      // Filter by ownership if selected
      const matchesOwnership = ownOnly 
        ? address && dataset.owner.toLowerCase() === address.toLowerCase()
        : true;
      
      // Filter by price range
      const price = Math.floor(Number(dataset.price));
      const matchesPrice = priceFilter === 'all' || 
        (priceFilter === 'free' && price === 0) ||
        (priceFilter === 'paid' && price > 0);
      
      // Filter by verification status
      const matchesVerification = verificationStatus === 'all' ||
        (verificationStatus === 'verified' && dataset.verified) ||
        (verificationStatus === 'unverified' && !dataset.verified);
      
      return matchesSearch && matchesCategory && matchesOwnership && matchesPrice && matchesVerification;
    });
    
    // Apply sorting
    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case 'oldest':
        filtered.sort((a, b) => Number(a.id) - Number(b.id));
        break;
      case 'price-low':
        filtered.sort((a, b) => Number(BigInt(a.price) - BigInt(b.price)));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(BigInt(b.price) - BigInt(a.price)));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [address]);

  // Handle filter changes
  useEffect(() => {
    if (datasets.length > 0) {
      const filtered = filterAndSortDatasets(
        datasets,
        searchTerm,
        selectedCategory,
        filterOwn,
        sortOption,
        priceRange,
        verificationFilter
      );
      setFilteredDatasets(filtered);
    }
  }, [searchTerm, selectedCategory, filterOwn, sortOption, priceRange, verificationFilter, address, datasets, filterAndSortDatasets]);

  // Initial fetch
  useEffect(() => {
    fetchDatasets();
  }, []);

  // Get statistics for the dashboard
  const stats = {
    total: datasets.length,
    verified: datasets.filter(d => d.verified).length,
    locked: datasets.filter(d => d.locked).length,
    owned: datasets.filter(d => address && d.owner.toLowerCase() === address.toLowerCase()).length,
  };

  return (
    <div className="w-full space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Total Datasets</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Verified</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.verified}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Locked</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.locked}</p>
        </div>
        {isConnected && (
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">My Datasets</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.owned}</p>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets by name, description, or tags..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
            {DATASET_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Select value={priceRange} onValueChange={(v) => setPriceRange(v as 'all' | 'free' | 'paid')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verificationFilter} onValueChange={(v) => setVerificationFilter(v as 'all' | 'verified' | 'unverified')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilterOwn(!filterOwn)}
              className={filterOwn ? "bg-primary/10" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              {filterOwn ? "All Datasets" : "My Datasets"}
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={fetchDatasets}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading datasets...</div>
        </div>
      ) : filteredDatasets.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDatasets.length} of {datasets.length} datasets
            </p>
            {(searchTerm || selectedCategory !== 'all' || filterOwn || priceRange !== 'all' || verificationFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setFilterOwn(false);
                  setPriceRange('all');
                  setVerificationFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {filteredDatasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                id={dataset.id}
                name={dataset.name}
                description={dataset.description}
                price={dataset.price}
                owner={dataset.owner}
                locked={dataset.locked}
                verified={dataset.verified}
                cid={dataset.cid}
                isOwner={!!address && dataset.owner.toLowerCase() === address.toLowerCase()}
                onLock={handleLockDataset}
                onVerificationCheck={async () => Promise.resolve()}
                category={dataset.category}
                tags={dataset.tags}
                downloads={dataset.downloads}
                rating={dataset.rating}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-12 space-y-2 text-center">
          <Database className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">No datasets found</p>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' || filterOwn || priceRange !== 'all' || verificationFilter !== 'all' ? 
              "Try adjusting your filters or search terms" : 
              "Be the first to create a synthetic dataset!"
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && !filterOwn && priceRange === 'all' && verificationFilter === 'all' && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.href = "/generate"}
            >
              Create Dataset
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
