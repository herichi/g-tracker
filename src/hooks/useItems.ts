
import { useState, useEffect } from 'react';
import { Item, ItemFormData } from '@/types/item';

// Mock data for demonstration
const mockItems: Item[] = [
  {
    id: '34',
    project_id: '15',
    name: 'OH-UC-101',
    type: 'GRC',
    status: 'Proceed for Delivery',
    date: '2010-06-24',
    issue_transmittal_no: 'TN-001',
    dwg_no: 'KSP-FS-101',
    description: 'MOCK UP',
    panel_tag: 'OH-UC-101',
    unit_qty: 6.40,
    ifp_qty_nos: 1,
    ifp_qty: 6.40,
    draftman: 'none',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useItems = () => {
  const [items, setItems] = useState<Item[]>(mockItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (data: ItemFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newItem: Item = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setItems(prev => [...prev, newItem]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, data: ItemFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, ...data, updated_at: new Date().toISOString() }
          : item
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const importItems = async (importedItems: ItemFormData[]): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newItems: Item[] = importedItems.map(data => ({
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      setItems(prev => [...prev, ...newItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import items');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    importItems,
  };
};
