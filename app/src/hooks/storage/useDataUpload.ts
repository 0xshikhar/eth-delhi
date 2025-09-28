'use client';

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Synapse } from "@filoz/synapse-sdk";
import { useEthersSigner } from "@/hooks/storage/useEthers";
import { useConfetti } from "@/hooks/storage/useConfetti";
import { useAccount } from "wagmi";
import { useNetwork } from "@/hooks/storage/useNetwork";
import { useSynapse } from "@/providers/SynapseProvider";
import { preflightCheck } from "@/utils/preflightCheck";
import { getDataset } from "@/utils/getDataset";
import { config } from "@/config/storageConfig";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  commp?: string;
  cid?: string;
  pieceCid?: string;
  txHash?: string;
  transactionHash?: string;
};

/**
 * Hook to upload a data blob to the Filecoin network using Synapse.
 */
export const useDataUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);

  const signer = useEthersSigner();
  const { synapse } = useSynapse();
  const { triggerConfetti  } = useConfetti();
  const { address, chainId } = useAccount();
  const { data: network } = useNetwork();
  const mutation = useMutation({
    mutationKey: ["data-upload", address, chainId],
    mutationFn: async (data: any) => {
      console.log('🚀 [useDataUpload] Starting upload process with data:', {
        dataType: typeof data,
        dataLength: Array.isArray(data) ? data.length : 'N/A',
        dataSize: JSON.stringify(data).length,
        address,
        chainId,
        networkType: network
      });

      if (!synapse) throw new Error("Synapse not found");
      if (!address) throw new Error("Address not found");
      if (!chainId) throw new Error("Chain ID not found");
      if (!network) throw new Error("Network not found");
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing data upload to Filecoin...");

      console.log('📁 [useDataUpload] Creating File object from data');
      const file = new File([JSON.stringify(data, null, 2)], "dataset.json", { type: 'application/json' });
      console.log('📁 [useDataUpload] File created:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const arrayBuffer = await file.arrayBuffer();
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);
      console.log('🔄 [useDataUpload] File converted to bytes:', {
        arrayBufferSize: arrayBuffer.byteLength,
        uint8ArraySize: uint8ArrayBytes.length
      });

      // Use the shared synapse instance instead of creating a new one
      console.log('🔍 [useDataUpload] Finding existing datasets for address:', address);
      const datasets = await synapse.storage.findDataSets(address);
      const datasetExists = datasets.length > 0;
      const includeDatasetCreationFee = !datasetExists;
      console.log('📊 [useDataUpload] Dataset check result:', {
        existingDatasets: datasets.length,
        datasetExists,
        includeDatasetCreationFee
      });

      console.log('💰 [useDataUpload] Starting preflight check');
      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        file,
        synapse,
        includeDatasetCreationFee,
        setStatus,
        setProgress
      );
      console.log('✅ [useDataUpload] Preflight check completed');

      console.log('🔗 [useDataUpload] Setting up storage service and dataset');
      setStatus("🔗 Setting up storage service and dataset...");
      setProgress(25);

      let storageService;
      let usingCDN = false;

      try {
        // First attempt: Try with CDN if enabled
        if (config.withCDN) {
          console.log('🌐 [useDataUpload] Attempting to use CDN-enabled storage');
          setStatus("🌐 Attempting to use CDN-enabled storage...");
          storageService = await synapse.createStorage({
            callbacks: {
              onDataSetResolved: (info: any) => {
                console.log("📋 [useDataUpload] Dataset resolved:", info);
                setStatus("🔗 Existing dataset found and resolved");
                setProgress(30);
              },
              onDataSetCreationStarted: (transactionResponse: any, statusUrl: any) => {
                console.log("🏗️ [useDataUpload] Dataset creation started:", transactionResponse);
                console.log("📊 [useDataUpload] Dataset creation status URL:", statusUrl);
                setStatus("🏗️ Creating new dataset on blockchain...");
                setProgress(35);
              },
              onDataSetCreationProgress: (status: any) => {
                console.log("📊 [useDataUpload] Dataset creation progress:", status);
                if (status.transactionSuccess) {
                  setStatus(`⛓️ Dataset transaction confirmed on chain`);
                  setProgress(45);
                }
                if (status.serverConfirmed) {
                  setStatus(
                    `🎉 Dataset ready! (${Math.round(status.elapsedMs / 1000)}s)`
                  );
                  setProgress(50);
                }
              },
              onProviderSelected: (provider: any) => {
                console.log("🌐 [useDataUpload] CDN-enabled storage provider selected:", provider);
                setStatus(`🌐 CDN-enabled storage provider selected`);
              },
            },
          });
          usingCDN = true;
          console.log('✅ [useDataUpload] Successfully configured CDN-enabled storage');
        } else {
          throw new Error('CDN disabled, using fallback');
        }
      } catch (cdnError) {
        console.warn('⚠️ [useDataUpload] CDN storage failed, falling back to standard storage:', cdnError);
        
        // Fallback: Try without CDN
        setStatus("🔄 CDN unavailable, using standard storage...");
        setProgress(20);
        
        storageService = await synapse.createStorage({
          callbacks: {
            onDataSetResolved: (info: any) => {
              console.log("📋 [useDataUpload] Dataset resolved:", info);
              setStatus("🔗 Existing dataset found and resolved");
              setProgress(30);
            },
            onDataSetCreationStarted: (transactionResponse: any, statusUrl: any) => {
              console.log("🏗️ [useDataUpload] Dataset creation started:", transactionResponse);
              console.log("📊 [useDataUpload] Dataset creation status URL:", statusUrl);
              setStatus("🏗️ Creating new dataset on blockchain...");
              setProgress(35);
            },
            onDataSetCreationProgress: (status: any) => {
              console.log("📊 [useDataUpload] Dataset creation progress:", status);
              if (status.transactionSuccess) {
                setStatus(`⛓️ Dataset transaction confirmed on chain`);
                setProgress(45);
              }
              if (status.serverConfirmed) {
                setStatus(
                  `🎉 Dataset ready! (${Math.round(status.elapsedMs / 1000)}s)`
                );
                setProgress(50);
              }
            },
            onProviderSelected: (provider: any) => {
              console.log("🏪 [useDataUpload] Standard storage provider selected:", provider);
              setStatus(`🏪 Standard storage provider selected`);
            },
          },
        });
        usingCDN = false;
        console.log('✅ [useDataUpload] Successfully configured standard storage');
      }

      console.log('📤 [useDataUpload] Starting file upload');
      setStatus("📤 Uploading file to Filecoin...");
      setProgress(55);

      const uploadResult = await storageService.upload(uint8ArrayBytes, {
        onUploadComplete: (piece: any) => {
          console.log('✅ [useDataUpload] Upload completed:', piece);
          setStatus("✅ Upload completed successfully!");
          setProgress(80);
          setUploadedInfo({
            fileName: file.name,
            fileSize: file.size,
            pieceCid: piece.toV1().toString(),
            cid: piece.toV1().toString(),
            commp: piece.toV1().toString(), // Use pieceCid as commp
            txHash: undefined, // Will be set in onPieceAdded
          });
        },
        onPieceAdded: (transactionResponse?: any) => {
          console.log('🧩 [useDataUpload] Piece added with transaction:', transactionResponse);
          setStatus("🧩 File piece added to storage network");
          setProgress(90);
          if (transactionResponse) {
            setUploadedInfo((prev) => ({
              ...prev,
              txHash: transactionResponse?.hash,
            }));
          }
        },
        onPieceConfirmed: (pieceIds: number[]) => {
          console.log('✅ [useDataUpload] Piece confirmed with IDs:', pieceIds);
          setStatus("✅ File piece confirmed on network");
          setProgress(95);
        },
      });

      console.log('🎉 [useDataUpload] Upload process completed successfully:', {
        uploadResult,
        usingCDN,
        finalStatus: 'success'
      });

      // Final update with pieceCid from uploadResult
      setProgress(100);
      setUploadedInfo((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        pieceCid: uploadResult.pieceCid.toV1().toString(),
        cid: uploadResult.pieceCid.toV1().toString(),
        commp: uploadResult.pieceCid.toV1().toString(), // Use pieceCid as commp
      }));
      
      console.log('🎉 [useDataUpload] Upload mutation completed successfully');
    },
    onSuccess: () => {
      setStatus("🎉 Data successfully stored on Filecoin!");
      setProgress(100);
      triggerConfetti();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
  };

  return {
    uploadDataMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
};
