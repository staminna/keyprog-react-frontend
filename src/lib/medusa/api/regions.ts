/**
 * Regions API Functions
 * Client-side region operations for Medusa
 * Handles regional pricing and country-specific settings
 */

import { sdk } from "../config";
import { HttpTypes } from "@medusajs/types";

// In-memory cache for regions mapped by country code
const regionMap = new Map<string, HttpTypes.StoreRegion>();

/**
 * List all available regions
 * @returns Array of regions
 */
export async function listRegions(): Promise<HttpTypes.StoreRegion[]> {
  try {
    const response = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(
      `/store/regions`,
      {
        method: "GET",
      }
    );
    return response.regions;
  } catch (error) {
    console.error("Error listing regions:", error);
    return [];
  }
}

/**
 * Retrieve a specific region by ID
 * @param id - Region ID
 * @returns Region object or null
 */
export async function retrieveRegion(id: string): Promise<HttpTypes.StoreRegion | null> {
  try {
    const response = await sdk.client.fetch<{ region: HttpTypes.StoreRegion }>(
      `/store/regions/${id}`,
      {
        method: "GET",
      }
    );
    return response.region;
  } catch (error) {
    console.error(`Error retrieving region ${id}:`, error);
    return null;
  }
}

/**
 * Get region by country code
 * Uses in-memory cache to avoid repeated API calls
 * @param countryCode - ISO 2-letter country code (e.g., "US", "GB")
 * @returns Region object or null
 */
export async function getRegion(countryCode: string): Promise<HttpTypes.StoreRegion | null> {
  try {
    // Check cache first
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode) || null;
    }

    // Fetch all regions and build cache
    const regions = await listRegions();

    if (!regions || regions.length === 0) {
      return null;
    }

    // Map all countries to their regions
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (c?.iso_2) {
          regionMap.set(c.iso_2, region);
        }
      });
    });

    // Return region for requested country code (default to US if not found)
    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us");

    return region || null;
  } catch (error) {
    console.error(`Error getting region for country ${countryCode}:`, error);
    return null;
  }
}

/**
 * Clear the regions cache
 * Useful when regions data needs to be refreshed
 */
export function clearRegionsCache(): void {
  regionMap.clear();
}

/**
 * Get default region (US region or first available)
 * @returns Default region object or null
 */
export async function getDefaultRegion(): Promise<HttpTypes.StoreRegion | null> {
  const regions = await listRegions();
  
  if (!regions || regions.length === 0) {
    return null;
  }

  // Try to find US region first
  const usRegion = regions.find((r) =>
    r.countries?.some((c) => c.iso_2 === "us")
  );

  // Return US region or first available region
  return usRegion || regions[0];
}
