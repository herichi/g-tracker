
import React, { createContext, useContext, useState, useEffect } from "react";
import { Project, Panel, ProjectSummary, PanelSummary, PanelStatusCount, Building, PanelGroup } from "@/types";
import { mockProjects, mockPanels } from "@/lib/mockData";
import { toast } from "@/components/ui/use-toast";

interface AppContextType {
  projects: Project[];
  panels: Panel[];
  buildings: Building[];
  panelGroups: PanelGroup[];
  selectedProject: Project | null;
  projectSummary: ProjectSummary;
  panelSummary: PanelSummary;
  
  // Actions
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  
  // Building actions
  addBuilding: (building: Building) => void;
  updateBuilding: (building: Building) => void;
  deleteBuilding: (buildingId: string) => void;
  
  // Panel actions
  addPanel: (panel: Panel) => void;
  updatePanel: (panel: Panel) => void;
  deletePanel: (panelId: string) => void;
  
  // Group actions
  addPanelGroup: (group: PanelGroup) => void;
  updatePanelGroup: (group: PanelGroup) => void;
  deletePanelGroup: (groupId: string) => void;
  updatePanelsStatus: (panelIds: string[], status: string) => void;
  
  // Filters
  getProjectPanels: (projectId: string) => Panel[];
  getBuildingPanels: (buildingId: string) => Panel[];
  getGroupPanels: (groupId: string) => Panel[];
  getPanelsByStatus: (status: string) => Panel[];
  getProjectBuildings: (projectId: string) => Building[];
  getProjectGroups: (projectId: string) => PanelGroup[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [panelGroups, setPanelGroups] = useState<PanelGroup[]>([]);
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
    // Later we can add mock buildings and groups
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
    // Also delete all panels, buildings and groups for this project
    setPanels(panels.filter(p => p.projectId !== projectId));
    setBuildings(buildings.filter(b => b.projectId !== projectId));
    setPanelGroups(panelGroups.filter(g => g.projectId !== projectId));
    
    toast({
      title: "Project Deleted",
      description: projectToDelete ? `Project ${projectToDelete.name} has been deleted.` : "Project deleted."
    });
  };

  // Building actions
  const addBuilding = (building: Building) => {
    setBuildings([...buildings, building]);
    toast({
      title: "Building Added",
      description: `Building ${building.name} has been added successfully.`
    });
  };

  const updateBuilding = (building: Building) => {
    setBuildings(buildings.map(b => b.id === building.id ? building : b));
    toast({
      title: "Building Updated",
      description: `Building ${building.name} has been updated successfully.`
    });
  };

