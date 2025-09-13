# Implementation Details: Bidirectional Data Flow

This document provides technical details about the implementation of bidirectional data flow between React and Directus in the Keyprog application.

## Core Issues Fixed

### 1. File Upload Authentication

**Problem:** File uploads were failing with "No authentication token available for file upload" errors, particularly in iframe contexts like the Directus Visual Editor.

**Solution:**
- Enhanced token retrieval with multiple fallback mechanisms in `UploadService`
- Added support for retrieving tokens from parent windows in iframe contexts
- Implemented cascading authentication methods (parent token → session token → static token)
- Added detailed logging for authentication processes

### 2. Two-Way Data Binding

**Problem:** Changes to phone numbers and titles weren't being properly synchronized between components without requiring a page refresh.

**Solution:**
- Implemented `useAutoRefresh` hook for automatic data synchronization
- Created optimistic UI updates for immediate feedback
- Added parallel update mechanisms to update multiple collections simultaneously
- Implemented real-time content refreshing with configurable intervals

### 3. Error Handling and Recovery

**Problem:** Errors during data fetching or updating weren't properly handled, leading to broken UI states.

**Solution:**
- Enhanced error handling with proper TypeScript typing
- Added fallback mechanisms for failed requests
- Implemented error state displays with retry options
- Created recovery mechanisms to revert to previous state on update failures

## Key Components

### 1. `useAutoRefresh` Hook

A custom React hook that provides automatic data refreshing capabilities:

```typescript
const {
  data,            // The fetched data
  isLoading,       // Loading state for initial fetch
  error,           // Error state
  refresh,         // Function to manually trigger a refresh
  isRefreshing,    // Whether a refresh is in progress
  lastRefreshTime  // Timestamp of the last successful refresh
} = useAutoRefresh(fetchFunction, options);
```

**Features:**
- Configurable refresh intervals
- Automatic retry on failure
- Conditional refreshing based on component state
- Manual refresh capability
- Detailed refresh history

### 2. `ContactService`

Service for handling contact information with bidirectional synchronization:

**Features:**
- Multiple fallback data sources (contact_info → settings → contacts)
- Parallel updates to all relevant collections
- Special handling for critical fields like phone numbers
- Direct API fallback for when standard methods fail

### 3. Enhanced `UniversalContentEditor`

Updated to support real-time bidirectional data flow:

**Features:**
- Auto-refresh capability with visual indicators
- Optimistic UI updates for immediate feedback
- Manual refresh button for on-demand updates
- Enhanced error handling and recovery

### 4. `TestBidirectionalPage`

Test page demonstrating the bidirectional data flow:

**Features:**
- Multiple synchronized components displaying the same data
- Real-time updates across components
- Different editing interfaces for the same underlying data
- Universal editor tester for any collection and field

## Implementation Approach

### 1. Parallel Updates

For critical data like contact information, we use `Promise.allSettled` to update multiple collections in parallel:

```typescript
const updatePromises = [
  // Update contact_info singleton
  DirectusServiceExtension.updateField('contact_info', 'contact_info', field, value),
  
  // Update settings
  DirectusService.updateSettings({ [settingsField]: value }),
  
  // Update contacts collection
  DirectusService.updateCollectionItem('contacts', contactId, { [field]: value })
];

const results = await Promise.allSettled(updatePromises);
```

This ensures that data is consistent across all collections, even if some updates fail.

### 2. Optimistic Updates

For better user experience, we update the UI immediately before the API call completes:

```typescript
// Optimistically update local state first
setLocalContent(newContent);
setParsedContent(formatContentForDisplay(newContent));

// Then update in Directus
await DirectusServiceExtension.updateField(collection, itemId, field, newContent);
```

If the API call fails, we revert to the previous state.

### 3. Token Inheritance in iframes

To solve authentication issues in iframe contexts (like Directus Visual Editor), we implemented a cascading token retrieval system:

```typescript
// Try to get parent token if available
if (DirectusService['parentToken']) {
  token = DirectusService['parentToken'];
} 
// Try to get token from parent window if available
else if (window.parent !== window) {
  try {
    // Check if parent has Directus API or token
    const parentDirectus = window.parent.directus;
    if (parentDirectus && typeof parentDirectus.getToken === 'function') {
      token = await parentDirectus.getToken();
    }
    
    // Alternative: check for token in parent localStorage
    if (!token) {
      const parentToken = window.parent.localStorage?.getItem('directus_token');
      if (parentToken) {
        token = parentToken;
      }
    }
  } catch (tokenError) {
    // Handle cross-origin restrictions
  }
}
```

## Testing the Implementation

To test the bidirectional data flow:

1. Navigate to `/test-bidirectional` to access the test page
2. Edit content in any of the editor components
3. Observe how changes are automatically reflected in other components
4. Test the phone number updating functionality specifically
5. Try uploading images to verify the authentication fix

## Future Improvements

1. **Websocket Integration**: Replace polling with websocket connections for real-time updates
2. **Conflict Resolution**: Add mechanisms to handle concurrent edits
3. **Offline Support**: Implement offline editing capabilities with synchronization on reconnect
4. **Performance Optimization**: Reduce unnecessary refreshes with more intelligent change detection
5. **Enhanced Error Recovery**: Add more sophisticated error recovery mechanisms

## Conclusion

The implemented bidirectional data flow system provides a robust foundation for real-time content editing in the Keyprog application. By addressing the core issues of authentication in iframe contexts and ensuring proper data synchronization across components, we've created a seamless editing experience that works reliably in both standalone and embedded contexts.
