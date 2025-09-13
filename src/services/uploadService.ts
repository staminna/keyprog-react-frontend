import { DirectusService } from './directusService';

/**
 * Interface for backend synchronization options
 */
export interface BackendSyncOptions {
  /**
   * Whether to sync with backend after upload
   */
  syncWithBackend?: boolean;
  
  /**
   * The backend endpoint to call after successful upload
   */
  backendEndpoint?: string;
  
  /**
   * Additional data to send to the backend
   */
  additionalData?: Record<string, unknown>;
  
  /**
   * Whether to wait for backend response before resolving
   */
  waitForBackendResponse?: boolean;
}

/**
 * Service for handling file uploads to Directus with backend synchronization
 */
export class UploadService {
  /**
   * Upload a file to Directus
   * @param file The file to upload
   * @param folder Optional folder ID to place the file in
   * @param syncOptions Options for backend synchronization
   * @returns The uploaded file object with ID and other metadata
   */
  static async uploadFile(
    file: File, 
    folder?: string, 
    syncOptions?: BackendSyncOptions
  ): Promise<{ id: string; filename_disk: string; filesize: number; width?: number; height?: number; type: string; backendResponse?: Record<string, unknown> }> {
    try {
      // Ensure we're authenticated
      await DirectusService.initialize();
      
      // Get the Directus URL from environment
      const baseUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
      const url = `${baseUrl}/files`;
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Add folder if specified
      if (folder) {
        formData.append('folder', folder);
      }
      
      // Get the authentication token with multiple fallback methods
      let token = '';
      
      try {
        // Method 1: Check if we're in Directus editor context
        const editorContext = await DirectusService['checkDirectusEditor']();
        const isInDirectusEditor = editorContext.isEditor;
        
        if (isInDirectusEditor) {
          // Try to get parent token if available
          if (DirectusService['parentToken']) {
            token = DirectusService['parentToken'];
            console.log('Using parent token from DirectusService for file upload');
          } 
          // Try to get token from parent window if available
          else if (window.parent !== window) {
            try {
              // Check if parent has Directus API or token available
              const parentDirectus = (window.parent as Window & { directus?: { getToken: () => string } }).directus;
              if (parentDirectus && typeof parentDirectus.getToken === 'function') {
                token = await parentDirectus.getToken();
                if (token) {
                  console.log('Retrieved parent Directus token for file upload');
                }
              }
              
              // Alternative: check for token in parent localStorage
              if (!token) {
                const parentToken = (window.parent as Window & { localStorage?: Storage }).localStorage?.getItem('directus_token');
                if (parentToken) {
                  token = parentToken;
                  console.log('Retrieved parent Directus token from localStorage for file upload');
                }
              }
            } catch (tokenError) {
              console.warn('Could not retrieve parent token for file upload:', tokenError);
            }
          }
        }
        
        // Method 2: Use session token if no parent token available
        if (!token) {
          const sessionDirectus = (await import('@/lib/directus')).sessionDirectus;
          token = await sessionDirectus.getToken() || '';
          if (token) {
            console.log('Using session token for file upload');
          }
        }
        
        // Method 3: Use static token as last resort
        if (!token) {
          const staticToken = import.meta.env.VITE_DIRECTUS_TOKEN;
          if (staticToken && staticToken.trim()) {
            token = staticToken;
            console.log('Using static token for file upload');
          }
        }
      } catch (tokenError) {
        console.error('Error getting authentication token:', tokenError);
      }
      
      // If still no token, try one last attempt with DirectusService
      if (!token) {
        try {
          await DirectusService.initialize();
          await DirectusService.authenticate();
          // Try again with session token
          const sessionDirectus = (await import('@/lib/directus')).sessionDirectus;
          token = await sessionDirectus.getToken() || '';
        } catch (authError) {
          console.error('Authentication attempt failed:', authError);
        }
      }
      
      if (!token) {
        console.error('No authentication token available for file upload');
        throw new Error('No authentication token available for file upload');
      }
      
      // Make the upload request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      const uploadedFile = result.data;
      
      // Sync with backend if requested
      if (syncOptions?.syncWithBackend && syncOptions.backendEndpoint) {
        try {
          console.log(`Syncing uploaded file with backend at ${syncOptions.backendEndpoint}`);
          
          // Prepare data for backend
          const backendData = {
            fileId: uploadedFile.id,
            fileName: uploadedFile.filename_disk,
            fileType: uploadedFile.type,
            fileSize: uploadedFile.filesize,
            width: uploadedFile.width,
            height: uploadedFile.height,
            ...syncOptions.additionalData
          };
          
          // Call backend endpoint
          const backendResponse = await fetch(syncOptions.backendEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Include authorization if available
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(backendData)
          });
          
          if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error(`Backend sync failed: ${backendResponse.status} ${backendResponse.statusText} - ${errorText}`);
            
            // If not waiting for backend response, just log the error
            if (!syncOptions.waitForBackendResponse) {
              return uploadedFile;
            }
            
            throw new Error(`Backend sync failed: ${backendResponse.status} ${backendResponse.statusText}`);
          }
          
          // If waiting for backend response, include it in the result
          if (syncOptions.waitForBackendResponse) {
            const backendResult = await backendResponse.json();
            return { ...uploadedFile, backendResponse: backendResult };
          }
        } catch (syncError) {
          console.error('Backend synchronization failed:', syncError);
          
          // If not waiting for backend response, just log the error
          if (!syncOptions.waitForBackendResponse) {
            return uploadedFile;
          }
          
          throw syncError;
        }
      }
      
