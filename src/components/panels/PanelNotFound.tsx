
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PanelNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-center items-center h-full p-8">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Panel Not Found</h2>
          <p className="mb-6">The panel you're looking for does not exist or has been removed.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/panels')}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Panels
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PanelNotFound;
