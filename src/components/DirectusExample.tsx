/**
 * Example React Component showing Directus + MCP Integration
 * Demonstrates type-safe data fetching with schema awareness
 */

import React, { useState } from 'react';
import { useHeaderMenu, useServices, useSchemaAwareness } from '../hooks/useDirectusData';
import { DirectusHeaderMenu, DirectusServices } from '../types/directus-schema';
import { createMCPDirectusClient } from '../lib/mcp-directus';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface DirectusExampleProps {
  className?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const DirectusExample: React.FC<DirectusExampleProps> = ({ className = '' }) => {
  // Use our custom hooks for type-safe data fetching
  const { data: headerMenu, loading: headerLoading, error: headerError, refetch: refetchHeader } = useHeaderMenu();
  const { data: services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices(true);
  
  // Schema awareness for real-time schema monitoring
  const { schema, loading: schemaLoading, error: schemaError, hasChanges } = useSchemaAwareness();
  
  const [activeTab, setActiveTab] = useState<'data' | 'schema'>('data');
  const [mcpStatus, setMcpStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Test MCP connection
  const testMCPConnection = async () => {
    setMcpStatus('connecting');
    try {
      const mcpClient = await createMCPDirectusClient();
      const tools = await mcpClient.listAvailableTools();
      setMcpStatus('connected');
      console.log('✅ MCP Connected! Available tools:', tools.map(t => t.name));
      mcpClient.close();
    } catch (error) {
      setMcpStatus('disconnected');
      console.error('❌ MCP Connection failed:', error);
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([refetchHeader(), refetchServices()]);
  };

  return (
    <div className={`directus-example ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Directus + MCP Integration Example
          </h2>
          <p className="text-gray-600">
            Type-safe data fetching with real-time schema awareness
          </p>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatusCard 
            label="MCP Server" 
            status={mcpStatus} 
            onClick={testMCPConnection}
          />
          <StatusCard 
            label="Header Menu" 
            status={headerLoading ? 'loading' : headerError ? 'error' : 'success'} 
            count={headerMenu?.length || 0}
          />
          <StatusCard 
            label="Services" 
            status={servicesLoading ? 'loading' : servicesError ? 'error' : 'success'} 
            count={services?.length || 0}
          />
          <StatusCard 
            label="Schema" 
            status={schemaLoading ? 'loading' : schemaError ? 'error' : 'success'} 
            indicator={hasChanges ? 'changed' : undefined}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Data Display
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'schema'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Schema Awareness
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Header Menu Section */}
            <DataSection
              title="Header Menu"
              loading={headerLoading}
              error={headerError}
              data={headerMenu}
              renderItem={(item: DirectusHeaderMenu) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.link && <p className="text-sm text-gray-600">{item.link}</p>}
                  {item.sub_menu && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Submenu items: </span>
                      <span className="text-xs">{(item.sub_menu as any[])?.length || 0}</span>
                    </div>
                  )}
                </div>
              )}
              emptyMessage="No header menu items found"
            />

            {/* Services Section */}
            <DataSection
              title="Services"
              loading={servicesLoading}
              error={servicesError}
              data={services}
              renderItem={(item: DirectusServices) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  {item.slug && (
                    <p className="text-xs text-blue-600 mt-1">/{item.slug}</p>
                  )}
                </div>
              )}
              emptyMessage="No services found"
            />
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Schema Information</h3>
              {schema ? (
                <div className="text-sm">
                  <p><strong>Collections:</strong> {schema.collections?.length || 0}</p>
                  <p><strong>Fields:</strong> {schema.fields?.length || 0}</p>
                  <p><strong>Version:</strong> {schema.version || 'Unknown'}</p>
                  <p><strong>Directus:</strong> {schema.directus || 'Unknown'}</p>
                  <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-gray-600">Schema information not available</p>
              )}
            </div>
            
            {schemaError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">Schema Error: {schemaError}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={refreshAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh All Data
          </button>
          <button
            onClick={testMCPConnection}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Test MCP Connection
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface StatusCardProps {
  label: string;
  status: 'loading' | 'success' | 'error' | 'connected' | 'connecting' | 'disconnected';
  count?: number;
  indicator?: 'changed';
  onClick?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  label, 
  status, 
  count, 
  indicator,
  onClick 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'loading':
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
      case 'connected':
        return '✅';
      case 'loading':
      case 'connecting':
        return '⏳';
      case 'error':
      case 'disconnected':
        return '❌';
      default:
        return '⚪';
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getStatusColor()}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-sm">{getStatusIcon()}</span>
      </div>
      {count !== undefined && (
        <div className="text-lg font-bold">{count}</div>
      )}
      {indicator === 'changed' && (
        <div className="text-xs mt-1">🔄 Schema changed</div>
      )}
    </div>
  );
};

interface DataSectionProps<T> {
  title: string;
  loading: boolean;
  error: string | null;
  data: T[] | null;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage: string;
}

const DataSection = <T,>({ 
  title, 
  loading, 
  error, 
  data, 
  renderItem, 
  emptyMessage 
}: DataSectionProps<T>) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-gray-600">Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">
        {title} ({data.length})
      </h3>
      <div className="space-y-2">
        {data.map(renderItem)}
      </div>
    </div>
  );
};

export default DirectusExample;