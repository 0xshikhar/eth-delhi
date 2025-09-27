"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Clock, Star, AlertTriangle, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
  timeliness: number;
  overallScore: number;
  validatedAt?: Date;
  validator?: string;
}

interface VerificationInfo {
  isVerified: boolean;
  verifier: string;
  timestamp: number;
  datasetHash?: string;
  qualityMetrics?: QualityMetrics;
}

interface EnhancedVerificationStatusProps {
  datasetId: string;
  onVerifyClick?: () => void;
  showQualityMetrics?: boolean;
  compact?: boolean;
}

export function EnhancedVerificationStatus({ 
  datasetId, 
  onVerifyClick, 
  showQualityMetrics = true,
  compact = false 
}: EnhancedVerificationStatusProps) {
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVerificationStatus() {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data for demo - in real implementation, this would fetch from blockchain
        const mockVerificationInfo: VerificationInfo = {
          isVerified: Math.random() > 0.3, // 70% chance of being verified
          verifier: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e",
          timestamp: Date.now() / 1000 - Math.random() * 86400 * 30, // Random time in last 30 days
          datasetHash: "0x" + Math.random().toString(16).substring(2, 66),
          qualityMetrics: {
            completeness: 85 + Math.random() * 15,
            consistency: 80 + Math.random() * 20,
            accuracy: 90 + Math.random() * 10,
            uniqueness: 75 + Math.random() * 25,
            timeliness: 88 + Math.random() * 12,
            overallScore: 0,
            validatedAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last week
            validator: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e"
          }
        };

        // Calculate overall score
        if (mockVerificationInfo.qualityMetrics) {
          const metrics = mockVerificationInfo.qualityMetrics;
          mockVerificationInfo.qualityMetrics.overallScore = 
            (metrics.completeness + metrics.consistency + metrics.accuracy + 
             metrics.uniqueness + metrics.timeliness) / 5;
        }

        setVerificationInfo(mockVerificationInfo);
      } catch (err) {
        console.error("Error fetching verification status:", err);
        setError("Failed to load verification status");
      } finally {
        setLoading(false);
      }
    }

    if (datasetId) {
      fetchVerificationStatus();
    }
  }, [datasetId]);

  const getQualityLevel = (score: number) => {
    if (score >= 95) return { level: "Premium", color: "bg-purple-500", icon: Award };
    if (score >= 85) return { level: "High", color: "bg-green-500", icon: Star };
    if (score >= 70) return { level: "Standard", color: "bg-blue-500", icon: TrendingUp };
    return { level: "Basic", color: "bg-yellow-500", icon: AlertTriangle };
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "pb-2" : "pb-3"}>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-500">
            <XCircle className="h-5 w-5" />
            Error Loading Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!verificationInfo) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {verificationInfo.isVerified ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Verified
            </Badge>
            {verificationInfo.qualityMetrics && (
              <Badge variant="outline" className={getQualityLevel(verificationInfo.qualityMetrics.overallScore).color + " text-white"}>
                {getQualityLevel(verificationInfo.qualityMetrics.overallScore).level}
              </Badge>
            )}
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 text-yellow-500" />
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              Unverified
            </Badge>
          </>
        )}
      </div>
    );
  }

  if (verificationInfo.isVerified) {
    const qualityLevel = verificationInfo.qualityMetrics 
      ? getQualityLevel(verificationInfo.qualityMetrics.overallScore)
      : null;

    return (
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              Verified Dataset
            </CardTitle>
            {qualityLevel && (
              <Badge className={qualityLevel.color + " text-white"}>
                <qualityLevel.icon className="h-3 w-3 mr-1" />
                {qualityLevel.level} Quality
              </Badge>
            )}
          </div>
          {verificationInfo.timestamp > 0 && (
            <CardDescription>
              Verified on {new Date(verificationInfo.timestamp * 1000).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              This dataset has been verified by{" "}
              <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                {formatAddress(verificationInfo.verifier)}
              </span>
            </p>

            {showQualityMetrics && verificationInfo.qualityMetrics && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Quality Score</span>
                    <span className="text-lg font-bold">
                      {verificationInfo.qualityMetrics.overallScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={verificationInfo.qualityMetrics.overallScore} 
                    className="h-2"
                  />
                </TabsContent>

                <TabsContent value="details" className="space-y-3">
                  {Object.entries({
                    Completeness: verificationInfo.qualityMetrics.completeness,
                    Consistency: verificationInfo.qualityMetrics.consistency,
                    Accuracy: verificationInfo.qualityMetrics.accuracy,
                    Uniqueness: verificationInfo.qualityMetrics.uniqueness,
                    Timeliness: verificationInfo.qualityMetrics.timeliness
                  }).map(([metric, value]) => (
                    <div key={metric} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{metric}</span>
                        <span className="font-medium">{value.toFixed(1)}%</span>
                      </div>
                      <Progress value={value} className="h-1" />
                    </div>
                  ))}
                  
                  {verificationInfo.qualityMetrics.validatedAt && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Quality metrics validated on{" "}
                      {verificationInfo.qualityMetrics.validatedAt.toLocaleDateString()}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-500">
          <Clock className="h-5 w-5" />
          Unverified Dataset
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This dataset has not been verified yet. Verification ensures the authenticity and integrity of the dataset.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Verification Benefits:</p>
                <ul className="text-yellow-700 mt-1 space-y-1">
                  <li>• Ensures data authenticity</li>
                  <li>• Provides quality metrics</li>
                  <li>• Increases trust and value</li>
                </ul>
              </div>
            </div>
          </div>

          {onVerifyClick && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 w-full"
              onClick={onVerifyClick}
            >
              <Shield className="h-4 w-4" />
              Request Verification
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}