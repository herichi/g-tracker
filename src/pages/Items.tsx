
import React from 'react';
import { ItemList } from '@/components/ItemList';
import { useItems } from '@/hooks/useItems';

const Items: React.FC = () => {
  const { items, isLoading, addItem, updateItem, deleteItem, importItems } = useItems();

  return (
    <div className="container mx-auto px-4 py-8">
      <ItemList
        items={items}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        onImportItems={importItems}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Items;
