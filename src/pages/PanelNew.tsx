import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import PanelForm from "@/components/PanelForm";
import { Panel } from "@/types";
import { toast } from "sonner";

const PanelNew: React.FC = () => {
  const navigate = useNavigate();
  const { projects, buildings, addPanel } = useAppContext();

  const handleSubmit = async (data: Partial<Panel>) => {
    try {
      await addPanel(data as Panel);
      toast.success("Panel created successfully!");
      navigate("/panels");
    } catch (error) {
      console.error("Error creating panel:", error);
      toast.error("Failed to create panel");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Panel</h1>
        <p className="text-gray-600 mt-2">Add a new panel to your project</p>
      </div>
      
      <PanelForm
        projects={projects}
        buildings={buildings}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default PanelNew;