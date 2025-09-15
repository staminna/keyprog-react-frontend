import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ContactService } from '@/services/contactService';
import type { DirectusContactInfo } from '@/lib/directus';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';
import { usePersistentContent } from '@/hooks/usePersistentContent';
import { Loader2, Phone, Mail, Clock, Link as LinkIcon, RefreshCw } from 'lucide-react';

interface ContactInfoEditorProps {
  className?: string;
}

/**
 * Dedicated component for editing contact information
 * Fixes phone number updating and other contact fields
 */
export const ContactInfoEditor: React.FC<ContactInfoEditorProps> = ({
  className = ''
}) => {
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const { canEditCollection } = useRolePermissions();
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Memoize permission checks to prevent excessive re-renders
  const canEdit = useMemo(() => {
    const hasAuthPermission = isInDirectusEditor || isAuthenticated;
    const hasRolePermission = canEditCollection('contact_info');
    return hasAuthPermission && hasRolePermission;
  }, [isInDirectusEditor, isAuthenticated, canEditCollection]);

  // Use a simple state for contact info since UniversalContentEditor handles persistence per field
  const [contactInfo, setContactInfo] = useState<DirectusContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadContactInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await ContactService.getContactInfo();
      setContactInfo(info);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load contact info'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadContactInfo();
  }, [loadContactInfo]);
  
  const handleFieldUpdate = async (field: string, value: unknown) => {
    if (!canEdit || !contactInfo) return;

    try {
      const success = await ContactService.updateContactField(field, value);
      if (success) {
        console.log(`Successfully updated ${field}`);
        await loadContactInfo(); // Refresh data to ensure consistency
      } else {
        throw new Error(`Failed to update ${field}`);
      }
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      setUpdateError(`Failed to update ${field}. Please try again.`);
      setTimeout(() => setUpdateError(null), 3000);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (error && !contactInfo) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-md text-red-800 ${className}`}>
        <p className="mb-2">{error.message}</p>
        <button 
          onClick={() => loadContactInfo()}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Render contact info editor
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">
          <UniversalContentEditor
            collection="contact_info"
            itemId={contactInfo?.id || 'contact_info'}
            field="title"
            value={typeof contactInfo?.title === 'string' ? contactInfo.title : 'Contact Information'}
            className="text-2xl font-bold"
          />
        </h2>
        
        {updateError && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {updateError}
          </div>
        )}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => loadContactInfo()}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <RefreshCw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Email */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <Mail size={18} className="mr-2 text-blue-500" />
              <label className="text-sm font-medium text-gray-700">Email</label>
            </div>
            <UniversalContentEditor
              collection="contact_info"
              itemId={contactInfo?.id || 'contact_info'}
              field="email"
              value={typeof contactInfo?.email === 'string' ? contactInfo.email : ''}
              className="w-full"
            />
          </div>
          
          {/* Phone - with special handling */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <Phone size={18} className="mr-2 text-blue-500" />
              <label className="text-sm font-medium text-gray-700">Phone</label>
            </div>
            <UniversalContentEditor
              collection="contact_info"
              itemId={contactInfo?.id || 'contact_info'}
              field="phone"
              value={typeof contactInfo?.phone === 'string' ? contactInfo.phone : ''}
              className="w-full"
            />
          </div>
          
          {/* Chat Hours */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <Clock size={18} className="mr-2 text-blue-500" />
              <label className="text-sm font-medium text-gray-700">Chat Hours</label>
            </div>
            <UniversalContentEditor
              collection="contact_info"
              itemId={contactInfo?.id || 'contact_info'}
              field="chat_hours"
              value={typeof contactInfo?.chat_hours === 'string' ? contactInfo.chat_hours : ''}
              className="w-full"
            />
          </div>
          
          {/* Contact Form Link */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <LinkIcon size={18} className="mr-2 text-blue-500" />
              <label className="text-sm font-medium text-gray-700">Contact Form Link</label>
            </div>
            <UniversalContentEditor
              collection="contact_info"
              itemId={contactInfo?.id || 'contact_info'}
              field="contact_form_link"
              value={typeof contactInfo?.contact_form_link === 'string' ? contactInfo.contact_form_link : ''}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoEditor;
