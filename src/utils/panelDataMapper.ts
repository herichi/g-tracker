
import { Panel, PanelStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export const mapRowToPanelData = (
  row: any,
  projectId?: string,
  buildingId?: string,
  existingPanel?: Panel
) => {
  const name = row.SerialNumber || row.Name || row.name || row.serial_number || '';
  const today = new Date().toISOString().split('T')[0];

  // Prepare the data for panels table (items schema)
  const itemData = {
    id: existingPanel?.id || uuidv4(),
    project_id: projectId || row.ProjectId || row.project_id || '',
    name: name,
    type: row.Type || row.type || 'Standard',
    status: row.Status || row.status || 'In Progress',
    date: formatDate(row.Date || row.date) || today,
    issue_transmittal_no: row.IssueTransmittalNo || row.issue_transmittal_no || row.Issue_Transmittal_No || '',
    dwg_no: row.DwgNo || row.dwg_no || row.Dwg_No || '',
    description: row.Description || row.description || '',
    tag: row.PanelTag || row.panel_tag || row.Panel_Tag || name,
    unit_qty: parseFloat(row.UnitQty || row.unit_qty || row.Unit_Qty || 0) || null,
    ifp_qty_nos: parseInt(row.IFPQtyNos || row.ifp_qty_nos || row.IFP_Qty_Nos || 0) || 0,
    ifp_qty: parseFloat(row.IFPQty || row.ifp_qty || row.IFP_Qty || 0) || null,
    draftman: row.Draftman || row.draftman || 'System Generated',
    checked_by: row.CheckedBy || row.checked_by || row.Checked_By || null,
    notes: row.Notes || row.notes || null
  };

  // Prepare Panel object for local state
  const panelData: Partial<Panel> = {
    serialNumber: name,
    name: name,
    type: itemData.type,
    status: itemData.status as PanelStatus,
    projectId: itemData.project_id,
    buildingId: buildingId,
    dimensions: {
      width: parseFloat(row.Width || row.width || 100),
      height: parseFloat(row.Height || row.height || 200),
      thickness: parseFloat(row.Thickness || row.thickness || 10)
    },
    weight: parseFloat(row.Weight || row.weight || 50),
    date: itemData.date,
    issueTransmittalNo: itemData.issue_transmittal_no,
    dwgNo: itemData.dwg_no,
    description: itemData.description,
    panelTag: itemData.tag,
    unitQty: itemData.unit_qty,
    ifpQtyNos: itemData.ifp_qty_nos,
    ifpQtyMeasurement: itemData.ifp_qty,
    draftman: itemData.draftman,
    checkedBy: itemData.checked_by,
    notes: itemData.notes,
    location: row.Location || row.location || null,
    manufacturedDate: formatDate(row.ManufacturedDate || row.manufactured_date) || today,
    deliveredDate: formatDate(row.DeliveredDate || row.delivered_date),
    installedDate: formatDate(row.InstalledDate || row.installed_date),
    inspectedDate: formatDate(row.InspectedDate || row.inspected_date)
  };

  return { itemData, panelData };
};
