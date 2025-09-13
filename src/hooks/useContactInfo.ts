import { useState, useEffect, useCallback } from 'react';
import { DirectusService } from '@/services/directusService';
import type { DirectusContactInfo } from '@/lib/directus';

interface UseContactInfoOptions {
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

interface UseContactInfoResult {
  contactInfo: DirectusContactInfo | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateContactInfo: (data: Partial<DirectusContactInfo>) => Promise<boolean>;
  isSyncing: boolean;
}

/**
 * Custom hook for bidirectional contact information management
 * Provides real-time synchronization between React and Directus
 */
export function useContactInfo(options: UseContactInfoOptions = {}): UseContactInfoResult {
  const { autoSync = true, syncInterval = 30000 } = options;
  
  const [contactInfo, setContactInfo] = useState<DirectusContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Fetch contact information from Directus
  const fetchContactInfo = useCallback(async () => {
    try {
      setIsSyncing(true);
      const info = await DirectusService.getContactInfo();
      setContactInfo(info);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contact information'));
      console.error('Error fetching contact info:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);
  
  // Update contact information in Directus
  const updateContactInfo = useCallback(async (data: Partial<DirectusContactInfo>): Promise<boolean> => {
    if (!contactInfo) return false;
    
    try {
      setIsSyncing(true);
      
      // Merge new data with existing data
      const updatedData = {
        ...contactInfo,
        ...data
      };
      
      // Update in Directus
      await DirectusService.updateCollectionItem('contact_info', contactInfo.id, updatedData);
      
      // Update local state
      setContactInfo(updatedData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update contact information'));
      console.error('Error updating contact info:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [contactInfo]);
  
  // Initial fetch
  useEffect(() => {
    fetchContactInfo();
  }, [fetchContactInfo]);
  
  // Set up auto-sync if enabled
  useEffect(() => {
    if (!autoSync) return;
    
    const intervalId = setInterval(() => {
      fetchContactInfo();
    }, syncInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [autoSync, fetchContactInfo, syncInterval]);
  
  return {
    contactInfo,
    isLoading,
    error,
    refresh: fetchContactInfo,
    updateContactInfo,
    isSyncing
  };
}

export default useContactInfo;
