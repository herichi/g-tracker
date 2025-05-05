
import React, { createContext, useContext, useState, useEffect } from "react";
import { Project, Panel, ProjectSummary, PanelSummary, PanelStatusCount } from "@/types";
import { mockProjects, mockPanels } from "@/lib/mockData";
import { toast } from "@/components/ui/use-toast";

interface AppContextType {
  projects: Project[];
  panels: Panel[];
  selectedProject: Project | null;
  projectSummary: ProjectSummary;
  panelSummary: PanelSummary;
  
  // Actions
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addPanel: (panel: Panel) => void;
  updatePanel: (panel: Panel) => void;
  deletePanel: (panelId: string) => void;
  
  // Filters
  getProjectPanels: (projectId: string) => Panel[];
  getPanelsByStatus: (status: string) => Panel[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0
  });
  const [panelSummary, setPanelSummary] = useState<PanelSummary>({
    totalPanels: 0,
    statusCounts: []
  });

  // Initialize with mock data
  useEffect(() => {
    setProjects(mockProjects);
    setPanels(mockPanels);
  }, []);

  // Update summaries when data changes
  useEffect(() => {
    // Project summary
    setProjectSummary({
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      onHoldProjects: projects.filter(p => p.status === 'on-hold').length
    });

    // Panel summary
    const statusCounts: PanelStatusCount[] = [
      { status: 'manufactured', count: 0 },
      { status: 'delivered', count: 0 },
      { status: 'installed', count: 0 },
      { status: 'inspected', count: 0 },
      { status: 'rejected', count: 0 }
    ];

    panels.forEach(panel => {
      const statusItem = statusCounts.find(item => item.status === panel.status);
      if (statusItem) {
        statusItem.count++;
      }
    });

    setPanelSummary({
      totalPanels: panels.length,
      statusCounts
    });
  }, [projects, panels]);

  // Project actions
  const addProject = (project: Project) => {
    setProjects([...projects, project]);
    toast({
      title: "Project Added",
      description: `Project ${project.name} has been added successfully.`
    });
  };

  const updateProject = (project: Project) => {
    setProjects(projects.map(p => p.id === project.id ? project : p));
    toast({
      title: "Project Updated",
      description: `Project ${project.name} has been updated successfully.`
    });
  };

  const deleteProject = (projectId: string) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    setProjects(projects.filter(p => p.id !== projectId));
    // Also delete all panels for this project
    setPanels(panels.filter(p => p.projectId !== projectId));
    
    toast({
      title: "Project Deleted",
      description: projectToDelete ? `Project ${projectToDelete.name} has been deleted.` : "Project deleted."
    });
  };

  // Panel actions
  const addPanel = (panel: Panel) => {
    setPanels([...panels, panel]);
    toast({
      title: "Panel Added",
      description: `Panel ${panel.serialNumber} has been added successfully.`
    });
  };

  const updatePanel = (panel: Panel) => {
    setPanels(panels.map(p => p.id === panel.id ? panel : p));
    toast({
      title: "Panel Updated",
      description: `Panel ${panel.serialNumber} has been updated successfully.`
    });
  };

  const deletePanel = (panelId: string) => {
    const panelToDelete = panels.find(p => p.id === panelId);
    setPanels(panels.filter(p => p.id !== panelId));
    
    toast({
      title: "Panel Deleted",
      description: panelToDelete ? `Panel ${panelToDelete.serialNumber} has been deleted.` : "Panel deleted."
    });
  };

  // Filters
  const getProjectPanels = (projectId: string) => {
    return panels.filter(panel => panel.projectId === projectId);
  };

  const getPanelsByStatus = (status: string) => {
    return panels.filter(panel => panel.status === status);
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        panels,
        selectedProject,
        projectSummary,
        panelSummary,
        setSelectedProject,
        addProject,
        updateProject,
        deleteProject,
        addPanel,
        updatePanel,
        deletePanel,
        getProjectPanels,
        getPanelsByStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
