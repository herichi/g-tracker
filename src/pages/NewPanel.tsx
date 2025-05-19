
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import PanelForm from "@/components/PanelForm";

const NewPanel: React.FC = () => {
  const navigate = useNavigate();
  const { addPanel, projects, buildings } = useAppContext();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import the panel creation utility
  const { createPanel } = require("@/components/panels/panelUtils");

  const handleSubmit = async (panelData: any) => {
    try {
      setIsSubmitting(true);
      
      // Add panel to database and local state
      const newPanel = await createPanel(panelData, user?.id);
      addPanel(newPanel);
      
      toast({
        title: "Panel created successfully",
        description: `Panel ${panelData.serialNumber} has been created.`,
      });
      
      // Navigate to panels page or panel detail
      navigate(`/panel/${newPanel.id}`);
    } catch (error) {
      console.error("Error creating panel:", error);
      toast({
        title: "Error creating panel",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Panel</h1>
        <p className="text-gray-600">Add a new panel to your inventory</p>
      </div>
      
      <PanelForm 
        projects={projects} 
        buildings={buildings} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default NewPanel;
