
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import AddBuildingForm from './AddBuildingForm';
import ProjectForm, { ProjectFormValues } from './projects/ProjectForm';
import { createProject } from './projects/projectUtils';

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
  
  const handleClose = () => {
    setCurrentProjectId(null);
    setIsCreatingBuilding(false);
    onClose();
  };

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      const newProject = await createProject(values, user?.id);
      
      // Add to local state
      addProject(newProject);
      setCurrentProjectId(newProject.id);
      
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
            
            <ProjectForm onSubmit={onSubmit} onCancel={handleClose} />
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
