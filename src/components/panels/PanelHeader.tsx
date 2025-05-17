
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Edit, Trash2, QrCode } from "lucide-react";
import { Panel } from "@/types";

interface PanelHeaderProps {
  panel: Panel;
  onDelete: () => void;
  onShowQrCode: () => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ panel, onDelete, onShowQrCode }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/panels')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Panel {panel.serialNumber}</h1>
        <StatusBadge status={panel.status} className="ml-4" />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onShowQrCode}
          className="text-construction-blue border-construction-blue"
        >
          <QrCode className="mr-2 h-4 w-4" /> QR Code
        </Button>
        <Button 
          variant="outline"
          className="text-construction-blue border-construction-blue"
        >
          <Edit className="mr-2 h-4 w-4" /> Edit Panel
        </Button>
        <Button 
          variant="destructive"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
};

export default PanelHeader;
