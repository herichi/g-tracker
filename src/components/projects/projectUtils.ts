
import { v4 as uuidv4 } from 'uuid';
import { ProjectFormValues } from './ProjectForm';
import { Project } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const createProject = async (values: ProjectFormValues, userId?: string): Promise<Project> => {
  const projectId = uuidv4();
  
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
  
  // Add to database if user is logged in
  if (userId) {
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
      created_by: userId
    });
      
    if (error) throw error;
  }
  
  return newProject;
};
