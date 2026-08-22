export interface GoodsOutItem {
  id?: number;
  name: string;       // item_name
  quantity: string;   // quantity (string for input, convert to number on submit)
  unit: string;       // unit
  purpose: string;    // purpose
  images?: string[];  // URLs / base64 of attached photos
}

export interface RequestItem {
  id: number;
  requestCode?: string;
  title: string;
  reason: string;
  requester_id: number;
  status: number; // 1: PENDING_DEPT, 2: APPROVED_WAITING_GATE, 3: REJECTED, 4: RETURNED, 5: COMPLETED
  requestDate: string; // Used for creation date
  startDate: string;  
  endDate: string;    
  carrierEmpno: string; // Người mang hàng
  carrierName: string;  // Tên người mang hàng
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
  qrCode?: string;
  qrCodeImage?: string;
}

export interface InternalUser {
  id: number;
  empno: string;
  name: string;
  dept: string;
  deptNo?: string;
  deptId: number;
}

export const isUserApprover = (r: RequestItem, u: any): boolean => {
  if (!u || r.status !== 1) return false;

  // Role-based global override has been removed so that admins only see tasks specifically assigned to them in their TODO list.

  const userIds = [
    u.empno, 
    u.group_empno, 
    u.emp_no, 
    u.username, 
    u.syno_username, 
    u.portalId, 
    u.id
  ].filter(Boolean).map(x => String(x).trim().toLowerCase());

  if (userIds.length === 0) return false;

  const matchesUser = (val: any) => {
    if (!val) return false;
    const str = String(val).trim().toLowerCase();
    return userIds.includes(str);
  };

  // If no flow snapshot is saved (e.g. legacy items), allow active user if they have manager role
  if (!r.flowSnapshot || !Array.isArray(r.flowSnapshot) || r.flowSnapshot.length === 0) {
    return true; 
  }

  // Find current active level in flow snapshot
  const currentLvl = r.currentLvlCode || (r.status === 1 ? 'dept_manager' : '');
  const currentStep = r.flowSnapshot.find((step: any) => 
    step.lvl_code === currentLvl || 
    (currentLvl === 'dept' && (step.lvl_code === 'dept_manager' || step.lvl_code === 'custom_dept_manager')) ||
    (currentLvl === 'dept_manager' && step.lvl_code === 'dept_manager')
  ) || r.flowSnapshot[0]; // Fallback to first step if pending

  if (!currentStep) return true;

  const managers = currentStep.managers || [];
  for (const manager of managers) {
    if (matchesUser(manager.empno) || matchesUser(manager.emp_no) || matchesUser(manager.group_empno) || matchesUser(manager.name)) {
      return true;
    }
    const deputies = manager.deputies || [];
    for (const d of deputies) {
      if (
        matchesUser(d.empno) || 
        matchesUser(d.emp_no) || 
        matchesUser(d.group_empno) || 
        matchesUser(d.deputy_empno) || 
        matchesUser(d.deputy_group_empno) || 
        matchesUser(d.deputy_emp_no) || 
        matchesUser(d.name)
      ) {
        return true;
      }
    }
  }

  return false;
};
