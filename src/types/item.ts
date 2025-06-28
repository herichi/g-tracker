
export interface Item {
  id: string;
  project_id: string;
  name: string;
  type: string;
  status: string;
  date: string;
  issue_transmittal_no: string;
  dwg_no: string;
  description: string;
  panel_tag: string;
  unit_qty: number;
  ifp_qty_nos: number;
  ifp_qty: number;
  draftman: string;
  created_at?: string;
  updated_at?: string;
}

export type ItemStatus = 'Proceed for Delivery' | 'In Progress' | 'Completed' | 'On Hold';

export interface ItemFormData {
  project_id: string;
  name: string;
  type: string;
  status: ItemStatus;
  date: string;
  issue_transmittal_no: string;
  dwg_no: string;
  description: string;
  panel_tag: string;
  unit_qty: number;
  ifp_qty_nos: number;
  ifp_qty: number;
  draftman: string;
}
