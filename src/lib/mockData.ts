
import { Project, Panel, PanelStatus, ProjectStatus } from "@/types";

// Generate some project IDs
const projectIds = [
  "PRJ-2024-001",
  "PRJ-2024-002",
  "PRJ-2024-003",
  "PRJ-2024-004",
  "PRJ-2024-005"
];

// Panel types
const panelTypes = [
  "Precast Wall",
  "Precast Column",
  "Precast Beam",
  "Precast Slab",
  "Precast Stair",
  "Precast Facade"
];

// Project locations in Qatar
const locations = [
  "Doha",
  "Al Wakrah",
  "Al Khor",
  "Lusail",
  "Al Rayyan",
  "Mesaieed",
  "Dukhan"
];

// Client names
const clients = [
  "Qatar Foundation",
  "Ashghal",
  "Kahramaa",
  "Qatar Rail",
  "Qatari Diar",
  "Msheireb Properties",
  "Barwa Real Estate"
];

// Generate random date within range
const getRandomDate = (start: Date, end: Date): string => {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
};

// Generate a random project
const generateProject = (id: string): Project => {
  const status: ProjectStatus = ['active', 'completed', 'on-hold'][Math.floor(Math.random() * 3)] as ProjectStatus;
  const startDate = getRandomDate(new Date(2023, 0, 1), new Date(2024, 3, 1));
  const endDate = status === 'completed' ? getRandomDate(new Date(startDate), new Date(2024, 11, 31)) : undefined;
  
  return {
    id,
    name: `Extraco ${locations[Math.floor(Math.random() * locations.length)]} Development`,
    location: locations[Math.floor(Math.random() * locations.length)],
    status,
    startDate,
    endDate,
    description: `Construction project in ${locations[Math.floor(Math.random() * locations.length)]}, Qatar.`,
    clientName: clients[Math.floor(Math.random() * clients.length)],
    panelCount: Math.floor(Math.random() * 300) + 100
  };
};

// Generate a random panel
const generatePanel = (projectId: string, index: number): Panel => {
  const status: PanelStatus = ['manufactured', 'delivered', 'installed', 'inspected', 'rejected'][Math.floor(Math.random() * 5)] as PanelStatus;
  const serialNumber = `PNL-${projectId.slice(-3)}-${(index + 1).toString().padStart(3, '0')}`;
  const panelType = panelTypes[Math.floor(Math.random() * panelTypes.length)];
  
  const manufacturedDate = getRandomDate(new Date(2023, 0, 1), new Date(2024, 5, 1));
  
  let deliveredDate, installedDate, inspectedDate;
  
  if (status === 'delivered' || status === 'installed' || status === 'inspected' || status === 'rejected') {
    deliveredDate = getRandomDate(new Date(manufacturedDate), new Date(2024, 8, 1));
  }
  
  if (status === 'installed' || status === 'inspected' || status === 'rejected') {
    installedDate = getRandomDate(new Date(deliveredDate!), new Date(2024, 10, 1));
  }
  
  if (status === 'inspected' || status === 'rejected') {
    inspectedDate = getRandomDate(new Date(installedDate!), new Date());
  }
  
  return {
    id: `${serialNumber}`,
    projectId,
    serialNumber,
    name: `Panel ${serialNumber}`, // Added name field as required by the Panel type
    type: panelType,
    status,
    location: status === 'manufactured' ? 'Factory' : 'Site',
    dimensions: {
      width: Math.floor(Math.random() * 300) + 100,
      height: Math.floor(Math.random() * 300) + 100,
      thickness: Math.floor(Math.random() * 20) + 10
    },
    weight: Math.floor(Math.random() * 5000) + 1000,
    manufacturedDate,
    deliveredDate,
    installedDate,
    inspectedDate,
    notes: Math.random() > 0.7 ? `Note for panel ${serialNumber}` : undefined
  };
};

// Generate sample data
export const generateMockProjects = (): Project[] => {
  return projectIds.map(id => generateProject(id));
};

export const generateMockPanels = (projects: Project[]): Panel[] => {
  const panels: Panel[] = [];
  
  projects.forEach(project => {
    const panelCount = project.panelCount;
    for (let i = 0; i < panelCount; i++) {
      panels.push(generatePanel(project.id, i));
    }
  });
  
  return panels;
};

// Export sample data
export const mockProjects = generateMockProjects();
export const mockPanels = generateMockPanels(mockProjects);
