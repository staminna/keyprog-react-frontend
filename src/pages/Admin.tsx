import BulkServicesCreator from '@/components/admin/BulkServicesCreator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Settings } from 'lucide-react';

const Admin = () => {
  return (
    <main className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gradient-primary mb-4">
          <Shield className="inline mr-2 h-8 w-8" />
          Admin Panel
        </h1>
        <p className="text-lg text-muted-foreground">
          Administrative tools for managing Keyprog content and data.
        </p>
      </div>

      <div className="space-y-8">
        {/* Bulk Services Creator */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Database className="h-6 w-6" />
              Content Management
            </h2>
            <p className="text-muted-foreground">
              Bulk operations for populating Directus with content data.
            </p>
          </div>
          
          <BulkServicesCreator />
        </section>

        {/* Additional Admin Tools */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              System Information
            </h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Directus Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connected to: {import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Token: {import.meta.env.VITE_DIRECTUS_TOKEN ? 'Configured' : 'Not configured'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Mode: {import.meta.env.MODE}
                </p>
                <p className="text-sm text-muted-foreground">
                  Build: {import.meta.env.PROD ? 'Production' : 'Development'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Services, Products, News, Pages, Menus
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Admin;
