
export type ProjectStatus = 'active' | 'completed' | 'on-hold';

export interface Project {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  description?: string;
  clientName: string;
  panelCount: number;
}

export type PanelStatus = 'manufactured' | 'delivered' | 'installed' | 'inspected' | 'rejected';

export interface Panel {
  id: string;
  projectId: string;
  serialNumber: string;
  type: string;
  status: PanelStatus;
  location?: string;
  dimensions: {
    width: number;
    height: number;
    thickness: number;
  };
  weight: number;
  manufacturedDate: string;
  deliveredDate?: string;
  installedDate?: string;
  inspectedDate?: string;
  notes?: string;
}

export interface PanelStatusCount {
  status: PanelStatus;
  count: number;
}

export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
}

export interface PanelSummary {
  totalPanels: number;
  statusCounts: PanelStatusCount[];
}
