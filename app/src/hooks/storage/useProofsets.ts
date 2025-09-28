"use client";

import { useQuery } from "@tanstack/react-query";
import { EnhancedDataSetInfo, PDPServer } from "@filoz/synapse-sdk";
import { useAccount } from "wagmi";
import { useSynapse } from "@/providers/SynapseProvider";

export type DataSet = EnhancedDataSetInfo & {
  data?: any;
  provider?: any;
  pdpUrl?: string;
};

/**
 * Hook to fetch and manage user datasets from Filecoin storage
 *
 * @description This hook demonstrates a complex data fetching workflow:
 * 1. Initialize Synapse and WarmStorage services
 * 2. Fetch approved providers and user datasets in parallel
 * 3. Map provider relationships and fetch provider details
 * 4. Enrich datasets with provider information and PDP data
 * 5. Handle errors gracefully while maintaining data integrity
 * 6. Implement caching and background refresh strategies
 *
 * @returns React Query result containing enriched datasets with provider info
 *
 * @example
 * const { data, isLoading, error } = useDatasets();
 *
 * if (data?.datasets?.length > 0) {
 *   const firstPieceCid = data.datasets[0]?.data?.pieces[0]?.pieceCid;
 *   console.log('Flag (First Piece CID):', firstPieceCid);
 * }
 */
export const useDatasets = () => {
  const { address } = useAccount();
  const { synapse, warmStorageService } = useSynapse();

  return useQuery({
    enabled: !!address,
    queryKey: ["datasets", address],
    queryFn: async () => {
      // STEP 1: Validate prerequisites
      if (!synapse) throw new Error("Synapse not found");
      if (!address) throw new Error("Address not found");
      if (!warmStorageService)
        throw new Error("Warm storage service not found");

      // STEP 2: Fetch providers and datasets in parallel for efficiency
      const [providerIds, datasets] = await Promise.all([
        warmStorageService.getApprovedProviderIds(),
        warmStorageService.getClientDataSetsWithDetails(address),
      ]);

      // STEP 3: Create provider ID to address mapping from datasets
      const providerIdToAddressMap = datasets.reduce((acc, dataset) => {
        acc[dataset.providerId] = dataset.payee;
        return acc;
      }, {} as Record<number, string>);

      // STEP 4: Fetch provider information with error handling
      const providers = await Promise.all(
        providerIds.map(async (providerId) => {
          const providerAddress = providerIdToAddressMap[providerId];
          if (!providerAddress) {
            return null; // Skip if no address mapping exists
          }
          try {
            return await synapse.getProviderInfo(providerId);
          } catch (error) {
            console.warn(`Failed to fetch provider ${providerId}:`, error);
            return null; // Continue with other providers
          }
        })
      );

      // Filter out failed provider requests
      const filteredProviders = providers.filter(
        (provider) => provider !== null
      );

      // STEP 5: Create provider ID to service URL mapping
      const providerIdToServiceUrlMap = filteredProviders.reduce(
        (acc, provider) => {
          acc[provider.id] = provider.products.PDP?.data.serviceURL || "";
          return acc;
        },
        {} as Record<string, string>
      );

      // STEP 6: Fetch detailed dataset information with PDP data
      const datasetDetailsPromises = datasets.map(
        async (dataset: EnhancedDataSetInfo) => {
          const serviceURL = providerIdToServiceUrlMap[dataset.providerId];
          const provider = filteredProviders.find(
            (p) => p.id === dataset.providerId
          );

          try {
            // Connect to PDP server to get piece information
            const pdpServer = new PDPServer(null, serviceURL || "");
            const data = await pdpServer.getDataSet(
              dataset.pdpVerifierDataSetId
            );

            return {
              ...dataset,
              data,
              provider,
              pdpUrl: serviceURL,
            } as DataSet;
          } catch (error) {
            console.error(`Error fetching dataset ${dataset.pdpVerifierDataSetId}:`, error);
            return {
              ...dataset,
              data: null,
              provider,
              pdpUrl: serviceURL,
            } as DataSet;
          }
        }
      );

      const enrichedDatasets = await Promise.all(datasetDetailsPromises);

      return { datasets: enrichedDatasets };
    },
    retry: false,
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Export as useProofsets for backward compatibility
export const useProofsets = useDatasets;
