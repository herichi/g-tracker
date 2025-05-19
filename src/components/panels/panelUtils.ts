
import { v4 as uuidv4 } from 'uuid';
import { Panel, PanelStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const createPanel = async (panelData: Partial<Panel>, userId?: string): Promise<Panel> => {
  const panelId = uuidv4();
  const now = new Date().toISOString().split('T')[0];
  
  // Ensure all required fields are present
  if (!panelData.serialNumber || !panelData.type || !panelData.projectId) {
    throw new Error('Required panel data missing');
  }
  
  const newPanel: Panel = {
    id: panelId,
    serialNumber: panelData.serialNumber,
    name: panelData.name || '',
    type: panelData.type,
    projectId: panelData.projectId,
    buildingId: panelData.buildingId,
    weight: panelData.weight || 0,
    dimensions: panelData.dimensions || { width: 0, height: 0, thickness: 0 },
    status: panelData.status || 'manufactured',
    manufacturedDate: now,
    date: panelData.date || now,
    issueTransmittalNo: panelData.issueTransmittalNo,
    dwgNo: panelData.dwgNo,
    description: panelData.description,
    panelTag: panelData.panelTag,
    unitQty: panelData.unitQty,
    unitQtyType: panelData.unitQtyType || 'sqm',
    ifpQtyNos: panelData.ifpQtyNos,
    ifpQtyMeasurement: panelData.ifpQtyMeasurement,
    draftman: panelData.draftman,
    checkedBy: panelData.checkedBy,
    notes: panelData.notes,
    location: panelData.location,
    qrCodeImage: panelData.qrCodeImage,
  };
  
  // Add to database if user is logged in
  if (userId) {
    try {
      const { error } = await supabase.from('panels').insert({
        id: newPanel.id,
        serial_number: newPanel.serialNumber,
        name: newPanel.name,
        type: newPanel.type,
        project_id: newPanel.projectId,
        building_id: newPanel.buildingId || null,
        weight: newPanel.weight,
        width: newPanel.dimensions.width,
        height: newPanel.dimensions.height,
        thickness: newPanel.dimensions.thickness,
        status: newPanel.status,
        manufactured_date: newPanel.manufacturedDate,
        floor_number: 1, // Default to 1 if not specified, can be updated later
        created_by: userId
      });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error creating panel in database:', error);
      throw error;
    }
  }
  
  return newPanel;
};
