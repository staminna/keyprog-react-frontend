import { useItems, useUpdateItem, useRealtimeUpdates } from '@/hooks/useDirectusQuery';
import { useState } from 'react';
import { CollectionName, CollectionItem, EditableItemListProps } from './EditableItemList';


export function EditableItemList<T extends CollectionName>({
  collection, titleField = 'title' as string & keyof CollectionItem<T>
}: EditableItemListProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CollectionItem<T>>>({});

  // Use the custom hooks
  const { data: items = [], isLoading, error } = useItems(collection);
  const { mutate: updateItem } = useUpdateItem(collection);

  // Enable real-time updates for this collection
  useRealtimeUpdates(collection);

  const handleEdit = (item: CollectionItem<T>) => {
    setEditingId(item.id.toString());
    setFormData({ ...item });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && formData) {
      updateItem({
        id: editingId,
        data: formData
      });
      setEditingId(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading items</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Edit {collection}</h2>
      <ul className="space-y-2">
        {(items as CollectionItem<T>[]).map((item) => (
          <li key={item.id} className="p-4 border rounded">
            {editingId === item.id.toString() ? (
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="text"
                  name={titleField}
                  value={(formData[titleField] as string) || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded" />
                <div className="space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <span>{item[titleField] as React.ReactNode}</span>
                <button
                  onClick={() => handleEdit(item as CollectionItem<T>)}
                  className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
