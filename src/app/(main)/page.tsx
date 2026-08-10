"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import styles from "./requests.module.css";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ClipboardText, 
  Plus, 
  Minus,
  X, 
  MagnifyingGlass, 
  Trash, 
  Check, 
  UploadSimple, 
  Users, 
  MapPin, 
  ShieldCheck, 
  ShieldSlash,
  FileCsv,
  WarningCircle,
  CheckCircle,
  Clock,
  Funnel,
  ArrowCounterClockwise,
  ListBullets,
  Copy
} from "@phosphor-icons/react";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { GoodsOutItem, RequestItem, InternalUser, isUserApprover } from "./types";
import { exportRequestsToCSV, downloadCSVTemplate, parseCSVText } from "./csvHelpers";
import HistoryModal from "./components/HistoryModal";
import RejectModal from "./components/RejectModal";
import ConfirmModal, { ConfirmModalState } from "./components/ConfirmModal";
import DetailRequestDrawer from "./components/DetailRequestDrawer";
import CreateRequestDrawer from "./components/CreateRequestDrawer";
import ActionDropdown from "./components/ActionDropdown";
import PrintTemplate from "./components/PrintTemplate";


function RequestsPageContent() {
  const { t, language } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data states
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextRequestCode, setNextRequestCode] = useState("");

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    isDanger: false,
    onConfirm: () => {}
  });

  // Modals & Panels
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<RequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [printRequest, setPrintRequest] = useState<RequestItem | null>(null);

  const handlePrint = (request: RequestItem) => {
    setPrintRequest(request);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Form states (Create Request)
  const [formTitle, setFormTitle] = useState("");
  const [formReason, setFormReason] = useState("");
  const [destination, setDestination] = useState("");
  
  // Date Range & Carrier
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [carrierEmpno, setCarrierEmpno] = useState("");
  const [carrierName, setCarrierName] = useState("");

  const [itemsList, setItemsList] = useState<GoodsOutItem[]>([
    { name: "", quantity: "", unit: "", purpose: "" }
  ]);
  const [renewParentId, setRenewParentId] = useState<number | null>(null);
  const [conflictMsgs, setConflictMsgs] = useState<string[]>([]);

  // Employee Autocomplete search state (inside drawer)
  const [empSearchQuery, setEmpSearchQuery] = useState("");

  // Approval flow state (ifm-tracking)
  const [flowData, setFlowData] = useState<any[]>([]);
  const [flowLoading, setFlowLoading] = useState(false);

  // Hover approval flow states for status badge
  const [hoveredRequestId, setHoveredRequestId] = useState<number | null>(null);
  const [hoveredFlowLoading, setHoveredFlowLoading] = useState(false);
  const [requestFlows, setRequestFlows] = useState<Record<number, any[]>>({});
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Excel-like column filters state
  const [selectedCodesFilter, setSelectedCodesFilter] = useState<string[]>([]);
  const [selectedTimesFilter, setSelectedTimesFilter] = useState<string[]>([]);
  const [selectedAreasFilter, setSelectedAreasFilter] = useState<string[]>([]);
  const [selectedPeopleFilter, setSelectedPeopleFilter] = useState<string[]>([]);
  const [selectedRequestersFilter, setSelectedRequestersFilter] = useState<string[]>([]);
  const [selectedStatusesFilter, setSelectedStatusesFilter] = useState<number[]>([]);
  const [openFilterColumn, setOpenFilterColumn] = useState<"requestCode" | "startDate" | "areas" | "personNames" | "requester" | "status" | null>(null);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, selectedCodesFilter, selectedTimesFilter, selectedAreasFilter, selectedPeopleFilter, selectedRequestersFilter, selectedStatusesFilter]);


  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<number | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [empSuggestions, setEmpSuggestions] = useState<InternalUser[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<string[]>([
    "Nhà máy 2 (NM2)",
    "Kho Ngoại quan Cát Lái",
    "Công ty TNHH Bao Bì Việt Nam",
    "Văn phòng đại diện TP.HCM"
  ]);

  // Combined unique destination master list
  const allDestinations = useMemo(() => {
    const fromRequests = requests.map(r => r.destination).filter(Boolean);
    const combined = new Set([...savedDestinations, ...fromRequests]);
    return Array.from(combined).sort();
  }, [requests, savedDestinations]);

  // Unique values for filters
  const uniqueCodes = useMemo(() => {
    const codesSet = new Set<string>();
    requests.forEach(r => {
      codesSet.add(r.requestCode || `#${r.id}`);
    });
    return Array.from(codesSet).sort();
  }, [requests]);

  const uniqueTimes = useMemo(() => {
    const timesSet = new Set<string>();
    requests.forEach(r => {
      const date = r.requestDate || r.startDate;
      if (date) timesSet.add(date);
    });
    return Array.from(timesSet).sort();
  }, [requests]);

  const uniqueAreas = useMemo(() => {
    return allDestinations;
  }, [allDestinations]);

  const uniquePeople = useMemo(() => {
    const itemsSet = new Set<string>();
    requests.forEach(r => {
      if (r.items) {
        r.items.forEach(item => itemsSet.add(item.name));
      }
    });
    return Array.from(itemsSet).sort();
  }, [requests]);

  const uniqueRequesters = useMemo(() => {
    const requestersSet = new Set<string>();
    requests.forEach(r => {
      if (r.requesterName) requestersSet.add(r.requesterName);
    });
    return Array.from(requestersSet).sort();
  }, [requests]);

  const uniqueStatuses = [1, 2, 3]; // 1: Pending, 2: Approved, 3: Rejected

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (openFilterColumn) {
        const target = e.target as HTMLElement;
        if (!target.closest(`.${styles.filterDropdownContainer}`)) {
          setOpenFilterColumn(null);
          setFilterSearchQuery("");
        }
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [openFilterColumn]);

  useEffect(() => {
    if (!showCreateDrawer) {
      setRenewParentId(null);
    }
  }, [showCreateDrawer]);

  const handleExportCSV = () => {
    exportRequestsToCSV(filteredRequests, t);
  };


  // Fetch Requests and Metadata
  const fetchData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Fetch requests list
      const requestsRes = await apiFetch(`/api/requests?userId=${user.id}&role=${user.role}&empno=${user.empno || ''}&groupEmpno=${user.group_empno || ''}&t=${Date.now()}`);
      const requestsData = await requestsRes.json();
      if (requestsData.success) {
        setRequests(requestsData.data);
      }

      // Fetch metadata (areas and users) for form creation
      const initRes = await apiFetch(`/api/user-config/init?t=${Date.now()}`);
      const initData = await initRes.json();
      if (initData.success) {
        setInternalUsers(initData.users || []);
        setNextRequestCode(initData.nextRequestCode || "");
      }
    } catch (error) {
      console.error("Error fetching request data:", error);
      toast.error(t("err_load_data"));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch approval flow for current user
  const fetchFlowData = async () => {
    if (!user?.empno) return;
    try {
      setFlowLoading(true);
      const res = await apiFetch("/api/requests/flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empno: user.empno,
          location: user.location || "vg",
          app_code: "fac",
          dept: user.dept
        })
      });
      const data = await res.json();
      // console.log("Flow API response:", data);
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          setFlowData(data.data);
        } else if (data.data.result && Array.isArray(data.data.result.flow_data)) {
          setFlowData(data.data.result.flow_data);
        } else if (Array.isArray(data.data.flow_data)) {
          setFlowData(data.data.flow_data);
        } else {
          setFlowData([]);
        }
      } else {
        setFlowData([]);
      }
    } catch (error) {
      console.error("Error fetching flow resolution:", error);
      setFlowData([]);
    } finally {
      setFlowLoading(false);
    }
  };

  useEffect(() => {
    if (showCreateDrawer && user) {
      fetchFlowData();
    }
  }, [showCreateDrawer, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  // Auto-switch to Todo tab on first load if there are pending approvals
  const [initialTabSet, setInitialTabSet] = useState(false);
  useEffect(() => {
    if (!initialTabSet && user && requests.length > 0) {
      const hasTodo = requests.some(r => r.status === 1 && isUserApprover(r, user));
      if (hasTodo) setStatusFilter("todo");
      setInitialTabSet(true);
    }
  }, [user, requests, initialTabSet]);

  // Handle URL id parameter for redirect from notifications
  useEffect(() => {
    const targetId = searchParams.get("id");
    if (targetId && requests.length > 0) {
      const req = requests.find(r => r.id === parseInt(targetId));
      if (req) {
        setSelectedRequest(req);
        // Tự động clear ID khỏi URL để tránh bị mở lại nếu reload (tùy chọn)
        router.replace("/"); 
      }
    }
  }, [searchParams, requests]);

  // Handle employee autocomplete inside the request form
  useEffect(() => {
    if (empSearchQuery.trim() === "") {
      setEmpSuggestions([]);
      return;
    }
    const query = empSearchQuery.toLowerCase();
    const filtered = internalUsers.filter(
      u => u.name.toLowerCase().includes(query) || u.empno.toLowerCase().includes(query)
    ).slice(0, 5);
    setEmpSuggestions(filtered);
  }, [empSearchQuery, internalUsers]);

  // Handle Item inputs
  const handleItemFieldChange = (index: number, field: keyof GoodsOutItem, value: string) => {
    const updated = [...itemsList];
    updated[index] = { ...updated[index], [field]: value };
    setItemsList(updated);
  };

  const addNewItemRow = () => {
    setItemsList(prev => [...prev, { name: "", quantity: "", unit: "", purpose: "" }]);
  };

  const removeItemRow = (index: number) => {
    if (itemsList.length === 1) {
      setItemsList([{ name: "", quantity: "", unit: "", purpose: "" }]);
      return;
    }
    setItemsList(prev => prev.filter((_, i) => i !== index));
  };

  // Submit new Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination) {
      toast.error(t("please_fill_required_fields"));
      return;
    }

    // Filter out invalid items
    const validItems = itemsList.filter(i => i.name.trim() !== "");
    if (validItems.length === 0) {
      toast.error(t("please_add_at_least_one_item"));
      return;
    }

    try {
      setActionLoading(true);

      const res = await apiFetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          reason: formReason,
          requesterId: user?.id,
          requesterEmpno: user?.empno,
          requesterName: user?.name,
          requesterDept: user?.dept,
          destination: destination,
          startDate: startDate,
          endDate: endDate,
          carrierEmpno: carrierEmpno,
          carrierName: carrierName,
          items: validItems,
          flowSnapshot: flowData.length > 0 ? flowData : null,
          parentId: renewParentId,
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t("request_create_success"));
        setShowCreateDrawer(false);
        // Save new destination into master list if not existing
        if (destination && !savedDestinations.includes(destination.trim())) {
          setSavedDestinations(prev => [...prev, destination.trim()]);
        }
        // Reset form
        setFormTitle("");
        setFormReason("");
        setDestination("");
        setStartDate("");
        setEndDate("");
        setCarrierEmpno("");
        setCarrierName("");
        setItemsList([{ name: "", quantity: "", unit: "", purpose: "" }]);
        fetchData(); // Reload
      } else {
        toast.error(data.error || t("request_create_failed"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("conn_server_failed"));
    } finally {
      setActionLoading(false);
    }
  };

  // View detail request
  const handleViewDetails = async (request: RequestItem) => {
    try {
      const res = await apiFetch(`/api/requests/${request.id}?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setSelectedRequest(data.data);
        setShowRejectForm(false);
        setRejectReason("");
      } else {
        toast.error(t("failed_to_load_details"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("conn_failed"));
    }
  };



  // Direct Approve / Reject actions from row (Admin or Reviewer only)
  const handleDirectApprove = async (requestId: number) => {
    if (!user) return;
    setConfirmModal({
      isOpen: true,
      title: t("btn_approve"),
      message: t("confirm_approve_request"),
      confirmText: t("btn_approve"),
      isDanger: false,
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await apiFetch("/api/requests/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestId,
              approve: true,
              rejectReason: null,
              approverId: user.id
            })
          });

          const data = await res.json();
          if (data.success) {
            toast.success(t("request_approve_success"));
            fetchData(); // Reload
          } else {
            toast.error(data.error || t("request_approve_failed"));
          }
        } catch (err) {
          console.error(err);
          toast.error(t("conn_failed"));
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleDirectReject = (requestId: number) => {
    setRequestToReject(requestId);
    setRejectReasonInput("");
    setRejectModalOpen(true);
  };

  const submitReject = async () => {
    if (!user || requestToReject === null) return;
    if (!rejectReasonInput.trim()) {
      toast.error(t("please_enter_reject_reason"));
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiFetch("/api/requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestToReject,
          approve: false,
          rejectReason: rejectReasonInput,
          approverId: user.id
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t("request_reject_success"));
        setRejectModalOpen(false);
        setRequestToReject(null);
        setRejectReasonInput("");
        fetchData(); // Reload
      } else {
        toast.error(data.error || t("request_approve_failed"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("conn_failed"));
    } finally {
      setActionLoading(false);
    }
  };
  const handleRenewRequest = (req: RequestItem) => {
    setRenewParentId(req.id);
    
    setDestination(req.destination || "");
    
    if (req.items && req.items.length > 0) {
      setItemsList(req.items.map(i => ({
        name: i.name || "",
        quantity: i.quantity || "",
        unit: i.unit || "",
        purpose: i.purpose || ""
      })));
    } else {
      setItemsList([{ name: "", quantity: "", unit: "", purpose: "" }]);
    }
    
    // Close Details Drawer if open, Open Create Drawer
    setSelectedRequest(null);
    setShowCreateDrawer(true);
  };

  // Approve / Reject actions (Admin or Reviewer only)
  const handleApproveAction = async (approve: boolean) => {
    if (!selectedRequest || !user) return;

    if (!approve && !rejectReason.trim()) {
      toast.error(t("please_enter_reject_reason"));
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiFetch("/api/requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          approve,
          rejectReason: approve ? null : rejectReason,
          approverId: user.id
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(approve ? t("request_approve_success") : t("request_reject_success"));
        setSelectedRequest(null);
        fetchData(); // Reload
      } else {
        toast.error(data.error || t("request_approve_failed"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("conn_failed"));
    } finally {
      setActionLoading(false);
    }
  };

  // Memoized stats
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 1).length;
    const approved = requests.filter(r => r.status === 2).length;
    const rejected = requests.filter(r => r.status === 3).length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // Filtering list
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // 1. Status Filter
      if (statusFilter === "todo") {
        if (r.status !== 1 || !isUserApprover(r, user)) return false;
      }
      if (statusFilter === "pending") {
        if (r.status !== 1) return false;
      }
      if (statusFilter === "approved" && r.status !== 2) return false;
      if (statusFilter === "rejected" && r.status !== 3) return false;

      // 2. Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesReason = r.reason.toLowerCase().includes(q);
        const matchesRequester = r.requesterName.toLowerCase().includes(q);
        const matchesCode = (r.requestCode || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesReason && !matchesRequester && !matchesCode) return false;
      }

      // 3. Excel-like column filters
      if (selectedCodesFilter.length > 0) {
        const codeStr = r.requestCode || `#${r.id}`;
        if (!selectedCodesFilter.includes(codeStr)) return false;
      }

      if (selectedTimesFilter.length > 0) {
        const date = r.requestDate || r.startDate || "";
        if (!selectedTimesFilter.includes(date)) return false;
      }

      if (selectedAreasFilter.length > 0) {
        if (!r.destination || !selectedAreasFilter.includes(r.destination)) return false;
      }

      if (selectedPeopleFilter.length > 0) {
        if (!r.items || r.items.length === 0) return false;
        const hasMatchingItem = r.items.some(i => selectedPeopleFilter.includes(i.name));
        if (!hasMatchingItem) return false;
      }

      if (selectedRequestersFilter.length > 0) {
        if (!selectedRequestersFilter.includes(r.requesterName)) return false;
      }

      if (selectedStatusesFilter.length > 0) {
        if (!selectedStatusesFilter.includes(r.status)) return false;
      }

      return true;
    });
  }, [requests, statusFilter, searchQuery, user, selectedCodesFilter, selectedTimesFilter, selectedAreasFilter, selectedPeopleFilter, selectedRequestersFilter, selectedStatusesFilter]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);


  const handleStatusMouseEnter = (item: RequestItem, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    setHoveredRequestId(item.id);
    // If item is pending approval (1) and has no flow snapshot, fetch it
    if (item.status === 1 && !requestFlows[item.id]) {
      if (item.flowSnapshot && item.flowSnapshot.length > 0) {
        setRequestFlows(prev => ({ ...prev, [item.id]: item.flowSnapshot! }));
      } else {
        // Fallback: fetch from API (for older records without flowSnapshot)
        setHoveredFlowLoading(true);
        apiFetch(`/api/requests/flow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empno: item.requesterEmpno || "038146",
            location: "vg",
            app_code: "fac",
            dept: item.requesterDept
          })
        })
          .then(r => r.json())
          .then(data => {
            let extractedFlow: any[] = [];
            if (data.success && data.data) {
              if (Array.isArray(data.data)) extractedFlow = data.data;
              else if (data.data.result && Array.isArray(data.data.result.flow_data)) extractedFlow = data.data.result.flow_data;
              else if (Array.isArray(data.data.flow_data)) extractedFlow = data.data.flow_data;
            }
            setRequestFlows(prev => ({ ...prev, [item.id]: extractedFlow }));
          })
          .catch(err => console.error("Error fetching hover flow:", err))
          .finally(() => setHoveredFlowLoading(false));
      }
    }
  };

  const handleStatusMouseLeave = () => {
    setHoveredRequestId(null);
    setTooltipPos(null);
  };

  // Render helpers
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className={`${styles.badge} ${styles.badgeDraft}`}>{t("status_draft")}</span>;
      case 1:
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <span className={styles.pulseDot} />
            {t("status_pending_appr")}
          </span>
        );
      case 2:
        return <span className={`${styles.badge} ${styles.badgeApproved}`}><Check size={12} weight="bold" /> {t("status_approved_appr")}</span>;
      case 3:
        return <span className={`${styles.badge} ${styles.badgeRejected}`}>{t("status_rejected_appr")}</span>;
      default:
        return null;
    }
  };

  const renderHistoryTable = (req: RequestItem) => {
    if (!req.flowSnapshot || req.flowSnapshot.length === 0) return null;
    return (
      <div style={{ overflowX: "auto", border: "1px solid var(--glass-border)", borderRadius: "0", background: "var(--bg-secondary)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--glass-border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-tertiary)" }}>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_level")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_info")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_comment")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_time")}</th>
            </tr>
          </thead>
          <tbody>
            {req.flowSnapshot?.map((step: any, idx: number) => {
              const log = req.approvalLogs?.find((l: any) => l.lvlCode === step.lvl_code);
              const currentLvlIdx = req.flowSnapshot?.findIndex((s: any) => s.lvl_code === req.currentLvlCode) ?? -1;
              
              let isNotReached = false;
              let statusText = "";
              let statusColor = "";
              
              if (log) {
                if (log.action === "approved") {
                  statusText = t("btn_approve");
                  statusColor = "#10b981";
                } else {
                  statusText = t("btn_reject");
                  statusColor = "#ef4444";
                }
              } else {
                if (req.status === 3 && req.currentLvlCode === step.lvl_code) {
                  statusText = t("btn_reject");
                  statusColor = "#ef4444";
                } else if (req.status === 1 && req.currentLvlCode === step.lvl_code) {
                  statusText = t("status_pending_appr");
                  statusColor = "var(--accent-primary)";
                } else if ((req.status === 2) || (currentLvlIdx > -1 && idx < currentLvlIdx)) {
                  statusText = t("btn_approve");
                  statusColor = "#10b981";
                } else {
                  isNotReached = true;
                }
              }

              if (isNotReached) return null;

              // Extract info
              let approverInfo = "";
              if (log && log.approverName) {
                approverInfo = `${log.approverEmpno ? log.approverEmpno + " - " : ""}${log.approverName}`;
              } else if (!log && req.status === 1 && req.currentLvlCode === step.lvl_code && step.managers) {
                approverInfo = step.managers.map((m: any) => `${m.empno ? m.empno + " - " : ""}${m.name}`).join(", ");
              }
              
              // Handle custom styling for status tag
              const statusTag = statusText ? (
                <span style={{ 
                  display: "inline-block",
                  padding: "1px 4px", 
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  border: `1px solid ${statusColor}`,
                  color: statusColor,
                  textTransform: "uppercase",
                  marginRight: "6px",
                  borderRadius: "2px"
                }}>
                  {statusText}
                </span>
              ) : null;

              return (
                <tr key={idx} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--text-primary)", fontWeight: 500 }}>
                    {step.lvl_name?.[language] || step.lvl_name?.vi || step.lvl_name?.en || step.lvl_code}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {statusTag}
                      <span>{approverInfo}</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                    {log?.note || ""}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                    {log?.actedAt || ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (authLoading) return null;

  return (
    <main className={styles.main}>
      {/* Actions Toolbar */}
      <div className={styles.actionRow}>
        <div className={styles.filterTabs}>
          {(() => {
            const tabs: ("all" | "todo" | "pending" | "approved" | "rejected")[] = ["all"];
            const hasTodo = requests.some(r => r.status === 1 && isUserApprover(r, user));
            if (hasTodo) tabs.push("todo");
            tabs.push("pending", "approved", "rejected");
            return tabs;
          })().map(tab => {
            let count = null;
            if (tab === "todo") {
              count = requests.filter(r => r.status === 1 && isUserApprover(r, user)).length;
            } else if (tab === "pending") {
              count = requests.filter(r => r.status === 1).length;
            }
            return (
              <button
                key={tab}
                className={`${styles.filterTab} ${statusFilter === tab ? styles.filterTabActive : ""}`}
                onClick={() => setStatusFilter(tab)}
                style={{ position: "relative", overflow: "visible" }}
              >
                {tab === "all" ? t("all") : t(`status_${tab}_appr`)}
                {count !== null && count > 0 && (
                  <span style={{ 
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "#5cb85c", 
                    color: "#fff", 
                    borderRadius: "10px", 
                    minWidth: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px", 
                    fontWeight: "bold",
                    padding: "0 4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                  }}>
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.rightActions}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><MagnifyingGlass size={16} /></span>
            <input
              className={styles.searchInput}
              placeholder={t("search_request_placeholder")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className={styles.btnOutline} 
            onClick={fetchData} 
            title={t("refresh")} 
            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
          >
            <ArrowCounterClockwise size={14} weight="bold" />
            <span>{t("refresh")}</span>
          </button>
          <button className={styles.btnPrimary} onClick={() => setShowCreateDrawer(true)}>
            <Plus size={16} weight="bold" />
            <span>{t("create_request")}</span>
          </button>
        </div>
      </div>

      {/* Main Request History Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "160px" }} className={styles.filterableTh}>
                  <div className={styles.thContent}>
                    <span>{t("request_code").toUpperCase()}</span>
                    <div className={styles.filterDropdownContainer}>
                      <button
                        className={`${styles.filterBtn} ${selectedCodesFilter.length > 0 ? styles.filterBtnActive : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilterColumn(openFilterColumn === "requestCode" ? null : "requestCode");
                          setFilterSearchQuery("");
                        }}
                      >
                        <Funnel size={12} weight={selectedCodesFilter.length > 0 ? "fill" : "regular"} />
                      </button>
                      {openFilterColumn === "requestCode" && (
                        <div className={styles.filterDropdown} onClick={e => e.stopPropagation()} style={{ left: 0, right: "auto" }}>
                          <input
                            type="text"
                            placeholder={`${t("search")}...`}
                            className={styles.filterSearchInput}
                            value={filterSearchQuery}
                            onChange={e => setFilterSearchQuery(e.target.value)}
                          />
                          <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                              <input
                                type="checkbox"
                                checked={selectedCodesFilter.length === uniqueCodes.length && uniqueCodes.length > 0}
                                onChange={() => {
                                  if (selectedCodesFilter.length === uniqueCodes.length) {
                                    setSelectedCodesFilter([]);
                                  } else {
                                    setSelectedCodesFilter(uniqueCodes);
                                  }
                                }}
                              />
                              <span>({t("select_all").toLowerCase()})</span>
                            </label>
                            {uniqueCodes
                              .filter(code => code.toLowerCase().includes(filterSearchQuery.toLowerCase()))
                              .map(code => (
                                <label key={code} className={styles.filterOption}>
                                  <input
                                    type="checkbox"
                                    checked={selectedCodesFilter.includes(code)}
                                    onChange={() => {
                                      setSelectedCodesFilter(prev =>
                                        prev.includes(code)
                                          ? prev.filter(c => c !== code)
                                          : [...prev, code]
                                      );
                                    }}
                                  />
                                  <span title={code}>{code}</span>
                                </label>
                              ))}
                          </div>
                          <div className={styles.filterActions}>
                            <button
                              className={styles.filterActionBtn}
                              onClick={() => {
                                  setSelectedCodesFilter([]);
                                  setOpenFilterColumn(null);
                                }}
                            >
                              {t("clear_filter")}
                            </button>
                            <button
                              className={`${styles.filterActionBtn} ${styles.filterActionBtnPrimary}`}
                              onClick={() => setOpenFilterColumn(null)}
                            >
                              {t("close")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className={styles.filterableTh}>
                  <div className={styles.thContent}>
                    <span>{t("date_range")?.toUpperCase() || "DATE RANGE"}</span>
                    <div className={styles.filterDropdownContainer}>
                      <button
                        className={`${styles.filterBtn} ${selectedTimesFilter.length > 0 ? styles.filterBtnActive : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilterColumn(openFilterColumn === "startDate" ? null : "startDate");
                          setFilterSearchQuery("");
                        }}
                      >
                        <Funnel size={12} weight={selectedTimesFilter.length > 0 ? "fill" : "regular"} />
                      </button>
                      {openFilterColumn === "startDate" && (
                        <div className={styles.filterDropdown} onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder={`${t("search")}...`}
                            className={styles.filterSearchInput}
                            value={filterSearchQuery}
                            onChange={e => setFilterSearchQuery(e.target.value)}
                          />
                          <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                              <input
                                type="checkbox"
                                checked={selectedTimesFilter.length === uniqueTimes.length && uniqueTimes.length > 0}
                                onChange={() => {
                                  if (selectedTimesFilter.length === uniqueTimes.length) {
                                    setSelectedTimesFilter([]);
                                  } else {
                                    setSelectedTimesFilter(uniqueTimes);
                                  }
                                }}
                              />
                              <span>({t("select_all").toLowerCase()})</span>
                            </label>
                            {uniqueTimes
                              .filter(time => time.toLowerCase().includes(filterSearchQuery.toLowerCase()))
                              .map(time => (
                                <label key={time} className={styles.filterOption}>
                                  <input
                                    type="checkbox"
                                    checked={selectedTimesFilter.includes(time)}
                                    onChange={() => {
                                      setSelectedTimesFilter(prev =>
                                        prev.includes(time)
                                          ? prev.filter(t => t !== time)
                                          : [...prev, time]
                                      );
                                    }}
                                  />
                                  <span title={time}>{time}</span>
                                </label>
                              ))}
                          </div>
                          <div className={styles.filterActions}>
                            <button
                              className={styles.filterActionBtn}
                              onClick={() => {
                                setSelectedTimesFilter([]);
                                setOpenFilterColumn(null);
                              }}
                            >
                              {t("clear_filter")}
                            </button>
                            <button
                              className={`${styles.filterActionBtn} ${styles.filterActionBtnPrimary}`}
                              onClick={() => setOpenFilterColumn(null)}
                            >
                              {t("close")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th>{t("request_date")?.toUpperCase() || "NGÀY TẠO"}</th>
                <th className={styles.filterableTh}>
                  <div className={styles.thContent}>
                    <span>{t("requester").toUpperCase()}</span>
                    <div className={styles.filterDropdownContainer}>
                      <button
                        className={`${styles.filterBtn} ${selectedRequestersFilter.length > 0 ? styles.filterBtnActive : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilterColumn(openFilterColumn === "requester" ? null : "requester");
                          setFilterSearchQuery("");
                        }}
                      >
                        <Funnel size={12} weight={selectedRequestersFilter.length > 0 ? "fill" : "regular"} />
                      </button>
                      {openFilterColumn === "requester" && (
                        <div className={styles.filterDropdown} onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder={`${t("search")}...`}
                            className={styles.filterSearchInput}
                            value={filterSearchQuery}
                            onChange={e => setFilterSearchQuery(e.target.value)}
                          />
                          <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                              <input
                                type="checkbox"
                                checked={selectedRequestersFilter.length === uniqueRequesters.length && uniqueRequesters.length > 0}
                                onChange={() => {
                                  if (selectedRequestersFilter.length === uniqueRequesters.length) {
                                    setSelectedRequestersFilter([]);
                                  } else {
                                    setSelectedRequestersFilter(uniqueRequesters);
                                  }
                                }}
                              />
                              <span>({t("select_all").toLowerCase()})</span>
                            </label>
                            {uniqueRequesters
                              .filter(reqName => reqName.toLowerCase().includes(filterSearchQuery.toLowerCase()))
                              .map(reqName => (
                                <label key={reqName} className={styles.filterOption}>
                                  <input
                                    type="checkbox"
                                    checked={selectedRequestersFilter.includes(reqName)}
                                    onChange={() => {
                                      setSelectedRequestersFilter(prev =>
                                        prev.includes(reqName)
                                          ? prev.filter(r => r !== reqName)
                                          : [...prev, reqName]
                                      );
                                    }}
                                  />
                                  <span title={reqName}>{reqName}</span>
                                </label>
                              ))}
                          </div>
                          <div className={styles.filterActions}>
                            <button
                              className={styles.filterActionBtn}
                              onClick={() => {
                                setSelectedRequestersFilter([]);
                                setOpenFilterColumn(null);
                              }}
                            >
                              {t("clear_filter")}
                            </button>
                            <button
                              className={`${styles.filterActionBtn} ${styles.filterActionBtnPrimary}`}
                              onClick={() => setOpenFilterColumn(null)}
                            >
                              {t("close")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th>{t("carrier_info")?.toUpperCase() || "NGƯỜI MANG HÀNG"}</th>
                <th className={styles.filterableTh}>
                  <div className={styles.thContent}>
                    <span>{t("items")?.toUpperCase() || "ITEMS"}</span>
                    <div className={styles.filterDropdownContainer}>
                      <button
                        className={`${styles.filterBtn} ${selectedPeopleFilter.length > 0 ? styles.filterBtnActive : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilterColumn(openFilterColumn === "personNames" ? null : "personNames");
                          setFilterSearchQuery("");
                        }}
                      >
                        <Funnel size={12} weight={selectedPeopleFilter.length > 0 ? "fill" : "regular"} />
                      </button>
                      {openFilterColumn === "personNames" && (
                        <div className={styles.filterDropdown} onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder={`${t("search")}...`}
                            className={styles.filterSearchInput}
                            value={filterSearchQuery}
                            onChange={e => setFilterSearchQuery(e.target.value)}
                          />
                          <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                              <input
                                type="checkbox"
                                checked={selectedPeopleFilter.length === uniquePeople.length && uniquePeople.length > 0}
                                onChange={() => {
                                  if (selectedPeopleFilter.length === uniquePeople.length) {
                                    setSelectedPeopleFilter([]);
                                  } else {
                                    setSelectedPeopleFilter(uniquePeople);
                                  }
                                }}
                              />
                              <span>({t("select_all").toLowerCase()})</span>
                            </label>
                            {uniquePeople
                              .filter(person => person.toLowerCase().includes(filterSearchQuery.toLowerCase()))
                              .map(person => (
                                <label key={person} className={styles.filterOption}>
                                  <input
                                    type="checkbox"
                                    checked={selectedPeopleFilter.includes(person)}
                                    onChange={() => {
                                      setSelectedPeopleFilter(prev =>
                                        prev.includes(person)
                                          ? prev.filter(p => p !== person)
                                          : [...prev, person]
                                      );
                                    }}
                                  />
                                  <span title={person}>{person}</span>
                                </label>
                              ))}
                          </div>
                          <div className={styles.filterActions}>
                            <button
                              className={styles.filterActionBtn}
                              onClick={() => {
                                setSelectedPeopleFilter([]);
                                setOpenFilterColumn(null);
                              }}
                            >
                              {t("clear_filter")}
                            </button>
                            <button
                              className={`${styles.filterActionBtn} ${styles.filterActionBtnPrimary}`}
                              onClick={() => setOpenFilterColumn(null)}
                            >
                              {t("close")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className={styles.filterableTh}>
                  <div className={styles.thContent}>
                    <span>{t("destination")?.toUpperCase() || "DESTINATION"}</span>
                    <div className={styles.filterDropdownContainer}>
                      <button
                        className={`${styles.filterBtn} ${selectedAreasFilter.length > 0 ? styles.filterBtnActive : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilterColumn(openFilterColumn === "areas" ? null : "areas");
                          setFilterSearchQuery("");
                        }}
                      >
                        <Funnel size={12} weight={selectedAreasFilter.length > 0 ? "fill" : "regular"} />
                      </button>
                      {openFilterColumn === "areas" && (
                        <div className={styles.filterDropdown} onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder={`${t("search")}...`}
                            className={styles.filterSearchInput}
                            value={filterSearchQuery}
                            onChange={e => setFilterSearchQuery(e.target.value)}
                          />
                          <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                              <input
                                type="checkbox"
                                checked={selectedAreasFilter.length === uniqueAreas.length && uniqueAreas.length > 0}
                                onChange={() => {
                                  if (selectedAreasFilter.length === uniqueAreas.length) {
                                    setSelectedAreasFilter([]);
                                  } else {
                                    setSelectedAreasFilter(uniqueAreas);
                                  }
                                }}
                              />
                              <span>({t("select_all").toLowerCase()})</span>
                            </label>
                            {uniqueAreas
                              .filter(area => area.toLowerCase().includes(filterSearchQuery.toLowerCase()))
                              .map(area => (
                                <label key={area} className={styles.filterOption}>
                                  <input
                                    type="checkbox"
                                    checked={selectedAreasFilter.includes(area)}
                                    onChange={() => {
                                      setSelectedAreasFilter(prev =>
                                        prev.includes(area)
                                          ? prev.filter(a => a !== area)
                                          : [...prev, area]
                                      );
                                    }}
                                  />
                                  <span title={area}>{area}</span>
                                </label>
                              ))}
                          </div>
                          <div className={styles.filterActions}>
                            <button
                              className={styles.filterActionBtn}
                              onClick={() => {
                                setSelectedAreasFilter([]);
                                setOpenFilterColumn(null);
                              }}
                            >
                              {t("clear_filter")}
                            </button>
                            <button
                              className={`${styles.filterActionBtn} ${styles.filterActionBtnPrimary}`}
                              onClick={() => setOpenFilterColumn(null)}
                            >
                              {t("close")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className={styles.filterableTh}>
                  <div className={styles.thContent}>
                    <span>{t("status").toUpperCase()}</span>
                    <div className={styles.filterDropdownContainer}>
                      <button
                        className={`${styles.filterBtn} ${selectedStatusesFilter.length > 0 ? styles.filterBtnActive : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilterColumn(openFilterColumn === "status" ? null : "status");
                          setFilterSearchQuery("");
                        }}
                      >
                        <Funnel size={12} weight={selectedStatusesFilter.length > 0 ? "fill" : "regular"} />
                      </button>
                      {openFilterColumn === "status" && (
                        <div className={styles.filterDropdown} onClick={e => e.stopPropagation()}>
                          <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                              <input
                                type="checkbox"
                                checked={selectedStatusesFilter.length === uniqueStatuses.length}
                                onChange={() => {
                                  if (selectedStatusesFilter.length === uniqueStatuses.length) {
                                    setSelectedStatusesFilter([]);
                                  } else {
                                    setSelectedStatusesFilter(uniqueStatuses);
                                  }
                                }}
                              />
                              <span>({t("select_all").toLowerCase()})</span>
                            </label>
                            {uniqueStatuses.map(status => (
                              <label key={status} className={styles.filterOption}>
                                <input
                                  type="checkbox"
                                  checked={selectedStatusesFilter.includes(status)}
                                  onChange={() => {
                                    setSelectedStatusesFilter(prev =>
                                      prev.includes(status)
                                        ? prev.filter(s => s !== status)
                                        : [...prev, status]
                                    );
                                  }}
                                />
                                <span>
                                  {status === 1 && t("status_pending_appr")}
                                  {status === 2 && t("status_approved_appr")}
                                  {status === 3 && t("status_rejected_appr")}
                                </span>
                              </label>
                            ))}
                          </div>
                          <div className={styles.filterActions}>
                            <button
                              className={styles.filterActionBtn}
                              onClick={() => {
                                setSelectedStatusesFilter([]);
                                setOpenFilterColumn(null);
                              }}
                            >
                              {t("clear_filter")}
                            </button>
                            <button
                              className={`${styles.filterActionBtn} ${styles.filterActionBtnPrimary}`}
                              onClick={() => setOpenFilterColumn(null)}
                            >
                              {t("close")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th style={{ width: "90px", textAlign: "center" }}>{t("history").toUpperCase()}</th>
                <th style={{ width: "130px", textAlign: "right" }}>{t("col_action").toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "4rem 0" }}>
                      <div className={styles.spin} style={{ width: "32px", height: "32px", border: "3px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%" }}></div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                        {t("loading_data")}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedRequests.map((item, index) => (
                <tr
                  key={`${item.id}-${index}`}
                  onClick={() => handleViewDetails(item)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                    {item.requestCode || `#${item.id}`}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.startDate || item.requestDate} ➜ {item.endDate || item.requestDate}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{item.requestDate}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.requesterName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                      {item.requesterEmpno ? `ID: ${item.requesterEmpno}` : ""}
                      {item.requesterEmpno && item.requesterDept ? " | " : ""}
                      {item.requesterDept || "N/A"}
                    </div>
                  </td>
                  <td>
                    {item.carrierName || item.carrierEmpno ? (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {item.carrierEmpno} {item.carrierName}
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-secondary)" }}>-</span>
                    )}
                  </td>
                  <td>
                    {item.items && item.items.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "180px", maxWidth: "260px" }}>
                        {item.items.slice(0, 2).map((i, idx) => (
                          <div key={idx} style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            gap: "8px", 
                            background: "rgba(128, 128, 128, 0.04)", 
                            border: "1px solid var(--glass-border)", 
                            padding: "4px 8px", 
                            borderRadius: "4px" 
                          }}>
                            <span style={{ 
                              fontWeight: 600, 
                              color: "var(--text-primary)", 
                              fontSize: "0.825rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              flex: 1
                            }} title={i.name}>
                              {i.name}
                            </span>
                            <span style={{ 
                              fontSize: "0.725rem", 
                              fontFamily: "ui-monospace, SFMono-Regular, monospace", 
                              color: "var(--accent-primary)", 
                              background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)", 
                              border: "1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent)",
                              padding: "1px 6px", 
                              borderRadius: "3px",
                              whiteSpace: "nowrap",
                              fontWeight: 700
                            }}>
                              {i.quantity} {i.unit}
                            </span>
                          </div>
                        ))}
                        {item.items.length > 2 && (
                          <div 
                            style={{ 
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.725rem", 
                              color: "var(--accent-primary)", 
                              fontWeight: "600", 
                              cursor: "help",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "color-mix(in srgb, var(--accent-primary) 8%, transparent)",
                              border: "1px dashed color-mix(in srgb, var(--accent-primary) 30%, transparent)",
                              width: "fit-content",
                              marginTop: "2px"
                            }}
                            title={`Danh sách vật tư còn lại:\n` + item.items.slice(2).map((it, idx) => `${idx + 3}. ${it.name} (${it.quantity} ${it.unit})`).join("\n")}
                          >
                            + {item.items.length - 2} {t("others")}...
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-secondary)" }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.destination}
                    </div>
                  </td>
                  <td style={{ position: "relative" }}>
                    {(() => {
                      // Compute current level info for status=1
                      const flows: any[] = item.flowSnapshot || requestFlows[item.id] || [];
                      const currentLvl = item.currentLvlCode;
                      const currentIdx = flows.length > 0
                        ? (currentLvl ? flows.findIndex((f: any) => f.lvl_code === currentLvl) : 0)
                        : -1;
                      const currentFlow = currentIdx >= 0 ? flows[currentIdx] : null;

                      // Short label mapping for common level codes
                      const lvlShortName: Record<string, string> = {
                        dept_manager: "Dept",
                        custom_dept_manager: "Dept",
                        mpr_custom_dept: "Dept",
                        division_manager: "Division",
                        custom_division_manager: "Division",
                        ps_manager: "PS",
                        vg_visitor_approval: "PS",
                        sma_lvl2: "SMA",
                        ras_target_manager: "RAS",
                      };

                      // Build dynamic badge label for pending requests: "Waiting Dept", "Waiting PS", ...
                      const shortName = currentFlow
                        ? (lvlShortName[currentFlow.lvl_code] || (currentFlow.lvl_name?.en?.split(" ")[0]) || currentFlow.lvl_code)
                        : null;
                      const pendingBadge = item.status === 1 && shortName
                        ? `Waiting ${shortName}`
                        : null;

                      return (
                        <div
                          style={{ display: "inline-block", position: "relative" }}
                          onMouseEnter={(e) => {
                            if (item.status === 1 || (item.status === 3 && item.rejectReason)) {
                              handleStatusMouseEnter(item, e);
                            }
                          }}
                          onMouseLeave={handleStatusMouseLeave}
                        >
                          {/* Badge */}
                          {item.status === 1 && pendingBadge ? (
                            <span className={`${styles.badge} ${styles.badgePending}`}>
                              <span className={styles.pulseDot} />
                              {pendingBadge}
                            </span>
                          ) : (
                            getStatusBadge(item.status)
                          )}

                          {/* Tooltip — only shown on hover for pending status */}
                          {item.status === 1 && hoveredRequestId === item.id && tooltipPos && (() => {
                            const hoverFlows: any[] = requestFlows[item.id] || flows;
                            const hIdx = hoverFlows.length > 0
                              ? (currentLvl ? hoverFlows.findIndex((f: any) => f.lvl_code === currentLvl) : 0)
                              : -1;
                            const hFlow = hIdx >= 0 ? hoverFlows[hIdx] : null;
                            if (!hFlow && !hoveredFlowLoading) return null;

                            const managers = hFlow?.managers || [];
                            const managerNames = managers.map((m: any) => m.full_name || m.name).join(", ");
                            const deputies = managers.flatMap((m: any) => m.deputies || []);
                            const deputyNames = deputies.map((d: any) => d.full_name || d.name).join(", ");
                            const stepTitle = hFlow?.lvl_name?.[language] || hFlow?.lvl_name?.en || hFlow?.lvl_code || "";

                            return (
                              <div style={{
                                position: "fixed",
                                top: `${tooltipPos.y - 10}px`,
                                left: `${tooltipPos.x}px`,
                                transform: "translate(-50%, -100%)",
                                background: "var(--bg-secondary)",
                                border: "1px solid rgba(245,158,11,0.3)",
                                borderRadius: "8px",
                                padding: "10px 14px",
                                boxShadow: "0 12px 30px -5px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.1)",
                                zIndex: 9999,
                                width: "max-content",
                                minWidth: "200px",
                                maxWidth: "300px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                fontSize: "12px",
                              }}>
                                {hoveredFlowLoading ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                                    <ArrowCounterClockwise size={12} className={styles.spin} />
                                    <span>{t("flow_loading")}</span>
                                  </div>
                                ) : (
                                  <>
                                    {/* Level label */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f59e0b", display: "inline-block", flexShrink: 0, boxShadow: "0 0 6px rgba(245,158,11,0.6)" }} />
                                      <span style={{ fontSize: "9px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                        {stepTitle}
                                      </span>
                                    </div>
                                    {/* Approver name */}
                                    <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "13px", paddingLeft: "13px" }}>
                                      {managerNames || "—"}
                                    </div>
                                    {/* Deputy */}
                                    {deputyNames && (
                                      <div style={{ color: "var(--accent-primary)", fontSize: "11px", paddingLeft: "13px", opacity: 0.9 }}>
                                        {t("deputy_assigned")}: {deputyNames}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })()}

                          {/* Tooltip — shown on hover for rejected status with reason */}
                          {item.status === 3 && hoveredRequestId === item.id && tooltipPos && item.rejectReason && (
                            <div style={{
                              position: "fixed",
                              top: `${tooltipPos.y - 10}px`,
                              left: `${tooltipPos.x}px`,
                              transform: "translate(-50%, -100%)",
                              background: "var(--bg-secondary)",
                              border: "1px solid rgba(239,68,68,0.4)",
                              borderRadius: "8px",
                              padding: "10px 14px",
                              boxShadow: "0 12px 30px -5px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.15)",
                              zIndex: 9999,
                              width: "max-content",
                              minWidth: "200px",
                              maxWidth: "300px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                              fontSize: "12px",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0, boxShadow: "0 0 6px rgba(239,68,68,0.6)" }} />
                                <span style={{ fontSize: "9px", fontWeight: "700", color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                  {t("rejection_reason")}
                                </span>
                              </div>
                              <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "13px", paddingLeft: "13px", whiteSpace: "pre-wrap" }}>
                                {item.rejectReason}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className={styles.btnOutline}
                      style={{ padding: "0.25rem 0.5rem", borderRadius: "2px", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", background: "var(--bg-primary)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHistoryModal(item);
                      }}
                      title={t("view_history")}
                    >
                      <ListBullets size={16} weight="bold" />
                    </button>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <ActionDropdown 
                        item={item}
                        canApprove={!!(user && isUserApprover(item, user))}
                        onApprove={handleDirectApprove}
                        onReject={handleDirectReject}
                        onDetail={handleViewDetails}
                        onRenew={handleRenewRequest}
                        onPrint={handlePrint}
                        t={t}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <div className={styles.emptyState}>
                      <ClipboardText size={48} weight="light" color="var(--text-secondary)" />
                      <div className={styles.emptyTitle}>{t("no_requests_found")}</div>
                      <div className={styles.emptyText}>{t("no_requests_found_desc")}</div>
                    </div>
                  </td>
                </tr>
              )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "0 1rem", marginBottom: "1.5rem" }}>
        <button 
          className={styles.btnOutline} 
          onClick={handleExportCSV} 
          title={t("export_csv")} 
          style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
        >
          <FileCsv size={14} weight="bold" />
          <span>{t("export_csv")}</span>
        </button>

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginRight: "0.5rem" }}>
              {t("page") || "Trang"} {currentPage} / {totalPages}
            </span>
            <button
              className={styles.btnOutline}
              style={{ padding: "0.25rem 0.5rem", minWidth: "32px" }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              &lt;
            </button>
            <button
              className={styles.btnOutline}
              style={{ padding: "0.25rem 0.5rem", minWidth: "32px" }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* ── CREATE REQUEST SLIDE-OUT DRAWER ──────────────── */}
      <CreateRequestDrawer
        show={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        nextRequestCode={nextRequestCode}
        flowLoading={flowLoading}
        flowData={flowData}
        language={language}
        t={t}
        user={user}
        destinationsList={allDestinations}
        destination={destination}
        setDestination={setDestination}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        carrierEmpno={carrierEmpno}
        setCarrierEmpno={setCarrierEmpno}
        carrierName={carrierName}
        setCarrierName={setCarrierName}
        note={formReason}
        setNote={setFormReason}
        itemsList={itemsList}
        handleItemFieldChange={handleItemFieldChange}
        removeItemRow={removeItemRow}
        addNewItemRow={addNewItemRow}
        handleSubmitRequest={handleSubmitRequest}
        actionLoading={actionLoading}
      />

      {/* ── DETAIL & APPROVAL DRAWER ──────────────── */}
      <DetailRequestDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onRenew={handleRenewRequest}
        t={t}
        language={language}
      />

      {/* ── History Modal ── */}
      <HistoryModal
        request={showHistoryModal}
        onClose={() => setShowHistoryModal(null)}
        t={t}
        language={language}
      />

      {/* ── Custom Reject Modal ── */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        rejectReasonInput={rejectReasonInput}
        setRejectReasonInput={setRejectReasonInput}
        submitReject={submitReject}
        actionLoading={actionLoading}
        t={t}
      />

      <ConfirmModal
        modal={confirmModal}
        setModal={setConfirmModal}
        t={t}
      />

      {/* ── Print Template ── */}
      <PrintTemplate request={printRequest} id="print-section" />
    </main>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <RequestsPageContent />
    </Suspense>
  );
}
