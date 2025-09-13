import React, { useState } from 'react';
import { useContactInfo } from '@/hooks/useContactInfo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, RefreshCw } from 'lucide-react';

interface ContactInfoManagerProps {
  readOnly?: boolean;
  className?: string;
}

/**
 * Component for displaying and editing contact information
 * Provides bidirectional synchronization with Directus
 */
export const ContactInfoManager: React.FC<ContactInfoManagerProps> = ({
  readOnly = false,
  className = ''
}) => {
  const { contactInfo, isLoading, error, refresh, updateContactInfo, isSyncing } = useContactInfo({
    autoSync: true,
    syncInterval: 60000 // 1 minute
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    phone: '',
    chat_hours: '',
    contact_form_text: '',
    contact_form_link: ''
  });
  
  // Start editing with current data
  const handleEdit = () => {
    if (contactInfo) {
      setFormData({
        title: contactInfo.title || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        chat_hours: contactInfo.chat_hours || '',
        contact_form_text: contactInfo.contact_form_text || '',
        contact_form_link: contactInfo.contact_form_link || ''
      });
      setIsEditing(true);
    }
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save changes to Directus
  const handleSave = async () => {
    const success = await updateContactInfo(formData);
    if (success) {
      setIsEditing(false);
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading contact information...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>Error loading contact information</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={refresh}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  if (!contactInfo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
        <p>No contact information available</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={refresh}
        >
          Refresh
        </Button>
      </div>
    );
  }
  
  // View mode
  if (!isEditing || readOnly) {
    return (
      <div className={`bg-white border rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{contactInfo.title}</h2>
          {!readOnly && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Sync
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleEdit}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="text-lg">{contactInfo.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="text-lg">{contactInfo.phone}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Chat Hours</h3>
            <p>{contactInfo.chat_hours}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Form</h3>
            <p>
              <a 
                href={contactInfo.contact_form_link} 
                className="text-blue-600 hover:underline"
              >
                {contactInfo.contact_form_text}
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Edit mode
  return (
    <div className={`bg-white border rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Edit Contact Information</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div>
          <label htmlFor="title" className="text-sm font-medium text-gray-500">Title</label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-500">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-gray-500">Phone</label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <label htmlFor="chat_hours" className="text-sm font-medium text-gray-500">Chat Hours</label>
          <Input
            id="chat_hours"
            name="chat_hours"
            value={formData.chat_hours}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <label htmlFor="contact_form_text" className="text-sm font-medium text-gray-500">Contact Form Text</label>
          <Input
            id="contact_form_text"
            name="contact_form_text"
            value={formData.contact_form_text}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <label htmlFor="contact_form_link" className="text-sm font-medium text-gray-500">Contact Form Link</label>
          <Input
            id="contact_form_link"
            name="contact_form_link"
            value={formData.contact_form_link}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoManager;
