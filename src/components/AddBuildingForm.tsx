
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import AddFloorsForm from './AddFloorsForm';

const buildingSchema = z.object({
  name: z.string().min(2, { message: 'Building name is required' }),
  floors: z.number().min(1, { message: 'Number of floors is required' }).max(200, { message: 'Maximum 200 floors allowed' }),
  description: z.string().optional(),
});

type BuildingFormValues = z.infer<typeof buildingSchema>;

interface AddBuildingFormProps {
  projectId: string;
  onComplete: () => void;
}

const AddBuildingForm: React.FC<AddBuildingFormProps> = ({ projectId, onComplete }) => {
  const { addBuilding } = useAppContext();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddingFloors, setIsAddingFloors] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);

  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: '',
      floors: 1,
      description: ''
    }
  });

  const onSubmit = async (values: BuildingFormValues) => {
    const buildingId = uuidv4();
    
    const newBuilding: Building = {
      id: buildingId,
      projectId,
      name: values.name,
      floors: values.floors,
      description: values.description
    };

    try {
      // Add to database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('buildings')
          .insert({
            id: newBuilding.id,
            project_id: newBuilding.projectId,
            name: newBuilding.name,
            floors: newBuilding.floors,
            description: newBuilding.description,
            created_by: user.id
          });
          
        if (error) throw error;
      }
      
      // Add to local state
      addBuilding(newBuilding);
      
      toast({
        title: 'Building added',
        description: `Building ${newBuilding.name} has been added to the project.`,
      });
      
      setCurrentBuilding(newBuilding);
      setIsAddingFloors(true);
    } catch (error) {
      toast({
        title: 'Error adding building',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  const skipAndFinish = () => {
    onComplete();
  };
  
  const addAnotherBuilding = () => {
    form.reset();
    setIsAddingFloors(false);
  };

  return (
    <>
      {!isAddingFloors ? (
        <>
          <DialogHeader>
            <DialogTitle>Add Building</DialogTitle>
            <DialogDescription>
              Add buildings to your newly created project
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter building name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="floors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Floors</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max="200"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter building description"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={skipAndFinish}>
                  Skip
                </Button>
                <Button type="submit" className="bg-construction-blue hover:bg-construction-blue-dark">
                  Add Building
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </>
      ) : (
        <AddFloorsForm 
          building={currentBuilding!}
          onComplete={onComplete}
          onAddAnother={addAnotherBuilding}
        />
      )}
    </>
  );
};

export default AddBuildingForm;
