
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel, PanelStatus, UserRole } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import StatusTimeline from "./StatusTimeline";
import StatusUpdateForm from "./StatusUpdateForm";

interface PanelStatusCardProps {
  panel: Panel;
  onStatusUpdate: (newStatus: PanelStatus, role: UserRole) => void;
}

const PanelStatusCard: React.FC<PanelStatusCardProps> = ({ panel, onStatusUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
            <TabsTrigger value="update" className="flex-1">Update Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline">
            <StatusTimeline 
              items={panel.statusHistory || []}
              manufacturedDate={panel.manufacturedDate}
              deliveredDate={panel.deliveredDate}
              installedDate={panel.installedDate}
              inspectedDate={panel.inspectedDate}
              status={panel.status}
            />
          </TabsContent>
          
          <TabsContent value="update">
            <StatusUpdateForm
              currentStatus={panel.status}
              onUpdate={onStatusUpdate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PanelStatusCard;
