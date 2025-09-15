import React, { useState, useEffect } from 'react';
import { DirectusServiceWrapper } from '@/services/directusServiceWrapper';
import { formatContentForDisplay, cleanContentForSaving } from '@/utils/contentParserV2';
import { type DirectusSettings, type DirectusHero, type DirectusContactInfo } from '@/lib/directus';

/**
 * Test component to verify content formatting works correctly
 */
export const ContentFormatterTest: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [hero, setHero] = useState<Record<string, unknown> | null>(null);
  const [contactInfo, setContactInfo] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testContent, setTestContent] = useState('doc(paragraph("Test content"))');
  const [formattedContent, setFormattedContent] = useState('');
  const [cleanedContent, setCleanedContent] = useState('');
  const [updateResult, setUpdateResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load test data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load hero data as settings replacement
        const settingsData = await DirectusServiceWrapper.getHero();
        setSettings(settingsData as Record<string, unknown>);
        
        // Load hero
        const heroData = await DirectusServiceWrapper.getHero();
        setHero(heroData as unknown as Record<string, unknown>);
        
        // Load contact info
        const contactInfoData = await DirectusServiceWrapper.getContactInfo();
        setContactInfo(contactInfoData as unknown as Record<string, unknown>);
        
        // Format test content
        const formatted = formatContentForDisplay(testContent);
        setFormattedContent(formatted);
        
        // Clean test content
        const cleaned = cleanContentForSaving(testContent);
        setCleanedContent(cleaned);
        
        setError(null);
      } catch (err) {
        console.error('Error loading test data:', err);
        setError('Failed to load test data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [testContent]);

  // Test updating content
  const handleTestUpdate = async () => {
    try {
      setIsLoading(true);
      
      // Create test content with doc(paragraph(...)) syntax
      const testData = {
        title: 'doc(paragraph("Test Title"))',
        subtitle: 'doc(paragraph("Test Subtitle"))'
      };
      
      // Update hero with test content
      const result = await DirectusServiceWrapper.updateHero(testData);
      
      // Verify the result doesn't contain doc(paragraph(...)) syntax
      const hasDocSyntax = Object.values(result).some(
        value => typeof value === 'string' && value.includes('doc(paragraph(')
      );
      
      setUpdateResult(
        hasDocSyntax 
          ? 'Update failed: doc(paragraph(...)) syntax still present' 
          : 'Update successful: doc(paragraph(...)) syntax removed'
      );
      
      // Reload hero data
      const heroData = await DirectusServiceWrapper.getHero();
      setHero(heroData as unknown as Record<string, unknown>);
      
      setError(null);
    } catch (err) {
      console.error('Error testing update:', err);
      setError('Failed to test update');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading test data...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Content Formatter Test</h1>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Content Formatting</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-2">Original Content</h3>
            <pre className="bg-gray-100 p-2 rounded">{testContent}</pre>
          </div>
          
          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-2">Formatted Content</h3>
            <pre className="bg-gray-100 p-2 rounded">{formattedContent}</pre>
          </div>
          
          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-2">Cleaned Content</h3>
            <pre className="bg-gray-100 p-2 rounded">{cleanedContent}</pre>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Data from Directus</h2>
        
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-2">Settings</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
        
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-2">Hero</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(hero, null, 2)}
          </pre>
        </div>
        
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-2">Contact Info</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(contactInfo, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Update</h2>
        
        <button
          onClick={handleTestUpdate}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Update'}
        </button>
        
        {updateResult && (
          <div className={`p-4 rounded-md ${
            updateResult.includes('successful') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {updateResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentFormatterTest;
