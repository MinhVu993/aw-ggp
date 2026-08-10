"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from '../layout/Header.module.css';
import { Bell, Check, Info, WarningCircle, XCircle, CheckCircle } from '@phosphor-icons/react';
import { apiFetch } from '@/lib/apiFetch';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

export default function NotificationDropdown() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifiedIdsRef = useRef<Set<string>>(new Set());
    const isFirstLoadRef = useRef(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchNotifications = async () => {
        if (!user?.id) return;
        try {
            const res = await apiFetch(`/api/notifications?userId=${user.id}`);
            const data = typeof res?.json === 'function' ? await res.json() : res;
            if (data.success) {
                const newNotifs = data.notifications;
                
                // Show toast for new unread notifications that we haven't seen yet
                if (!isFirstLoadRef.current) {
                    newNotifs.forEach((n: any) => {
                        if (!n.is_read && !notifiedIdsRef.current.has(n.id)) {
                            // Cảnh báo người lạ hoặc từ chối
                            if (n.type === 'error' || n.type === 'alert') {
                                toast.error(n.title, { description: n.content, duration: 5000 });
                            } else if (n.type === 'warning') {
                                toast.warning(n.title, { description: n.content, duration: 5000 });
                            } else {
                                toast.info(n.title, { description: n.content, duration: 5000 });
                            }
                            notifiedIdsRef.current.add(n.id);
                        }
                    });
                } else {
                    // Lần đầu tải trang -> lưu lại các ID đã có để không spam toast cũ
                    newNotifs.forEach((n: any) => notifiedIdsRef.current.add(n.id));
                    isFirstLoadRef.current = false;
                }

                setNotifications(newNotifs);
                setUnreadCount(newNotifs.filter((n: any) => !n.is_read).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Giảm xuống 5 giây để kiểm tra alert real-time hơn cho hệ thống an ninh
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [user?.id]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id: string | 'all') => {
        try {
            const res = await apiFetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id, userId: user?.id })
            });
            const data = typeof res?.json === 'function' ? await res.json() : res;
            if (data.success) {
                if (id === 'all') {
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                    setUnreadCount(0);
                } else {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleNotificationClick = (n: any) => {
        if (!n.is_read) {
            markAsRead(n.id);
        }
        setIsOpen(false);
        if (n.type === 'APPROVAL_REQUEST' && n.reference_id) {
            router.push(`/?id=${n.reference_id}`);
        } else {
            router.push('/');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} weight="fill" color="#10b981" />;
            case 'warning': return <WarningCircle size={18} weight="fill" color="#f59e0b" />;
            case 'error': return <XCircle size={18} weight="fill" color="#ef4444" />;
            default: return <Info size={18} weight="fill" color="#3b82f6" />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            day: '2-digit', 
            month: '2-digit' 
        });
    };

    return (
        <div className={styles.notificationWrapper} ref={dropdownRef}>
            <button 
                className={styles.actionBtn} 
                onClick={() => setIsOpen(!isOpen)}
                title={isMounted ? t("notifications") : "Thông báo"}
                suppressHydrationWarning
            >
                <span className={styles.icon}><Bell size={20} weight={isMounted && isOpen ? "fill" : "regular"} /></span>
                {isMounted && unreadCount > 0 && <span className={styles.badgeCount}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownTitle}>{t("notifications")}</span>
                        {unreadCount > 0 && (
                            <button className={styles.markAllBtn} onClick={() => markAsRead('all')}>
                                <Check size={14} weight="bold" /> {t("mark_all_read") || "Đã xem hết"}
                            </button>
                        )}
                    </div>
                    
                    <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyState}>
                                {t("no_notifications") || "Không có thông báo mới"}
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`${styles.notificationItem} ${!n.is_read ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.notifIcon}>{getIcon(n.type)}</div>
                                    <div className={styles.notifContent}>
                                        <div className={styles.notifTitle}>{n.title}</div>
                                        <div className={styles.notifText}>{n.content}</div>
                                        <div className={styles.notifTime}>{formatTime(n.created_at)}</div>
                                    </div>
                                    {!n.is_read && <div className={styles.unreadDot} />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
