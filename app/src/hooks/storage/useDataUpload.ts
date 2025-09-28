'use client';

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Synapse } from "@filoz/synapse-sdk";
import { useEthersSigner } from "@/hooks/storage/useEthers";
import { useConfetti } from "@/hooks/storage/useConfetti";
import { useAccount } from "wagmi";
import { useNetwork } from "@/hooks/storage/useNetwork";
import { preflightCheck } from "@/utils/preflightCheck";
import { getDataset } from "@/utils/getDataset";
import { config } from "@/config/storageConfig";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  commp?: string;
  cid?: string;
  txHash?: string;
};

/**
 * Hook to upload a data blob to the Filecoin network using Synapse.
 */
export const useDataUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);

  const signer = useEthersSigner();
  const { triggerConfetti  } = useConfetti();
  const { address, chainId } = useAccount();
  const { data: network } = useNetwork();
  const mutation = useMutation({
    mutationKey: ["data-upload", address, chainId],
    mutationFn: async (data: any) => {
      if (!signer) throw new Error("Signer not found");
      if (!address) throw new Error("Address not found");
      if (!chainId) throw new Error("Chain ID not found");
      if (!network) throw new Error("Network not found");
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing data upload to Filecoin...");

      const file = new File([JSON.stringify(data, null, 2)], "dataset.json", { type: 'application/json' });
      const arrayBuffer = await file.arrayBuffer();
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);

      const synapse = await Synapse.create({
        provider: signer.provider as any,
        disableNonceManager: false,
        withCDN: config.withCDN,
      });

      const { providerId } = await getDataset(synapse, address);
      const withProofset = !!providerId;

      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        file,
        synapse,
        withProofset,
        setStatus,
        setProgress
      );

      setStatus("🔗 Setting up storage service and proof set...");
      setProgress(25);

      const storageService = await synapse.createStorage({
        callbacks: {
          onDataSetResolved: (info: any) => {
            console.log("Dataset resolved:", info);
            setStatus("🔗 Existing dataset found and resolved");
            setProgress(30);
          },
          onDataSetCreationStarted: (transactionResponse: any, statusUrl: any) => {
            console.log("Dataset creation started:", transactionResponse);
            console.log("Dataset creation status URL:", statusUrl);
            setStatus("🏗️ Creating new dataset on blockchain...");
            setProgress(35);
          },
          onDataSetCreationProgress: (status: any) => {
            console.log("Dataset creation progress:", status);
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
            console.log("Storage provider selected:", provider);
            setStatus(`🏪 Storage provider selected`);
          },
        },
      });

      setStatus("📁 Uploading data to storage provider...");
      setProgress(55);
      const { pieceCid } = await storageService.upload(uint8ArrayBytes, {
        onUploadComplete: (piece: any) => {
          setStatus(
            `📊 Data uploaded! Signing msg to add pieces to the dataset`
          );
          setUploadedInfo((prev) => ({
            ...prev,
            fileName: file.name,
            fileSize: file.size,
            cid: piece.toV1().toString(),
          }));
          setProgress(80);
        },
        onPieceAdded: async (transactionResponse: any) => {
          setStatus(
            `🔄 Waiting for transaction to be confirmed on chain${
              transactionResponse ? `(txHash: ${transactionResponse.hash})` : ""
            }`
          );
          if (transactionResponse) {
            const receipt = await transactionResponse.wait();
            console.log("Receipt:", receipt);
            setUploadedInfo((prev) => ({
              ...prev,
              txHash: transactionResponse?.hash,
            }));
          }
          setStatus(`🔄 Waiting for storage provider confirmation`);
          setProgress(85);
        },
        onPieceConfirmed: (pieceIds: any) => {
          setStatus("🌳 Data pieces added to dataset successfully");
          setProgress(90);
        },
      });

      if (!uploadedInfo?.txHash) {
        await new Promise((resolve) => setTimeout(resolve, 50000));
      }

      setProgress(95);
      setUploadedInfo((prev) => ({
        ...prev,
        fileSize: file.size,
        cid: pieceCid.toString(),
      }));
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
