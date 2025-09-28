"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatEther, formatUnits } from 'ethers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock, ShoppingCart, Shield, CheckCircle, XCircle, Eye, EyeOff, Download, Star, Calendar, TrendingUp, Tag } from 'lucide-react';
import { purchaseDataset, hasAccessToDataset, checkDatasetVerification } from '@/lib/web3';
import { getDatasetContent } from '@/lib/ipfs';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export interface DatasetCardProps {
  id: number;
  name: string;
  description?: string;
  price: string; // Price in wei
  owner: string;
  locked: boolean;
  verified?: boolean;
  isOwner: boolean;
  cid: string; // IPFS CID
  onLock?: (id: number) => Promise<void>;
  onVerificationCheck?: (id: number) => Promise<void>;
  // New props for enhanced display
  category?: string;
  tags?: string[];
  downloads?: number;
  rating?: number;
  viewMode?: 'grid' | 'list';
}

export function DatasetCard({
  id,
  name,
  description,
  price,
  owner,
  locked,
  verified,
  isOwner,
  cid,
  onLock,
  onVerificationCheck,
  category,
  tags,
  downloads,
  rating,
  viewMode = 'grid',
}: DatasetCardProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Format price from wei to USDFC (with 6 decimals)
  const parsedPrice = parseFloat(formatUnits(String(price || '0').split('.')[0], 12));
  // Show dummy price if price is 0
  const formattedPrice = parsedPrice === 0 ? "10.00" : parsedPrice.toFixed(2);

  const checkAccess = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);
    try {
      const hasAccess = await hasAccessToDataset(id, address);
      setHasAccess(hasAccess);
    } catch (error) {
      console.error("Error checking dataset access:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) return;
    setIsPurchasing(true);
    try {
      await purchaseDataset(id, price);
      await checkAccess();
      toast.success("Dataset Purchased", {
        description: "You now have access to this dataset!",
      });
    } catch (error: any) {
      console.error("Error purchasing dataset:", error);
      toast.error("Purchase Failed", {
        description: error.message || "Failed to purchase dataset",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleLock = async () => {
    if (onLock) {
      await onLock(id);
    }
  };

  const handleVerificationCheck = async () => {
    router.push('/verify');
    if (onVerificationCheck) {
      await onVerificationCheck(id);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const content = await getDatasetContent(cid);

      // Convert content to JSON string
      const jsonString = JSON.stringify(content, null, 2);

      // Create a blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset-${id}-${name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Download Started", {
        description: "Dataset download has begun.",
      });
    } catch (error: any) {
      console.error("Error downloading dataset:", error);
      toast.error("Download Failed", {
        description: error.message || "Failed to download dataset",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Render stars for rating
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }

    return stars;
  };

  // List view layout
  if (viewMode === 'list') {
    return (
      <Card className="w-full">
        <div className="flex items-center p-6 space-x-6">
          {/* Dataset Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold truncate">{name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{description || "Medical Reports Data"}</p>
              </div>
              <div className="flex gap-2 ml-4">
                {locked ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Unlock className="h-3 w-3" /> Unlocked
                  </Badge>
                )}

                {verified !== undefined && (
                  <Badge
                    variant={verified ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {verified ? (
                      <><CheckCircle className="h-3 w-3" /> Verified</>
                    ) : (
                      <><XCircle className="h-3 w-3" /> Unverified</>
                    )}
                  </Badge>
                )}

                {category && (
                  <Badge variant="outline" className="capitalize">
                    {category}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {downloads !== undefined && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {downloads} downloads
                </div>
              )}
              {rating !== undefined && (
                <div className="flex items-center gap-1">
                  {renderRating(rating)}
                  <span className="ml-1">({rating.toFixed(1)})</span>
                </div>
              )}
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="text-lg font-semibold">{formattedPrice} USDFC</div>
            </div>

            <div className="flex gap-2">
              {hasAccess === null && isConnected && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={checkAccess}
                  disabled={isLoading}
                >
                  {isLoading ? "Checking..." : "Check Access"}
                </Button>
              )}

              {hasAccess === true && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
              )}

              {isOwner && !locked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLock}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Lock
                </Button>
              )}

              {isOwner && verified === false && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVerificationCheck}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              )}

              {!isOwner && !hasAccess && (
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || !locked}
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isPurchasing ? "Processing..." : "Purchase"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view layout (default)
  return (
    <Card className="w-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg font-bold text-gray-900">{name}</CardTitle>
            <CardDescription className="line-clamp-2 text-gray-600 mt-1">{description || "Medical Reports Data"}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 ml-3">
            {locked ? (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Unlock className="h-3 w-3" /> Unlocked
              </Badge>
            )}

            {verified !== undefined && (
              <Badge
                variant={verified ? "default" : "destructive"}
                className="flex items-center gap-1 text-xs"
              >
                {verified ? (
                  <><CheckCircle className="h-3 w-3" /> Verified</>
                ) : (
                  <><XCircle className="h-3 w-3" /> Unverified</>
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Category and Tags */}
        <div className="space-y-2 mt-2">
          {category && (
            <Badge variant="outline" className="capitalize text-xs">
              {category}
            </Badge>
          )}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Price:</span>
            <span className="font-bold text-xl text-blue-600">{formattedPrice} USDFC</span>
          </div>

          {/* Metadata */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            {downloads !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">{downloads}</span>
              </div>
            )}
            {rating !== undefined && (
              <div className="flex items-center gap-1">
                {renderRating(rating)}
                <span className="ml-1 text-xs font-medium">({rating.toFixed(1)})</span>
              </div>
            )}
          </div>

          {hasAccess === null && isConnected && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 w-full"
              onClick={checkAccess}
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check Access"}
            </Button>
          )}

          {hasAccess === true && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 gap-1 w-full"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Dataset"}
            </Button>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0">
        <div className="flex gap-2 w-full">
          {isOwner && !locked && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLock}
              className="flex-1"
            >
              <Lock className="h-4 w-4 mr-2" />
              Lock
            </Button>
          )}

          {isOwner && verified === false && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerificationCheck}
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              Verify
            </Button>
          )}
        </div>

        {!isOwner && !hasAccess && (
          <Button
            onClick={handlePurchase}
            disabled={isPurchasing || !locked}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isPurchasing ? "Processing..." : "Purchase"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
