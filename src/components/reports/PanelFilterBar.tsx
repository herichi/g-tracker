
import React from "react";
import { Project, Building } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PanelFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  selectedBuilding: string;
  setSelectedBuilding: (id: string) => void;
  projects: Project[];
  filteredBuildings: Building[];
}

const PanelFilterBar: React.FC<PanelFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedProject,
  setSelectedProject,
  selectedBuilding,
  setSelectedBuilding,
  projects,
  filteredBuildings
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input 
          placeholder="Search panels..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>
      <div className="flex gap-2">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-projects">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={selectedBuilding} 
          onValueChange={setSelectedBuilding}
          disabled={!selectedProject || filteredBuildings.length === 0}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Buildings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-buildings">All Buildings</SelectItem>
            {filteredBuildings.map(building => (
              <SelectItem key={building.id} value={building.id}>
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PanelFilterBar;
