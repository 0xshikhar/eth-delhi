import { Synapse, WarmStorageService } from "@filoz/synapse-sdk";
import { config } from "@/config/storageConfig";

// Pick the provider that has the most used storage
// in a dataset with the client
export const getDataset = async (
  synapse: Synapse,
  address: string
) => {
  const warmStorageService = await WarmStorageService.create(
    synapse.getProvider(),
    synapse.getWarmStorageAddress()
  );
  
  let providerId;
  let bestDataset;
  
  try {
    const allDatasets = await warmStorageService.getClientDataSetsWithDetails(address);

    const datasetsWithCDN = allDatasets.filter((dataset) => dataset.withCDN);
    const datasetsWithoutCDN = allDatasets.filter((dataset) => !dataset.withCDN);

    const datasets = config.withCDN ? datasetsWithCDN : datasetsWithoutCDN;

    if (datasets.length === 0) {
      console.warn('No datasets found for the specified CDN preference');
      // Try the other type if no datasets found
      const fallbackDatasets = config.withCDN ? datasetsWithoutCDN : datasetsWithCDN;
      if (fallbackDatasets.length > 0) {
        console.log('Using fallback datasets with different CDN preference');
        bestDataset = fallbackDatasets.reduce((max, dataset) => {
          return dataset.currentPieceCount > max.currentPieceCount ? dataset : max;
        }, fallbackDatasets[0]);
      }
    } else {
      bestDataset = datasets.reduce((max, dataset) => {
        return dataset.currentPieceCount > max.currentPieceCount ? dataset : max;
      }, datasets[0]);
    }

    if (bestDataset) {
      providerId = bestDataset.providerId;
      console.log(`Found provider ID: ${providerId} for dataset`);
    } else {
      console.warn('No datasets found for this address');
    }
  } catch (error) {
    console.error("Error getting providerId", error);
  }
  
  return { providerId, dataset: bestDataset };
};