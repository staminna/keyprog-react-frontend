import React, { useState, useEffect } from 'react';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';
import { ContentParser } from '@/components/remirror/ContentParser';
import { UniversalContentEditor } from './UniversalContentEditor';
import { Edit3, Plus, Trash2, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  link?: string;
  sub_menu?: SubMenuItem[];
  sort?: number;
}

interface SubMenuItem {
  title: string;
  link: string;
}

interface MenuEditorProps {
  collection: 'header_menu' | 'footer_menu' | 'sub_menu_content';
  className?: string;
  onUpdate?: () => void;
}

/**
 * Universal Menu Editor component that can handle both header and footer menus
 */
export const MenuEditor: React.FC<MenuEditorProps> = ({
  collection,
  className = '',
  onUpdate
}) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const { canEditCollection } = useRolePermissions();

  // Check if user has permission to edit this menu
  const hasAuthPermission = isInDirectusEditor || isAuthenticated;
  const hasRolePermission = canEditCollection(collection);
  const canEdit = hasAuthPermission && hasRolePermission;

  // Load menu items on mount
  useEffect(() => {
    loadMenuItems();
  }, [collection]);

  // Load menu items from Directus
  const loadMenuItems = async () => {
    setIsLoading(true);
    
    try {
      // Get all items for this collection
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}?sort=sort`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load ${collection} items`);
      }
      
      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      console.error(`Error loading ${collection} items:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item update
  const handleItemUpdate = async (id: string, field: string, value: any) => {
    if (!canEdit) return;
    
    try {
      // Update the item in Directus
      await DirectusServiceExtension.updateField(collection, id, field, value);
      
      // Update local state
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, [field]: value } : item
        )
      );
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(`Failed to update ${collection} item:`, error);
    }
  };

  // Handle item creation
  const handleAddItem = async () => {
    if (!canEdit) return;
    
    try {
      // Create a new item in Directus
      const newItem = {
        title: 'New Item',
        sort: items.length + 1
      };
      
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create ${collection} item`);
      }
      
      const data = await response.json();
      
      // Add the new item to local state
      setItems(prevItems => [...prevItems, data.data]);
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(`Failed to create ${collection} item:`, error);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (id: string) => {
    if (!canEdit) return;
    
    try {
      // Delete the item from Directus
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${collection} item`);
      }
      
      // Remove the item from local state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(`Failed to delete ${collection} item:`, error);
    }
  };

  // Handle item reordering
  const handleReorderItem = async (id: string, direction: 'up' | 'down') => {
    if (!canEdit) return;
    
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Check if the new index is valid
    if (newIndex < 0 || newIndex >= items.length) return;
    
    // Create a copy of the items array
    const newItems = [...items];
    
    // Swap the items
    const temp = newItems[currentIndex];
    newItems[currentIndex] = newItems[newIndex];
    newItems[newIndex] = temp;
    
    // Update the sort values
    newItems.forEach((item, index) => {
      item.sort = index + 1;
    });
    
    // Update local state
    setItems(newItems);
    
    try {
      // Update the sort values in Directus
      await Promise.all(
        newItems.map(item => 
          DirectusServiceExtension.updateField(collection, item.id, 'sort', item.sort)
        )
      );
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(`Failed to reorder ${collection} items:`, error);
      // Reload the items to restore the original order
      loadMenuItems();
    }
  };

  // Handle sub-menu item update
  const handleSubMenuUpdate = async (id: string, subMenu: SubMenuItem[]) => {
    if (!canEdit) return;
    
    try {
      // Update the sub_menu field in Directus
      await DirectusServiceExtension.updateField(collection, id, 'sub_menu', subMenu);
      
      // Update local state
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, sub_menu: subMenu } : item
        )
      );
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(`Failed to update ${collection} sub-menu:`, error);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  // Render menu editor
  return (
    <div className={`menu-editor ${className}`}>
      <h2 className="text-xl font-bold mb-4">
        {collection === 'header_menu' ? 'Header Menu' : 
         collection === 'footer_menu' ? 'Footer Menu' : 'Sub-Menu Content'}
      </h2>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="border border-gray-200 rounded-md p-4 relative"
          >
            {/* Item title */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <UniversalContentEditor
                collection={collection}
                itemId={item.id}
                field="title"
                value={item.title}
                className="font-medium"
              />
            </div>
            
            {/* Item link (if applicable) */}
            {collection !== 'sub_menu_content' && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                <UniversalContentEditor
                  collection={collection}
                  itemId={item.id}
                  field="link"
                  value={item.link || ''}
                  placeholder="/page-url"
                  className="text-blue-500"
                />
              </div>
            )}
            
            {/* Sub-menu content (for header_menu) */}
            {collection === 'header_menu' && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Menu Items
                </label>
                <button
                  onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  {editingItem === item.id ? 'Close Editor' : 'Edit Sub-Menu Items'}
                </button>
                
                {editingItem === item.id && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    {/* Sub-menu editor would go here */}
                    <p className="text-sm text-gray-500">
                      Sub-menu editor not implemented in this example
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Item actions */}
            {canEdit && (
              <div className="absolute top-2 right-2 flex space-x-1">
                {/* Move up button */}
                {index > 0 && (
                  <button
                    onClick={() => handleReorderItem(item.id, 'up')}
                    className="p-1 text-gray-500 hover:text-blue-500"
                    title="Move up"
                  >
                    <ChevronUp size={16} />
                  </button>
                )}
                
                {/* Move down button */}
                {index < items.length - 1 && (
                  <button
                    onClick={() => handleReorderItem(item.id, 'down')}
                    className="p-1 text-gray-500 hover:text-blue-500"
                    title="Move down"
                  >
                    <ChevronDown size={16} />
                  </button>
                )}
                
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 text-gray-500 hover:text-red-500"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add new item button */}
      {canEdit && (
        <button
          onClick={handleAddItem}
          className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus size={16} className="mr-1" />
          Add New Item
        </button>
      )}
    </div>
  );
};

export default MenuEditor;
