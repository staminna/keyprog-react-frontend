import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, Eye, Edit, Settings } from "lucide-react";
import EditableHero from "./EditableHero";
import EditableServices from "./EditableServices";
import type { DirectusHero, DirectusServices } from "@/lib/directus";

interface VisualEditorProps {
  initialEditMode?: boolean;
}

const VisualEditor = ({ initialEditMode = false }: VisualEditorProps) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [activeTab, setActiveTab] = useState("hero");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleHeroSave = (data: DirectusHero) => {
    console.log("Hero data saved:", data);
    setHasUnsavedChanges(false);
    // Show success notification
    alert('Hero section saved successfully!');
  };

  const handleServicesSave = (data: DirectusServices[]) => {
    console.log("Services data saved:", data);
    setHasUnsavedChanges(false);
    // Show success notification  
    alert('Services saved successfully!');
  };

  const toggleEditMode = () => {
    if (isEditing && hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to exit edit mode?");
      if (!confirmLeave) return;
    }
    setIsEditing(!isEditing);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Visual Content Editor</h1>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <Switch
                checked={isEditing}
                onCheckedChange={toggleEditMode}
                id="edit-mode"
              />
              <Edit className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 font-medium">
                Unsaved changes
              </span>
            )}
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Hero Section
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isEditing 
                    ? "Edit the main hero section content and call-to-action buttons"
                    : "Preview the hero section as visitors will see it"
                  }
                </p>
              </CardHeader>
              <CardContent>
                <EditableHero 
                  isEditing={isEditing} 
                  onSave={handleHeroSave}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Services Section
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isEditing 
                    ? "Manage your services: add, edit, or remove service items"
                    : "Preview your services section"
                  }
                </p>
              </CardHeader>
              <CardContent>
                <EditableServices 
                  isEditing={isEditing} 
                  onSave={handleServicesSave}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>News & Articles</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your news articles and blog posts
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  News editor coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure global site settings, SEO, and metadata
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Settings panel coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VisualEditor;