import React from 'react';
import { Helmet } from 'react-helmet-async';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';
import { useInlineEditor } from '@/components/universal/InlineEditorProvider';

interface EditableSEOHeadProps {
  collection?: string;
  itemId?: string | number;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: number;
  currency?: string;
  category?: string;
  showEditableUI?: boolean;
}

const EditableSEOHead = ({
  collection = 'settings',
  itemId = 'settings',
  title = 'Keyprog - Especialistas em Eletrónica Automóvel',
  description = 'Serviços profissionais de reprogramação ECU, diagnóstico automóvel, reset airbag e soluções em eletrónica automóvel. Mais de 10 anos de experiência.',
  keywords = 'reprogramação ECU, diagnóstico automóvel, reset airbag, eletrónica automóvel, centralinas, OBD2, Portugal',
  image = '/og-image.jpg',
  url,
  type = 'website',
  author = 'Keyprog',
  publishedTime,
  modifiedTime,
  price,
  currency = 'EUR',
  category,
  showEditableUI = false
}: EditableSEOHeadProps) => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const siteUrl = 'https://keyprog.pt'; // Update with actual domain
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Structured data for services/products
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'service' ? 'Service' : type === 'product' ? 'Product' : 'Organization',
    ...(type === 'website' && {
      name: 'Keyprog',
      description,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+351-XXX-XXX-XXX", // Update with actual phone
        contactType: "customer service",
        availableLanguage: "Portuguese"
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "PT",
        addressLocality: "Portugal" // Update with actual location
      },
      sameAs: [
        "https://facebook.com/keyprog", // Update with actual social media
        "https://instagram.com/keyprog"
      ]
    }),
    ...(type === 'service' && {
      name: title,
      description,
      provider: {
        "@type": "Organization",
        name: "Keyprog"
      },
      ...(price && {
        offers: {
          "@type": "Offer",
          price: price.toString(),
          priceCurrency: currency,
          availability: "https://schema.org/InStock"
        }
      }),
      ...(category && { serviceType: category })
    }),
    ...(type === 'product' && {
      name: title,
      description,
      brand: {
        "@type": "Brand",
        name: "Keyprog"
      },
      ...(price && {
        offers: {
          "@type": "Offer",
          price: price.toString(),
          priceCurrency: currency,
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "Keyprog"
          }
        }
      }),
      ...(category && { category })
    }),
    ...(type === 'article' && {
      headline: title,
      description,
      author: {
        "@type": "Person",
        name: author
      },
      publisher: {
        "@type": "Organization",
        name: "Keyprog",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`
        }
      },
      ...(publishedTime && { datePublished: publishedTime }),
      ...(modifiedTime && { dateModified: modifiedTime }),
      image: fullImageUrl
    })
  };

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <link rel="canonical" href={fullUrl} />

        {/* Open Graph Tags */}
        <meta property="og:type" content={type} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullImageUrl} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="Keyprog" />
        <meta property="og:locale" content="pt_PT" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullImageUrl} />

        {/* Article specific tags */}
        {type === 'article' && publishedTime && (
          <meta property="article:published_time" content={publishedTime} />
        )}
        {type === 'article' && modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        {type === 'article' && author && (
          <meta property="article:author" content={author} />
        )}

        {/* Product specific tags */}
        {type === 'product' && price && (
          <>
            <meta property="product:price:amount" content={price.toString()} />
            <meta property="product:price:currency" content={currency} />
          </>
        )}

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>

        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="pt" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Helmet>

      {/* Editable UI - Only show when editing is enabled and showEditableUI is true */}
      {showEditableUI && isInlineEditingEnabled && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border max-w-md">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">SEO Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Title
              </label>
              <UniversalContentEditor
                collection={collection}
                itemId={itemId}
                field="seo_title"
                value={title}
                placeholder="Enter page title..."
                tag="div"
                className="text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <UniversalContentEditor
                collection={collection}
                itemId={itemId}
                field="seo_description"
                value={description}
                placeholder="Enter meta description..."
                tag="div"
                className="text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <UniversalContentEditor
                collection={collection}
                itemId={itemId}
                field="seo_keywords"
                value={keywords}
                placeholder="Enter keywords separated by commas..."
                tag="div"
                className="text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditableSEOHead;
