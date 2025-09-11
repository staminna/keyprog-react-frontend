import { headerMenuCorrections, footerMenuCorrections, subMenuContentCorrections, DEFAULT_NOT_FOUND_MESSAGE } from '@/data/menuCorrections';
import { DirectusHeaderMenu, DirectusFooterMenu, DirectusSubMenuContent } from '@/lib/directus';

// Define types for menu items with flexible structure
export type HeaderMenuItem = DirectusHeaderMenu | Record<string, unknown>;
export type FooterMenuItem = DirectusFooterMenu | Record<string, unknown>;
export type SubMenuContent = DirectusSubMenuContent | Record<string, unknown>;

/**
 * Utility to fix menu redirects and ensure all submenus have proper content
 */
export class MenuFixer {
  /**
   * Fix header menu items and their paths
   * @param menu Original header menu from Directus
   * @returns Corrected header menu
   */
  static fixHeaderMenu(menu: unknown[]): HeaderMenuItem[] {
    if (!menu || menu.length === 0) {
      return headerMenuCorrections;
    }

    // Create a map of the original menu items by title for easy lookup
    const menuMap = new Map<string, unknown>();
    menu.forEach(item => {
      if (item && typeof item === 'object' && 'title' in item && item.title) {
        menuMap.set(item.title as string, item);
      }
    });
    
    // Return corrected menu with original IDs where possible
    return headerMenuCorrections.map(correctedItem => {
      const originalItem = menuMap.get(correctedItem.title);
      
      if (originalItem && typeof originalItem === 'object') {
        // Keep original ID and merge with corrections
        const typedOriginal = originalItem as Record<string, unknown>;
        return {
          ...typedOriginal,
          link: correctedItem.link,
          sub_menu: correctedItem.sub_menu || (typedOriginal.sub_menu as Array<{title: string; link: string}>)
        } as HeaderMenuItem;
      }
      
      return correctedItem;
    });
  }

  /**
   * Fix footer menu items and their paths
   * @param menu Original footer menu from Directus
   * @returns Corrected footer menu
   */
  static fixFooterMenu(menu: unknown[]): FooterMenuItem[] {
    if (!menu || menu.length === 0) {
      return footerMenuCorrections;
    }

    // Create a map of the original menu items by title for easy lookup
    const menuMap = new Map<string, unknown>();
    menu.forEach(item => {
      if (item && typeof item === 'object' && 'title' in item && item.title) {
        menuMap.set(item.title as string, item);
      }
    });
    
    // Return corrected menu with original IDs where possible
    return footerMenuCorrections.map(correctedItem => {
      const originalItem = menuMap.get(correctedItem.title);
      
      if (originalItem && typeof originalItem === 'object') {
        // Keep original ID and merge with corrections
        const typedOriginal = originalItem as Record<string, unknown>;
        return {
          ...typedOriginal,
          links: correctedItem.links || (typedOriginal.links as Array<{title: string; url: string}>)
        } as FooterMenuItem;
      }
      
      return correctedItem;
    });
  }

  /**
   * Get submenu content with fallback for empty content
   * @param category Category of the submenu (loja, servicos, suporte)
   * @param slug Slug of the submenu item
   * @param originalContent Original content from Directus
   * @returns Corrected submenu content
   */
  static getSubMenuContent(category: string, slug: string, originalContent: SubMenuContent | null): Record<string, unknown> {
    // If original content exists and is not empty, return it
    if (originalContent && 
        typeof originalContent === 'object' &&
        'title' in originalContent && originalContent.title && 
        'content' in originalContent && originalContent.content && 
        typeof originalContent.content === 'string' &&
        originalContent.content.trim() !== '') {
      // Ensure it has a not_found_message
      const typedContent = originalContent as Record<string, unknown>;
      return {
        ...typedContent,
        not_found_message: (typedContent.not_found_message as string) || DEFAULT_NOT_FOUND_MESSAGE
      };
    }
    
    // Check if we have corrections for this category and slug
    const categoryCorrections = subMenuContentCorrections[category as keyof typeof subMenuContentCorrections];
    if (categoryCorrections) {
      const slugCorrection = categoryCorrections[slug as keyof typeof categoryCorrections];
      if (slugCorrection) {
        // If we have original content, merge with corrections
        if (originalContent) {
          const typedContent = originalContent as Record<string, unknown>;
          return {
            ...typedContent,
            ...slugCorrection as Record<string, unknown>
          };
        }
        return slugCorrection as Record<string, unknown>;
      }
    }
    
    // If no corrections found, return a generic not found message
    return {
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ')}`,
      description: "Conteúdo não disponível",
      content: "<p>O conteúdo desta página ainda não está disponível.</p>",
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    };
  }
  
  /**
   * Check if a path is valid and exists in our menu structure
   * @param path Path to check
   * @returns Whether the path is valid
   */
  static isValidPath(path: string): boolean {
    // Check if path is in header menu
    const headerPaths = headerMenuCorrections.flatMap(item => {
      const paths = [item.link];
      if (item.sub_menu) {
        paths.push(...item.sub_menu.map(subItem => subItem.link));
      }
      return paths;
    });
    
    // Check if path is in footer menu
    const footerPaths = footerMenuCorrections.flatMap(item => {
      return item.links ? item.links.map(link => link.url) : [];
    });
    
    return headerPaths.includes(path) || footerPaths.includes(path);
  }
  
  /**
   * Get the correct path for a given path
   * @param path Original path
   * @returns Corrected path
   */
  static getCorrectPath(path: string): string {
    // Special case for loja -> servicos/reprogramacao issue
    if (path === '/loja/reprogramacao') {
      return '/servicos/reprogramacao-ecu';
    }
    
    // Check if path exists in our structure
    if (this.isValidPath(path)) {
      return path;
    }
    
    // Try to find a similar path
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const category = pathParts[0];
      const slug = pathParts[1];
      
      // Check if category exists in our corrections
      if (subMenuContentCorrections[category as keyof typeof subMenuContentCorrections]) {
        // Find closest slug match
        const categoryCorrections = subMenuContentCorrections[category as keyof typeof subMenuContentCorrections];
        const slugKeys = Object.keys(categoryCorrections);
        
        // Try to find an exact match first
        if (slugKeys.includes(slug)) {
          return `/${category}/${slug}`;
        }
        
        // Try to find a similar match
        for (const key of slugKeys) {
          if (key.includes(slug) || slug.includes(key)) {
            return `/${category}/${key}`;
          }
        }
      }
    }
    
    // If no match found, return the original path
    return path;
  }
}
