
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemFormData, ItemStatus } from '@/types/item';

interface ItemFormProps {
  item?: Item;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions: ItemStatus[] = ['Proceed for Delivery', 'In Progress', 'Completed', 'On Hold'];

export const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState<ItemFormData>({
    project_id: item?.project_id || '',
    name: item?.name || '',
    type: item?.type || '',
    status: item?.status as ItemStatus || 'In Progress',
    date: item?.date || new Date().toISOString().split('T')[0],
    issue_transmittal_no: item?.issue_transmittal_no || '',
    dwg_no: item?.dwg_no || '',
    description: item?.description || '',
    panel_tag: item?.panel_tag || '',
    unit_qty: item?.unit_qty || 0,
    ifp_qty_nos: item?.ifp_qty_nos || 0,
    ifp_qty: item?.ifp_qty || 0,
    draftman: item?.draftman || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ItemFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project_id">Project ID</Label>
              <Input
                id="project_id"
                value={formData.project_id}
                onChange={(e) => handleChange('project_id', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="issue_transmittal_no">Issue Transmittal No</Label>
              <Input
                id="issue_transmittal_no"
                value={formData.issue_transmittal_no}
                onChange={(e) => handleChange('issue_transmittal_no', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dwg_no">Drawing No</Label>
              <Input
                id="dwg_no"
                value={formData.dwg_no}
                onChange={(e) => handleChange('dwg_no', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="panel_tag">Panel Tag</Label>
              <Input
                id="panel_tag"
                value={formData.panel_tag}
                onChange={(e) => handleChange('panel_tag', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit_qty">Unit Qty</Label>
              <Input
                id="unit_qty"
                type="number"
                step="0.01"
                value={formData.unit_qty}
                onChange={(e) => handleChange('unit_qty', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="ifp_qty_nos">IFP Qty Nos</Label>
              <Input
                id="ifp_qty_nos"
                type="number"
                value={formData.ifp_qty_nos}
                onChange={(e) => handleChange('ifp_qty_nos', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="ifp_qty">IFP Qty</Label>
              <Input
                id="ifp_qty"
                type="number"
                step="0.01"
                value={formData.ifp_qty}
                onChange={(e) => handleChange('ifp_qty', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="draftman">Draftman</Label>
              <Input
                id="draftman"
                value={formData.draftman}
                onChange={(e) => handleChange('draftman', e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
