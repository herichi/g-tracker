
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import { Project, ProjectStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import AddBuildingForm from './AddBuildingForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const projectSchema = z.object({
  name: z.string().min(2, { message: 'Project name is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  clientName: z.string().min(2, { message: 'Client name is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().optional(),
  estimated: z.coerce.number()
    .int({ message: "Must be a whole number" })
    .nonnegative({ message: "Must be zero or greater" })
    .optional()
    .nullable(),
  status: z.enum(['active', 'completed', 'on-hold'] as const),
  description: z.string().optional()
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ isOpen, onClose }) => {
  const { addProject } = useAppContext();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      location: '',
      clientName: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      description: '',
      estimated: null
    }
  });

  const handleClose = () => {
    form.reset();
    setCurrentProjectId(null);
    setIsCreatingBuilding(false);
    onClose();
  };

  const onSubmit = async (values: ProjectFormValues) => {
    const projectId = uuidv4();
    setCurrentProjectId(projectId);
    
    const newProject: Project = {
      id: projectId,
      name: values.name,
      location: values.location,
      status: values.status,
      startDate: values.startDate,
      endDate: values.endDate,
      description: values.description,
      clientName: values.clientName,
      panelCount: 0,
      estimated: values.estimated
    };
    
    try {
      // Add to database if user is logged in
      if (user) {
        // Insert into Supabase without calling .from() directly with table name
        const { error } = await supabase.from('projects').insert({
          id: newProject.id,
          name: newProject.name,
          location: newProject.location,
          status: newProject.status,
          start_date: newProject.startDate,
          end_date: newProject.endDate,
          description: newProject.description,
          client_name: newProject.clientName,
          estimated: newProject.estimated,
          created_by: user.id
        });
          
        if (error) throw error;
      }
      
      // Add to local state
      addProject(newProject);
      
      toast({
        title: 'Project created',
        description: `Project ${newProject.name} has been created successfully.`,
      });
      
      setIsCreatingBuilding(true);
    } catch (error) {
      toast({
        title: 'Error creating project',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {!isCreatingBuilding ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new construction project to your dashboard
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Panels</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter estimated number of panels"
                            {...field}
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter project description"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-construction-blue hover:bg-construction-blue-dark">
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <AddBuildingForm 
            projectId={currentProjectId!}
            onComplete={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
