import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import type { DirectusPages } from '@/lib/directus';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { UniversalPageWrapper } from './universal/UniversalPageWrapper';
import { UniversalEditableContent } from './universal/UniversalEditableContent';

interface DynamicPageProps {
  slug?: string; // Optional prop to override URL slug
}

const DynamicPage = ({ slug: propSlug }: DynamicPageProps) => {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const slug = propSlug || urlSlug;
  
  const [page, setPage] = useState<DirectusPages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError('No page slug provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const pageData = await DirectusService.getPage(slug);
        
        if (!pageData) {
          setError('Page not found');
        } else {
          setPage(pageData);
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Failed to load page content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // No page found
  if (!page) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-muted-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground">
            The requested page could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Render page content with universal inline editing
  return (
    <UniversalPageWrapper 
      pageCollection="pages" 
      pageItemId={page.id} 
      pageSlug={slug}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        {page.title && (
          <UniversalEditableContent
            collection="pages"
            itemId={page.id}
            field="title"
            value={page.title}
            tag="h1"
            className="text-4xl font-bold mb-6 text-gradient-primary"
            placeholder="Enter page title..."
          />
        )}

        {/* Page Content */}
        {page.content && (
          <UniversalEditableContent
            collection="pages"
            itemId={page.id}
            field="content"
            value={typeof page.content === 'string' ? page.content : JSON.stringify(page.content)}
            tag="div"
            className="prose prose-lg max-w-none"
            placeholder="Enter page content..."
          >
            {typeof page.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <DynamicContentRenderer content={page.content} />
            )}
          </UniversalEditableContent>
        )}
      </div>
    </UniversalPageWrapper>
  );
};

// Component to render dynamic content blocks with inline editing
const DynamicContentRenderer = ({ content, pageId }: { content: Record<string, unknown>; pageId?: string | number }) => {
  // Handle different content block types
  if (Array.isArray(content)) {
    return (
      <div className="space-y-6">
        {content.map((block, index) => (
          <DynamicContentBlock key={index} block={block} pageId={pageId} />
        ))}
      </div>
    );
  }

  // Handle single content block
  return <DynamicContentBlock block={content} pageId={pageId} />;
};

// Component to render individual content blocks with inline editing
const DynamicContentBlock = ({ block, pageId }: { block: Record<string, unknown>; pageId?: string | number }) => {
  if (!block || typeof block !== 'object') {
    return null;
  }

  // Handle different block types with inline editing
  switch (block.type) {
    case 'heading': {
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      return (
        <UniversalEditableContent
          collection="pages"
          itemId={pageId || '1'}
          field={`heading_${block.level || 2}`}
          value={block.content as string}
          tag={HeadingTag}
          className="font-bold text-foreground"
          placeholder="Enter heading..."
        />
      );
    }

    case 'paragraph':
      return (
        <UniversalEditableContent
          collection="pages"
          itemId={pageId || '1'}
          field="paragraph_content"
          value={block.content as string}
          tag="p"
          className="text-muted-foreground leading-relaxed"
          placeholder="Enter paragraph content..."
        />
      );

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className="space-y-2">
          {Array.isArray(block.items) && block.items.map((item: string, index: number) => (
            <li key={index}>
              <UniversalEditableContent
                collection="pages"
                itemId={pageId || '1'}
                field={`list_item_${index}`}
                value={item}
                tag="span"
                className="inline-block"
                placeholder="Enter list item..."
              />
            </li>
          ))}
        </ListTag>
      );
    }

    case 'image':
      return (
        <div className="my-6">
          <img
            src={DirectusService.getImageUrl(block.src as string)}
            alt={(block.alt as string) || ''}
            className="rounded-lg shadow-md max-w-full h-auto"
          />
          {block.caption && (
            <UniversalEditableContent
              collection="pages"
              itemId={pageId || '1'}
              field="image_caption"
              value={block.caption as string}
              tag="p"
              className="text-sm text-muted-foreground mt-2 text-center"
              placeholder="Enter image caption..."
            />
          )}
        </div>
      );

    case 'html':
      return (
        <UniversalEditableContent
          collection="pages"
          itemId={pageId || '1'}
          field="html_content"
          value={block.content as string}
          tag="div"
          className=""
          placeholder="Enter HTML content..."
        >
          <div dangerouslySetInnerHTML={{ __html: block.content as string }} />
        </UniversalEditableContent>
      );

    default:
      // Fallback for unknown block types
      if (block.content) {
        return (
          <UniversalEditableContent
            collection="pages"
            itemId={pageId || '1'}
            field="custom_content"
            value={typeof block.content === 'string' ? block.content : JSON.stringify(block.content, null, 2)}
            tag="div"
            className="p-4 bg-muted rounded-lg"
            placeholder="Enter custom content..."
          >
            <pre className="text-sm overflow-auto">
              {typeof block.content === 'string' 
                ? block.content 
                : JSON.stringify(block.content, null, 2)
              }
            </pre>
          </UniversalEditableContent>
        );
      }
      return null;
  }
};

export default DynamicPage;
