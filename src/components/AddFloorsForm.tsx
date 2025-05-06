
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
import { Building, Panel } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Schema for panel creation
const panelSchema = z.object({
  floorNumber: z.number().min(0, { message: 'Floor number is required' }),
  panelCount: z.number().min(1, { message: 'At least 1 panel is required' }).max(100, { message: 'Maximum 100 panels per floor' }),
  panelPrefix: z.string().min(1, { message: 'Panel prefix is required' }),
});

type PanelFormValues = z.infer<typeof panelSchema>;

interface AddFloorsFormProps {
  building: Building;
  onComplete: () => void;
  onAddAnother: () => void;
}

const AddFloorsForm: React.FC<AddFloorsFormProps> = ({ building, onComplete, onAddAnother }) => {
  const { addPanel } = useAppContext();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentFloor, setCurrentFloor] = useState(0);

  const form = useForm<PanelFormValues>({
    resolver: zodResolver(panelSchema),
    defaultValues: {
      floorNumber: 0,
      panelCount: 5,
      panelPrefix: `${building.name.slice(0, 3).toUpperCase()}-F0-`,
    }
  });

  React.useEffect(() => {
    form.setValue('floorNumber', currentFloor);
    form.setValue('panelPrefix', `${building.name.slice(0, 3).toUpperCase()}-F${currentFloor}-`);
  }, [currentFloor, form, building.name]);

  const onSubmit = async (values: PanelFormValues) => {
    const panels: Panel[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Create panels for this floor
    for (let i = 1; i <= values.panelCount; i++) {
      const panelId = uuidv4();
      const serialNumber = `${values.panelPrefix}${i.toString().padStart(3, '0')}`;
      
      const newPanel: Panel = {
        id: panelId,
        projectId: building.projectId,
        buildingId: building.id,
        serialNumber,
        name: serialNumber,
        type: 'Standard',
        status: 'manufactured',
        dimensions: {
          width: 100,
          height: 200,
          thickness: 10,
        },
        weight: 50,
        manufacturedDate: today,
      };
      
      panels.push(newPanel);
    }
    
    try {
      // Add to database if user is logged in
      if (user) {
        const panelsForDb = panels.map(panel => ({
          id: panel.id,
          project_id: panel.projectId,
          building_id: panel.buildingId,
          serial_number: panel.serialNumber,
          name: panel.name,
          type: panel.type,
          status: panel.status,
          width: panel.dimensions.width,
          height: panel.dimensions.height,
          thickness: panel.dimensions.thickness,
          weight: panel.weight,
          manufactured_date: panel.manufacturedDate,
          floor_number: values.floorNumber,
          created_by: user.id
        }));
        
        const { error } = await supabase.from('panels').insert(panelsForDb);
        if (error) throw error;
      }
      
      // Add to local state
      panels.forEach(panel => {
        addPanel(panel);
      });
      
      toast({
        title: 'Panels added',
        description: `${values.panelCount} panels have been added to floor ${values.floorNumber}.`,
      });
      
      // Move to the next floor if there are more floors
      if (currentFloor < building.floors - 1) {
        setCurrentFloor(currentFloor + 1);
        form.reset({
          floorNumber: currentFloor + 1,
          panelCount: 5,
          panelPrefix: `${building.name.slice(0, 3).toUpperCase()}-F${currentFloor + 1}-`,
        });
      } else {
        // All floors have been processed
        toast({
          title: 'All floors completed',
          description: `All ${building.floors} floors have been set up with panels.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error adding panels',
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
        <DialogTitle>Add Panels to Floor</DialogTitle>
        <DialogDescription>
          {progressText} - Define panels for this floor
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
            name="panelPrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Panel Prefix</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="panelCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Panels</FormLabel>
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
                  Add Panels & Finish
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onComplete}>
                  Skip Remaining
                </Button>
                <Button type="submit" className="bg-construction-blue hover:bg-construction-blue-dark">
                  Add Panels & Continue
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
