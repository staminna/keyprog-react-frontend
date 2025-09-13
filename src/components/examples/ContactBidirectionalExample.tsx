import React, { useState, useEffect } from 'react';
import { useContactInfo } from '@/hooks/useContactInfo';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

/**
 * Example component demonstrating bidirectional connection between React and Directus
 * This component shows how changes in React are reflected in Directus and vice versa
 */
export const ContactBidirectionalExample: React.FC = () => {
  // Use our custom hook for contact info
  const { 
    contactInfo, 
    isLoading, 
    error, 
    refresh, 
    updateContactInfo, 
    isSyncing 
  } = useContactInfo({
    autoSync: true,
    syncInterval: 30000 // 30 seconds
  });
  
  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    phone: '',
    chat_hours: ''
  });
  
  // Track Directus data changes
  const [directusData, setDirectusData] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Initialize form data when contact info is loaded
  useEffect(() => {
    if (contactInfo) {
      setFormData({
        title: contactInfo.title || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        chat_hours: contactInfo.chat_hours || ''
      });
    }
  }, [contactInfo]);
  
  // Fetch Directus data directly for comparison
  const fetchDirectusData = async () => {
    try {
      const data = await DirectusServiceExtension.getContactInfo();
      setDirectusData(data);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Error fetching Directus data:', err);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchDirectusData();
  }, []);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Start editing
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Save changes to Directus
  const handleSave = async () => {
    const success = await updateContactInfo(formData);
    if (success) {
      setIsEditing(false);
      // Fetch latest Directus data to show bidirectional sync
      fetchDirectusData();
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    if (contactInfo) {
      // Reset form data to current contact info
      setFormData({
        title: contactInfo.title || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        chat_hours: contactInfo.chat_hours || ''
      });
    }
    setIsEditing(false);
  };
  
  // Refresh both React and Directus data
  const handleRefresh = () => {
    refresh();
    fetchDirectusData();
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading contact information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200">
        <CardHeader className="bg-red-50 text-red-700">
          <CardTitle>Error</CardTitle>
          <CardDescription className="text-red-600">
            Failed to load contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p>{error.message}</p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>React Contact Information</CardTitle>
              <CardDescription>
                Data from React state via useContactInfo hook
              </CardDescription>
            </div>
            <Badge variant={isSyncing ? "outline" : "default"}>
              {isSyncing ? "Syncing..." : "In Sync"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Title</Label>
                <p className="text-lg">{contactInfo?.title || 'N/A'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-lg">{contactInfo?.email || 'N/A'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Phone</Label>
                <p className="text-lg">{contactInfo?.phone || 'N/A'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Chat Hours</Label>
                <p className="text-lg">{contactInfo?.chat_hours || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="chat_hours">Chat Hours</Label>
                <Input
                  id="chat_hours"
                  name="chat_hours"
                  value={formData.chat_hours}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {!isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isSyncing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleEdit}>Edit</Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      
      {/* Directus Data Card */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Directus Contact Information</CardTitle>
              <CardDescription>
                Data fetched directly from Directus API
              </CardDescription>
            </div>
            {lastSyncTime && (
              <Badge variant="outline">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Title</Label>
              <p className="text-lg">{directusData?.title || 'N/A'}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-lg">{directusData?.email || 'N/A'}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="text-lg">{directusData?.phone || 'N/A'}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Chat Hours</Label>
              <p className="text-lg">{directusData?.chat_hours || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={fetchDirectusData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Directus Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ContactBidirectionalExample;
