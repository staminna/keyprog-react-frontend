import { DirectusService } from './directusService';
import { MenuFixer } from '@/utils/menuFixer';
import { DEFAULT_NOT_FOUND_MESSAGE, subMenuContentCorrections } from '@/data/menuCorrections';

// Import types from menuFixer
type HeaderMenuItem = import('@/utils/menuFixer').HeaderMenuItem;
type FooterMenuItem = import('@/utils/menuFixer').FooterMenuItem;
type SubMenuContent = import('@/utils/menuFixer').SubMenuContent;

/**
 * Service for handling menus with proper path corrections and fallback content
 */
export class MenuService {
  /**
   * Get header menu with corrected paths
   */
  static async getHeaderMenu(): Promise<HeaderMenuItem[]> {
    try {
      const headerMenu = await DirectusService.getHeaderMenu();
      return MenuFixer.fixHeaderMenu(headerMenu);
    } catch (error) {
      console.error('Error fetching header menu:', error);
      return MenuFixer.fixHeaderMenu([]);
    }
  }

  /**
   * Get footer menu with corrected paths
   */
  static async getFooterMenu(): Promise<FooterMenuItem[]> {
    try {
      const footerMenu = await DirectusService.getFooterMenu();
      return MenuFixer.fixFooterMenu(footerMenu);
    } catch (error) {
      console.error('Error fetching footer menu:', error);
      return MenuFixer.fixFooterMenu([]);
    }
  }

  /**
   * Get submenu content with fallback for empty content
   */
  static async getSubMenuContent(category: string, slug: string): Promise<Record<string, unknown>> {
    // Type assertion is safe here as we validate the category at runtime
    try {
      console.log(`MenuService: Original request for category=${category}, slug=${slug}`);
      
      if (!category || !slug) {
        console.error(`MenuService: Missing parameters - category=${category}, slug=${slug}`);
        throw new Error('Missing category or slug parameter');
      }
      
      // Fix the category and slug if needed
      const correctPath = MenuFixer.getCorrectPath(`/${category}/${slug}`);
      const pathParts = correctPath.split('/');
      const correctCategory = pathParts.length > 1 ? pathParts[1] : category;
      const correctSlug = pathParts.length > 2 ? pathParts[2] : slug;
      
      console.log(`MenuService: Corrected path: ${correctPath}`);
      console.log(`MenuService: Corrected category=${correctCategory}, slug=${correctSlug}`);
      
      // Get content from Directus
      const content = await DirectusService.getSubMenuContent(correctCategory as 'loja' | 'servicos' | 'suporte', correctSlug);
      console.log(`MenuService: Directus content result:`, content ? 'Found' : 'Not found');
      
      // If content exists in Directus, return it with fallback properties if needed
      if (content) {
        console.log(`MenuService: Found content in Directus for ${correctCategory}/${correctSlug}`);
        // Convert to unknown first to avoid type error
        const typedContent = content as unknown as Record<string, unknown>;
        return {
          ...typedContent,
          not_found_message: (typedContent.not_found_message as string) || DEFAULT_NOT_FOUND_MESSAGE
        };
      }
      
      // If no content in Directus, apply corrections and fallbacks from menuCorrections
      console.log(`MenuService: No content in Directus for ${correctCategory}/${correctSlug}, using fallbacks from menuCorrections`);
      const fallbackContent = MenuFixer.getSubMenuContent(correctCategory, correctSlug, null);
      console.log(`MenuService: Fallback content:`, fallbackContent ? 'Found' : 'Not found');
      return fallbackContent;
    } catch (error) {
      console.error(`Error fetching submenu content for ${category}/${slug}:`, error);
      return {
        title: "Conteúdo não encontrado",
        description: "Conteúdo não disponível",
        content: "<p>O conteúdo desta página ainda não está disponível.</p>",
        not_found_message: DEFAULT_NOT_FOUND_MESSAGE
      };
    }
  }
  /**
   * Get all submenu content for a category
   */
  static async getSubMenuContentByCategory(category: string): Promise<Record<string, unknown>[]> {
    try {
      const content = await DirectusService.getSubMenuContentByCategory(category as 'loja' | 'servicos' | 'suporte');
      
      // If we have content, ensure it has not_found_message
      if (content && content.length > 0) {
        return content.map(item => {
          // Convert to unknown first, then to Record<string, unknown>
          const typedItem = item as unknown as Record<string, unknown>;
          return {
            ...typedItem,
            not_found_message: (typedItem.not_found_message as string) || DEFAULT_NOT_FOUND_MESSAGE
          };
        });
      }
      
      // If no content, return fallback content from our corrections
      const categoryCorrections = subMenuContentCorrections[category as keyof typeof subMenuContentCorrections];
      
      if (!categoryCorrections) {
        return [];
      }
      
      return Object.entries(categoryCorrections).map(([slug, content]) => ({
        id: slug,
        slug,
        category,
        ...(content as Record<string, unknown>),
        status: 'published'
      }));
    } catch (error) {
      console.error(`Error fetching submenu content for category ${category}:`, error);
      return [];
    }
  }
}
