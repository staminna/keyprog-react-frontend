import React from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

interface PageLayoutProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * Basic page layout component that wraps content with header and footer
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {title && (
          <div className="bg-muted/50 py-8">
            <div className="container">
              <h1 className="text-3xl font-bold">{title}</h1>
            </div>
          </div>
        )}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
};

export default PageLayout;
