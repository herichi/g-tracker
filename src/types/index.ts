
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
  buildings?: Building[];
}

export interface Building {
  id: string;
  projectId: string;
  name: string;
  floors: number;
  description?: string;
}

export interface PanelGroup {
  id: string;
  name: string;
  projectId: string;
  buildingId?: string;
  panelIds: string[];
  createdAt: string;
  description?: string;
}

export type PanelStatus = 
  | 'manufactured' 
  | 'delivered' 
  | 'installed' 
  | 'inspected' 
  | 'rejected' 
  | 'issued' 
  | 'held' 
  | 'produced' 
  | 'prepared' 
  | 'returned'
  | 'rejected_material'
  | 'approved_material'
  | 'checked'
  | 'approved_final'
  | 'cancelled'
  | 'proceed_delivery'
  | 'broken_site';

export type UserRole =
  | 'data_entry'
  | 'production_engineer'
  | 'qc_factory'
  | 'store_site'
  | 'qc_site'
  | 'foreman_site'
  | 'site_engineer'
  | 'admin';

export interface RoleStatusMapping {
  role: UserRole;
  allowedStatuses: PanelStatus[];
}

export interface Panel {
  id: string;
  projectId: string;
  buildingId?: string;
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
  qrCode?: string;
  groupIds?: string[];
  statusHistory?: {
    status: PanelStatus;
    date: string;
    updatedBy?: string;
    notes?: string;
    photoUrl?: string;
  }[];
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

export const ROLE_STATUS_MAPPING: RoleStatusMapping[] = [
  {
    role: 'data_entry',
    allowedStatuses: ['issued', 'held', 'cancelled']
  },
  {
    role: 'production_engineer',
    allowedStatuses: ['produced']
  },
  {
    role: 'qc_factory',
    allowedStatuses: ['proceed_delivery']
  },
  {
    role: 'store_site',
    allowedStatuses: ['delivered', 'broken_site']
  },
  {
    role: 'qc_site',
    allowedStatuses: ['approved_material', 'rejected_material', 'inspected', 'approved_final']
  },
  {
    role: 'foreman_site',
    allowedStatuses: ['installed']
  },
  {
    role: 'site_engineer',
    allowedStatuses: ['checked']
  },
  {
    role: 'admin',
    allowedStatuses: ['issued', 'held', 'produced', 'proceed_delivery', 'delivered', 'broken_site', 'approved_material', 'rejected_material', 'installed', 'checked', 'inspected', 'approved_final', 'cancelled', 'manufactured']
  }
];

export const getRoleNameForDisplay = (role: UserRole): string => {
  switch (role) {
    case 'data_entry': return 'Data Entry';
    case 'production_engineer': return 'Production Engineer';
    case 'qc_factory': return 'QC Factory';
    case 'store_site': return 'Store Site';
    case 'qc_site': return 'QC Site';
    case 'foreman_site': return 'Foreman Site';
    case 'site_engineer': return 'Site Engineer';
    case 'admin': return 'Administrator';
    default: 
      // Make sure we handle the case properly by checking if role is a string
      if (typeof role === 'string') {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      return String(role);
  }
};
