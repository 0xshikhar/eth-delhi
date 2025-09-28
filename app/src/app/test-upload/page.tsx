"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { FileUploader } from "@/components/storage/FileUploader";
import { UploadedInfo } from "@/hooks/storage/useFileUpload";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, FileText, Hash, Clock } from "lucide-react";

export default function TestUploadPage() {
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleUploadComplete = (info: UploadedInfo) => {
    setUploadedInfo(info);
    // For now, we'll set parsedData to null since we don't have parsed data
    // This might need to be updated based on how the file parsing is handled
    setParsedData(null);
  };

  const handleReset = () => {
    setUploadedInfo(null);
    setParsedData(null);
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Test File Upload</h1>
            <p className="text-muted-foreground mt-2">
              Test the file upload functionality to IPFS and Filecoin network
            </p>
          </div>

          {!uploadedInfo ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Test File
                </CardTitle>
                <CardDescription>
                  Upload a JSON or CSV file to test the storage functionality. 
                  The file will be uploaded to IPFS and stored on the Filecoin network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onUploadComplete={handleUploadComplete} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Upload Successful!
                  </CardTitle>
                  <CardDescription>
                    Your file has been successfully uploaded and stored on the decentralized network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadedInfo.fileName && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">File Name:</span>
                        <Badge variant="secondary">{uploadedInfo.fileName}</Badge>
                      </div>
                    )}
                    
                    {uploadedInfo.fileSize && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">File Size:</span>
                        <Badge variant="secondary">
                          {(uploadedInfo.fileSize / 1024).toFixed(2)} KB
                        </Badge>
                      </div>
                    )}
                    
                    {uploadedInfo.cid && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Content ID (CID):</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {uploadedInfo.cid.slice(0, 20)}...
                        </Badge>
                      </div>
                    )}
                    
                    {uploadedInfo.pieceCid && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Piece CID:</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {uploadedInfo.pieceCid.slice(0, 20)}...
                        </Badge>
                      </div>
                    )}
                    
                    {uploadedInfo.txHash && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Transaction Hash:</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {uploadedInfo.txHash.slice(0, 20)}...
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleReset} variant="outline">
                      Upload Another File
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {parsedData && (
                <Card>
                  <CardHeader>
                    <CardTitle>File Content Preview</CardTitle>
                    <CardDescription>
                      Preview of the uploaded file content (first 10 items shown)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                      {JSON.stringify(
                        Array.isArray(parsedData) 
                          ? parsedData.slice(0, 10) 
                          : parsedData, 
                        null, 
                        2
                      )}
                    </pre>
                    {Array.isArray(parsedData) && parsedData.length > 10 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ... and {parsedData.length - 10} more items
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}