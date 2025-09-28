'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { createDataset, lockDataset } from '@/lib/web3';
import { GenerationResult } from '@/lib/models';

interface UseDatasetPublisherProps {
  name: string;
  description: string;
  price: string;
  visibility: 'public' | 'private';
  modelId: string;
  generatedData: GenerationResult[] | null;
  commp: string | null;
  onSuccess?: () => void;
}

export function useDatasetPublisher() {
  const { address } = useAccount();
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = async (props: UseDatasetPublisherProps) => {
    console.log('🚀 [useDatasetPublisher] Starting publish process with props:', {
      hasCommp: !!props.commp,
      hasAddress: !!address,
      hasGeneratedData: !!props.generatedData,
      commp: props.commp,
      address,
      generatedDataLength: props.generatedData?.length
    });

    if (!props.commp || !address || !props.generatedData) {
      console.error('❌ [useDatasetPublisher] Missing required data:', {
        commp: props.commp,
        address,
        generatedData: props.generatedData
      });
      return;
    }

    setIsPublishing(true);
    toast.info("Publishing dataset to the blockchain...");

    try {
      const priceInWei = ethers.parseUnits(props.price, 6).toString();
      
      // Debug logs to track parameters
      console.log('📊 [useDatasetPublisher] Publishing dataset with parameters:', {
        name: props.name,
        description: props.description,
        price: priceInWei,
        isPublic: props.visibility !== 'private',
        modelId: props.modelId,
        taskId: 1,
        nodeId: 1,
        computeUnitsPrice: 100,
        maxComputeUnits: 1000000
      });

      console.log('🔗 [useDatasetPublisher] Calling createDataset...');
      const { datasetId } = await createDataset(
        props.name,
        props.description,
        priceInWei,
        props.visibility !== 'private',
        props.modelId,
        1, // taskId (default)
        1, // nodeId (default)
        100, // computeUnitsPrice (default)
        1000000 // maxComputeUnits (default)
      );

      console.log('✅ [useDatasetPublisher] createDataset completed with datasetId:', datasetId);

      if (datasetId) {
        toast.info(`Dataset created with ID: ${datasetId}. Locking with Filecoin CommP...`);
        
        console.log('🔍 [useDatasetPublisher] Analyzing generatedData structure:', {
          generatedDataLength: props.generatedData?.length,
          firstItem: props.generatedData?.[0],
          hasUsage: props.generatedData?.[0]?.usage,
          usageStructure: props.generatedData?.[0]?.usage
        });
        
        const totalTokens = props.generatedData?.reduce((acc, item) => {
          const tokens = item?.usage?.totalTokens || 0;
          console.log('🔢 [useDatasetPublisher] Processing item tokens:', { item: item?.input, tokens });
          return acc + tokens;
        }, 0) || 0;
        
        console.log('🔒 [useDatasetPublisher] Calling lockDataset with:', {
          datasetId,
          commp: props.commp,
          dataLength: props.generatedData?.length || 0,
          totalTokens
        });

        await lockDataset(
          datasetId,
          props.commp,
          props.generatedData?.length || 0,
          totalTokens
        );

        console.log('🎉 [useDatasetPublisher] lockDataset completed successfully');
        toast.success('Dataset published and locked successfully!');
        
        if (props.onSuccess) {
          console.log('🎯 [useDatasetPublisher] Calling onSuccess callback');
          props.onSuccess();
        } else {
          console.log('⚠️ [useDatasetPublisher] No onSuccess callback provided');
        }
      } else {
        console.error('❌ [useDatasetPublisher] createDataset returned no datasetId');
        throw new Error("Failed to create dataset on-chain.");
      }
    } catch (error) {
      console.error('💥 [useDatasetPublisher] Error publishing dataset:', error);
      toast.error('Failed to publish dataset');
      throw error; // Re-throw to let the caller handle it
    } finally {
      console.log('🏁 [useDatasetPublisher] Publishing process finished, setting isPublishing to false');
      setIsPublishing(false);
    }
  };

  return { isPublishing, publish };
}