      return uploadedFile;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing file in Directus and sync with backend
   * @param fileId The ID of the file to update
   * @param metadata Metadata to update
   * @param syncOptions Options for backend synchronization
   * @returns The updated file object
   */
  static async updateFile(
    fileId: string, 
    metadata: Record<string, unknown>,
    syncOptions?: BackendSyncOptions
  ): Promise<{ id: string; backendResponse?: Record<string, unknown> }> {
    try {
      // Ensure we're authenticated
      await DirectusService.initialize();
      
      // Get the Directus URL from environment
      const baseUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
      const url = `${baseUrl}/files/${fileId}`;
      
      // Get the authentication token
      let token = '';
      
      // Check if we're in Directus editor context
      const isInDirectusEditor = await DirectusService['checkDirectusEditor']()
        .then(result => result.isEditor)
        .catch(() => false);
      
      if (isInDirectusEditor && DirectusService['parentToken']) {
        // Use parent token if in Directus editor
        token = DirectusService['parentToken'];
      } else {
        // Otherwise use session token
        const sessionDirectus = (await import('@/lib/directus')).sessionDirectus;
        token = await sessionDirectus.getToken() || '';
      }
      
      if (!token) {
        throw new Error('No authentication token available for file update');
      }
      
      // Make the update request
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      const updatedFile = result.data;
      
      // Sync with backend if requested
      if (syncOptions?.syncWithBackend && syncOptions.backendEndpoint) {
        try {
          console.log(`Syncing updated file with backend at ${syncOptions.backendEndpoint}`);
          
          // Prepare data for backend
          const backendData = {
            fileId: updatedFile.id,
            metadata,
            ...syncOptions.additionalData
          };
          
          // Call backend endpoint
          const backendResponse = await fetch(syncOptions.backendEndpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(backendData)
          });
          
          if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error(`Backend sync failed: ${backendResponse.status} ${backendResponse.statusText} - ${errorText}`);
            
            // If not waiting for backend response, just log the error
            if (!syncOptions.waitForBackendResponse) {
              return updatedFile;
            }
            
            throw new Error(`Backend sync failed: ${backendResponse.status} ${backendResponse.statusText}`);
          }
          
          // If waiting for backend response, include it in the result
          if (syncOptions.waitForBackendResponse) {
            const backendResult = await backendResponse.json();
            return { ...updatedFile, backendResponse: backendResult };
          }
        } catch (syncError) {
          console.error('Backend synchronization failed:', syncError);
          
          // If not waiting for backend response, just log the error
          if (!syncOptions.waitForBackendResponse) {
            return updatedFile;
          }
          
          throw syncError;
        }
      }
      
      return updatedFile;
    } catch (error) {
      console.error('File update failed:', error);
      throw error;
    }
  }
  
  /**
   * Get the full URL for a file by its ID
   * @param fileId The file ID
   * @returns The full URL to the file
   */
  static getFileUrl(fileId: string): string {
    if (!fileId) return '';
    const baseUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
    return `${baseUrl}/assets/${fileId}`;
  }
}