  const deleteBuilding = (buildingId: string) => {
    const buildingToDelete = buildings.find(b => b.id === buildingId);
    setBuildings(buildings.filter(b => b.id !== buildingId));
    
    // Update panels to remove association with this building
    setPanels(panels.map(panel => 
      panel.buildingId === buildingId 
        ? { ...panel, buildingId: undefined } 
        : panel
    ));
    
    // Update groups to remove association with this building
    setPanelGroups(panelGroups.map(group => 
      group.buildingId === buildingId 
        ? { ...group, buildingId: undefined } 
        : group
    ));
    
    toast({
      title: "Building Deleted",
      description: buildingToDelete ? `Building ${buildingToDelete.name} has been deleted.` : "Building deleted."
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
    
    // Remove panel from any groups
    setPanelGroups(panelGroups.map(group => {
      if (group.panelIds.includes(panelId)) {
        return {
          ...group,
          panelIds: group.panelIds.filter(id => id !== panelId)
        };
      }
      return group;
    }));
    
    toast({
      title: "Panel Deleted",
      description: panelToDelete ? `Panel ${panelToDelete.serialNumber} has been deleted.` : "Panel deleted."
    });
  };

  // Group actions
  const addPanelGroup = (group: PanelGroup) => {
    setPanelGroups([...panelGroups, group]);
    // Update panels to include this group
    setPanels(panels.map(panel => {
      if (group.panelIds.includes(panel.id)) {
        const groupIds = panel.groupIds ? [...panel.groupIds, group.id] : [group.id];
        return { ...panel, groupIds };
      }
      return panel;
    }));
    
    toast({
      title: "Panel Group Added",
      description: `Group "${group.name}" has been created successfully with ${group.panelIds.length} panels.`
    });
  };

  const updatePanelGroup = (group: PanelGroup) => {
    setPanelGroups(panelGroups.map(g => g.id === group.id ? group : g));
    
    // Update all panels to reflect group changes
    setPanels(panels.map(panel => {
      // If panel should be in this group but isn't currently
      if (group.panelIds.includes(panel.id)) {
        const groupIds = panel.groupIds && !panel.groupIds.includes(group.id) 
          ? [...panel.groupIds, group.id] 
          : panel.groupIds || [group.id];
        return { ...panel, groupIds };
      } 
      // If panel shouldn't be in this group but currently is
      else if (panel.groupIds?.includes(group.id)) {
        return {
          ...panel,
          groupIds: panel.groupIds.filter(id => id !== group.id)
        };
      }
      return panel;
    }));
    
    toast({
      title: "Panel Group Updated",
      description: `Group "${group.name}" has been updated with ${group.panelIds.length} panels.`
    });
  };

  const deletePanelGroup = (groupId: string) => {
    const groupToDelete = panelGroups.find(g => g.id === groupId);
    setPanelGroups(panelGroups.filter(g => g.id !== groupId));
    
    // Remove group from all panels
    setPanels(panels.map(panel => {
      if (panel.groupIds?.includes(groupId)) {
        return {
          ...panel,
          groupIds: panel.groupIds.filter(id => id !== groupId)
        };
      }
      return panel;
    }));
    
    toast({
      title: "Panel Group Deleted",
      description: groupToDelete ? `Group "${groupToDelete.name}" has been deleted.` : "Panel group deleted."
    });
  };

  // Status update for multiple panels
  const updatePanelsStatus = (panelIds: string[], status: string) => {
    const currentDate = new Date().toISOString();
    const updatedPanels = panels.map(panel => {
      if (panelIds.includes(panel.id)) {
        // Create status history entry
        const statusHistory = panel.statusHistory || [];
        const newStatusEntry = {
          status: status as PanelStatus,
          date: currentDate
        };
        
        return {
          ...panel,
          status: status as PanelStatus,
          statusHistory: [...statusHistory, newStatusEntry]
        };
      }
      return panel;
    });
    
    setPanels(updatedPanels);
    toast({
      title: "Status Updated",
      description: `Status updated to ${status} for ${panelIds.length} panels.`
    });
  };

  // Filters
  const getProjectPanels = (projectId: string) => {
    return panels.filter(panel => panel.projectId === projectId);
  };

  const getBuildingPanels = (buildingId: string) => {
    return panels.filter(panel => panel.buildingId === buildingId);
  };
  
  const getGroupPanels = (groupId: string) => {
    const group = panelGroups.find(g => g.id === groupId);
    if (!group) return [];
    return panels.filter(panel => group.panelIds.includes(panel.id));
  };

  const getPanelsByStatus = (status: string) => {
    return panels.filter(panel => panel.status === status);
  };
  
  const getProjectBuildings = (projectId: string) => {
    return buildings.filter(building => building.projectId === projectId);
  };
  
  const getProjectGroups = (projectId: string) => {
    return panelGroups.filter(group => group.projectId === projectId);
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        panels,
        buildings,
        panelGroups,
        selectedProject,
        projectSummary,
        panelSummary,
        setSelectedProject,
        addProject,
        updateProject,
        deleteProject,
        addBuilding,
        updateBuilding,
        deleteBuilding,
        addPanel,
        updatePanel,
        deletePanel,
        addPanelGroup,
        updatePanelGroup,
        deletePanelGroup,
        updatePanelsStatus,
        getProjectPanels,
        getBuildingPanels,
        getGroupPanels,
        getPanelsByStatus,
        getProjectBuildings,
        getProjectGroups
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
