
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Building } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Schema for item creation
const itemSchema = z.object({
  floorNumber: z.number().min(0, { message: 'Floor number is required' }),
  itemCount: z.number().min(1, { message: 'At least 1 item is required' }).max(100, { message: 'Maximum 100 items per floor' }),
  itemPrefix: z.string().min(1, { message: 'Item prefix is required' }),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface AddFloorsFormProps {
  building: Building;
  onComplete: () => void;
  onAddAnother: () => void;
}

const AddFloorsForm: React.FC<AddFloorsFormProps> = ({ building, onComplete, onAddAnother }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentFloor, setCurrentFloor] = useState(0);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      floorNumber: 0,
      itemCount: 5,
      itemPrefix: `${building.name.slice(0, 3).toUpperCase()}-F0-`,
    }
  });

  React.useEffect(() => {
    form.setValue('floorNumber', currentFloor);
    form.setValue('itemPrefix', `${building.name.slice(0, 3).toUpperCase()}-F${currentFloor}-`);
  }, [currentFloor, form, building.name]);

  const onSubmit = async (values: ItemFormValues) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Create items for this floor
    const itemsForDb = [];
    for (let i = 1; i <= values.itemCount; i++) {
      const itemId = uuidv4();
      const name = `${values.itemPrefix}${i.toString().padStart(3, '0')}`;
      
      itemsForDb.push({
        id: itemId,
        project_id: building.projectId,
        name: name,
        type: 'Standard',
        status: 'In Progress',
        date: today,
        issue_transmittal_no: `TN-${String(i).padStart(3, '0')}`,
        dwg_no: `${values.itemPrefix}DWG-${i.toString().padStart(3, '0')}`,
        description: `Floor ${values.floorNumber} item ${i}`,
        tag: name,
        draftman: 'System Generated',
        ifp_qty_nos: 1,
        unit_qty: 1.0,
        ifp_qty: 1.0
      });
    }
    
    try {
      // Add to database if user is logged in
      if (user) {
        // Insert into Supabase
        const { error } = await supabase.from('panels').insert(itemsForDb);
        
        if (error) throw error;
      }
      
      toast({
        title: 'Items added',
        description: `${values.itemCount} items have been added to floor ${values.floorNumber}.`,
      });
      
      // Move to the next floor if there are more floors
      if (currentFloor < building.floors - 1) {
        setCurrentFloor(currentFloor + 1);
        form.reset({
          floorNumber: currentFloor + 1,
          itemCount: 5,
          itemPrefix: `${building.name.slice(0, 3).toUpperCase()}-F${currentFloor + 1}-`,
        });
      } else {
        // All floors have been processed
        toast({
          title: 'All floors completed',
          description: `All ${building.floors} floors have been set up with items.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error adding items',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  const progressText = `Floor ${currentFloor + 1} of ${building.floors}`;
  const isLastFloor = currentFloor === building.floors - 1;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Items to Floor</DialogTitle>
        <DialogDescription>
          {progressText} - Define items for this floor
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="floorNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="itemPrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Prefix</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="itemCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Items</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    max="100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter className="gap-2">
            {isLastFloor ? (
              <>
                <Button type="button" variant="outline" onClick={onComplete}>
                  Finish
                </Button>
                <Button type="button" onClick={onAddAnother}>
                  Add Another Building
                </Button>
                <Button type="submit" className="bg-construction-blue hover:bg-construction-blue-dark">
                  Add Items & Finish
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onComplete}>
                  Skip Remaining
                </Button>
                <Button type="submit" className="bg-construction-blue hover:bg-construction-blue-dark">
                  Add Items & Continue
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default AddFloorsForm;
