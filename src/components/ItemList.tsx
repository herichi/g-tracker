
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileSpreadsheet, Edit, Trash2 } from 'lucide-react';
import { Item, ItemFormData } from '@/types/item';
import { ItemForm } from './ItemForm';
import { ItemExcelImport } from './ItemExcelImport';

interface ItemListProps {
  items: Item[];
  onAddItem: (data: ItemFormData) => Promise<void>;
  onUpdateItem: (id: string, data: ItemFormData) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onImportItems: (items: ItemFormData[]) => Promise<void>;
  isLoading?: boolean;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onImportItems,
  isLoading = false
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleAddItem = async (data: ItemFormData) => {
    await onAddItem(data);
    setShowForm(false);
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (selectedItem) {
      await onUpdateItem(selectedItem.id, data);
      setSelectedItem(null);
      setShowForm(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await onDeleteItem(id);
    }
  };

  const handleImport = async (importedItems: ItemFormData[]) => {
    await onImportItems(importedItems);
    setShowImport(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Proceed for Delivery':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items Management</CardTitle>
            <div className="flex gap-2">
              <Dialog open={showImport} onOpenChange={setShowImport}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Import Excel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <ItemExcelImport
                    onImport={handleImport}
                    onClose={() => setShowImport(false)}
                  />
                </DialogContent>
              </Dialog>
              
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <ItemForm
                    item={selectedItem || undefined}
                    onSubmit={selectedItem ? handleUpdateItem : handleAddItem}
                    onCancel={() => {
                      setShowForm(false);
                      setSelectedItem(null);
                    }}
                    isLoading={isLoading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Issue/Transmittal No</TableHead>
                  <TableHead>Dwg No</TableHead>
                  <TableHead>Panel Tag</TableHead>
                  <TableHead>Unit Qty</TableHead>
                  <TableHead>IFP Qty Nos</TableHead>
                  <TableHead>IFP Qty</TableHead>
                  <TableHead>Draftman</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.project_id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.issue_transmittal_no}</TableCell>
                    <TableCell>{item.dwg_no}</TableCell>
                    <TableCell>{item.panel_tag}</TableCell>
                    <TableCell>{item.unit_qty}</TableCell>
                    <TableCell>{item.ifp_qty_nos}</TableCell>
                    <TableCell>{item.ifp_qty}</TableCell>
                    <TableCell>{item.draftman}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No items found. Add some items to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
