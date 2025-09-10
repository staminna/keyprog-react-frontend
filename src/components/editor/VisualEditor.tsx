import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, Eye, Edit, Settings } from "lucide-react";
import EditableHero from "./EditableHero";
import EditableServices from "./EditableServices";
import { InlineEditProvider } from "@/components/inline/InlineEditProvider";
import { InlineEditToolbar } from "@/components/inline/InlineEditToolbar";
import type { DirectusHero, DirectusServices } from "@/lib/directus";

interface VisualEditorProps {
  initialEditMode?: boolean;
}

const VisualEditor = ({ initialEditMode = false }: VisualEditorProps) => {
  const [activeTab, setActiveTab] = useState("hero");

  const handleHeroSave = (data: DirectusHero) => {
    console.log("Hero data saved:", data);
  };

  const handleServicesSave = (data: DirectusServices[]) => {
    console.log("Services data saved:", data);
  };

  return (
    <InlineEditProvider initialEditMode={initialEditMode}>
      <div className="min-h-screen bg-gray-50">
        <InlineEditToolbar />

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
                  Edit the main hero section content and call-to-action buttons with inline editing
                </p>
              </CardHeader>
              <CardContent>
                <EditableHero 
                  isEditing={false}
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
                  Manage your services with inline editing capabilities
                </p>
              </CardHeader>
              <CardContent>
                <EditableServices 
                  isEditing={false}
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
    </InlineEditProvider>
  );
};

export default VisualEditor;