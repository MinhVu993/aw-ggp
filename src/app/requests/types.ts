export interface GoodsOutItem {
  id?: number;
  name: string;       // item_name
  quantity: string;   // quantity (string for input, convert to number on submit)
  unit: string;       // unit
  purpose: string;    // purpose
}

export interface RequestItem {
  id: number;
  requestCode?: string;
  title: string;
  reason: string;
  requester_id: number;
  status: number; // 1: PENDING_DEPT, 2: APPROVED_WAITING_GATE, 3: REJECTED, 4: RETURNED, 5: COMPLETED, 6: CANCELLED
  requestDate: string; // Used instead of startDate/endDate
  startDate?: string;  // Kept for backward compatibility if needed, but not used in UI
  endDate?: string;    // Kept for backward compatibility
  rejectReason?: string;
  returnReason?: string; // New
  approvedAt?: string;
  createdAt: string;
  requesterName: string;
  requesterEmpno?: string;
  requesterDept: string;
  approverName?: string;
  destination: string; // New field for Gate Pass
  itemCount: number;
  items?: GoodsOutItem[]; // Replaces people/areas
  currentLvlCode?: string;   // Current approval level code
  flowSnapshot?: any[];      // Full flow at time of creation
  approvalLogs?: any[];      // Approval history
  parentId?: number;
  renewedToCode?: string;
}

export interface InternalUser {
  id: number;
  empno: string;
  name: string;
  dept: string;
  deptNo?: string;
  deptId: number;
}

// Helper to check if current user is an active approver for a request
export const isUserApprover = (r: RequestItem, u: any): boolean => {
  if (!u || (!u.empno && !u.group_empno) || r.status !== 1 || !r.currentLvlCode || !r.flowSnapshot) return false;
  const currentStep = r.flowSnapshot.find((step: any) => step.lvl_code === r.currentLvlCode);
  if (!currentStep) return false;
  const managers = currentStep.managers || [];
  
  const matchesUser = (emp: string) => emp && (emp === u.empno || emp === u.group_empno);

  for (const manager of managers) {
    if (matchesUser(manager.empno)) return true;
    const deputies = manager.deputies || [];
    if (deputies.some((d: any) => matchesUser(d.empno))) return true;
  }
  return false;
};
