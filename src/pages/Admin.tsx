import { useState } from 'react';
import BulkServicesCreator from '@/components/admin/BulkServicesCreator';
import CustomerManager from '@/components/admin/CustomerManager';
import NewsEditor from '@/components/admin/NewsEditor';
import CategoryManager from '@/components/admin/CategoryManager';
import SubMenuContentEditor from '@/components/admin/SubMenuContentEditor';
import ProductManager from '@/components/admin/ProductManager';
import OrderManager from '@/components/admin/OrderManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, Settings, Users, FileText, Tag, Menu, Package, ShoppingCart } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <main className="container py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gradient-primary mb-4 flex items-center justify-center gap-3">
          <img 
            src={`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065'}/favicon.ico`}
            alt="Directus Favicon" 
            className="h-8 w-8"
            onError={(e) => {
              // Fallback to Database icon if favicon fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Database className="h-8 w-8 hidden" />
          Admin Panel
        </h1>
        <p className="text-lg text-muted-foreground">
          Administrative tools for managing Keyprog content and data.
        </p>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-9 lg:w-full">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden md:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden md:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">News</span>
          </TabsTrigger>
          <TabsTrigger value="submenu" className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            <span className="hidden md:inline">Submenu</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Services</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of your Keyprog system and Directus integration.
            </p>
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
                  Services, Products, News, Pages, Menus, Customers, Orders
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Product Management</h2>
            <p className="text-muted-foreground">
              Create, edit, and manage products in your catalog.
            </p>
          </div>
          <ProductManager />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Category Management</h2>
            <p className="text-muted-foreground">
              Manage product and service categories.
            </p>
          </div>
          <CategoryManager />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Order Management</h2>
            <p className="text-muted-foreground">
              View and manage customer orders.
            </p>
          </div>
          <OrderManager />
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Customer Management</h2>
            <p className="text-muted-foreground">
              View and manage customer accounts.
            </p>
          </div>
          <CustomerManager />
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">News Management</h2>
            <p className="text-muted-foreground">
              Create and manage news articles and blog posts.
            </p>
          </div>
          <NewsEditor />
        </TabsContent>

        {/* Submenu Tab */}
        <TabsContent value="submenu">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Submenu Content Management</h2>
            <p className="text-muted-foreground">
              Manage content for navigation submenus.
            </p>
          </div>
          <SubMenuContentEditor />
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Service Management</h2>
            <p className="text-muted-foreground">
              Create and manage services offered by Keyprog.
            </p>
          </div>
          <BulkServicesCreator />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">System Information</h2>
            <p className="text-muted-foreground">
              Technical details about your Keyprog installation.
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Directus Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Status: Active with fallback mechanism
                </p>
                <p className="text-sm text-muted-foreground">
                  Version: 10.0.0
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">React Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Framework: React + Vite
                </p>
                <p className="text-sm text-muted-foreground">
                  UI: Tailwind CSS + shadcn/ui
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  REST API: Available
                </p>
                <p className="text-sm text-muted-foreground">
                  GraphQL: Available
                </p>
                <p className="text-sm text-muted-foreground">
                  WebSockets: Active
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Admin;
