"use client";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

interface AuthCompProps {
    app?: string;
    apiUrl?: string;
    navigatePortal?: boolean;
}

const AuthComp = ({
    app = 'fac',
    apiUrl = process.env.NEXT_PUBLIC_PORTAL_API_URL || '',
    navigatePortal = true
}: AuthCompProps) => {
    const { login, user } = useAuth();
    const router = useRouter();
    const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const toPortal = () => {
        if (isDev || !navigatePortal) {
            console.warn("AuthComp: Would redirect to Portal in production.");
            return;
        }

        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || window.location.origin;
        if (window.location.search !== "") {
            window.location.href = `${portalUrl}/?target=${btoa(window.location.href)}`;
        } else {
            window.location.href = portalUrl;
        }
    };

    const setUserData = async (userData: any, shouldRedirect = true) => {
        const authArr = ['admin', 'review'];

        let role: string | null = null;
        try {
            const appRoles = typeof userData.app_roles === 'string'
                ? JSON.parse(userData.app_roles)
                : userData.app_roles;

            if (Array.isArray(appRoles)) {
                const roleItem = appRoles.find((item: any) => item.app === app);
                role = roleItem ? roleItem.role : null;
            }
        } catch (e) {
            console.error("Error parsing app_roles", e);
        }

        // --- Bổ sung: Gọi API gmo021 IFM Tracking ---
        let queryParams = new URLSearchParams({ location: 'vg' });
        let hasQueryParam = false;
        
        if (userData.group_empno) {
            queryParams.append('group_empno', userData.group_empno);
            hasQueryParam = true;
        } else if (userData.syno_username || userData.syno_user) {
            queryParams.append('ad', userData.syno_username || userData.syno_user);
            hasQueryParam = true;
        } else if (userData.empno) {
            queryParams.append('empno', userData.empno);
            hasQueryParam = true;
        }

        let enhancedDept = userData.dept || "";
        let enhancedHighDept = userData.high_dept || userData.hight_dept || "";
        let enhancedName = userData.name || "";
        let enhancedEmail = userData.email || "";
        let enhancedGroupEmpno = userData.group_empno;
        let enhancedSynoUser = userData.syno_username || userData.syno_user;
        let enhancedEmpno = userData.empno;
        
        if (hasQueryParam && (queryParams.has('group_empno') || queryParams.has('ad'))) {
            try {
                const res = await fetch(`http://gmo021.cansportsvg.com:10003/api/ifm-tracking/managers/query?${queryParams.toString()}`);
                const data = await res.json();
                if (data && data.ok && data.manager) {
                    const manager = data.manager;
                    enhancedDept = manager.user_dept_names || enhancedDept;
                    enhancedHighDept = manager.user_division_names || enhancedHighDept;
                    enhancedName = manager.full_name || enhancedName;
                    enhancedGroupEmpno = manager.group_empno || enhancedGroupEmpno;
                    enhancedEmpno = manager.empno || enhancedEmpno;
                    enhancedSynoUser = manager.syno_username || enhancedSynoUser;
                    enhancedEmail = manager.email || enhancedEmail;
                }
            } catch (err) {
                console.error("Error fetching IFM Manager API:", err);
            }
        }

        // --- Bổ sung: Đồng bộ ID cục bộ từ FAC DB ---
        let localId = userData.id;
        try {
            const syncRes = await apiFetch('/api/auth/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    empno: enhancedEmpno,
                    name: enhancedName,
                    dept: enhancedDept,
                    email: enhancedEmail
                }),
            });
            const syncData = await syncRes.json();
            if (syncData.success) {
                localId = String(syncData.localId);
            }
        } catch (err) {
            console.error("AuthComp: Local sync failed", err);
        }

        const sessionUser: User = {
            id: localId,
            portalId: userData.id,
            empno: enhancedEmpno,
            name: enhancedName,
            username: userData.username || enhancedSynoUser,
            dept: enhancedDept,
            unit_name: enhancedName,
            high_dept: enhancedHighDept,
            location: userData.location || "vg",
            email: enhancedEmail,
            role: role,
            group_empno: enhancedGroupEmpno,
        };

        login(sessionUser);

        if (shouldRedirect) {
            router.push('/');
        }
    };

    useEffect(() => {
        if (user) return;

        const getUserDataBySession = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const tokenFromUrl = urlParams.get('sessionToken');
                let isInitialLogin = false;

                if (tokenFromUrl) {
                    localStorage.setItem("session-token", tokenFromUrl);
                    isInitialLogin = true;
                    // Clear the token from URL to keep it clean
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                }

                const sessionToken = localStorage.getItem("session-token");

                if (!sessionToken) {
                    console.log("AuthComp: No session token found.");
                    toPortal();
                    return;
                }

                const response = await fetch(`${apiUrl}/global-user/getUserDataBySession`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        session_token: sessionToken,
                        app: app,
                    }),
                });

                const responseData = await response.json();

                if (responseData.status === "success") {
                    const userData = responseData.data;

                    // --- Kiểm tra quyền truy cập App (app_id = 70) ---
                    try {
                        const checkRes = await fetch(`${apiUrl}/global-user/checkAppAccess`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ empno: userData.empno, app_id: 70 })
                        });
                        const checkData = await checkRes.json();

                        if (checkData.status) {
                            if (checkData.data.length === 0) {
                                alert(`Access Denied\n拒绝访问\nBạn không có quyền truy cập ứng dụng này`);
                                window.location.href = process.env.NEXT_PUBLIC_PORTAL_URL || window.location.origin;
                                return;
                            }
                            // Nếu muốn lưu danh sách company vào userData thì có thể gán tại đây
                            // userData.userCompanies = checkData.data.map((item: any) => item.company.code);
                        }
                    } catch (checkErr) {
                        console.error("AuthComp: Error checking app access", checkErr);
                    }
                    // ------------------------------------------------

                    await setUserData(userData, isInitialLogin);
                } else {
                    console.log("AuthComp: API returned non-success status.");
                    toPortal();
                }
            } catch (err) {
                console.error("AuthComp: Error fetching user data", err);
                toPortal();
            }
        };

        getUserDataBySession();
    }, [user, login, router, app, apiUrl]);

    return null;
};
export default AuthComp;
