"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./Sidebar.module.css";
import { useTranslation } from "@/context/LanguageContext";
import { ChartBar, Gear, User, FileText, ClipboardText, Clock } from "@phosphor-icons/react";

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    const NAV_ITEMS = [
        { label: t("access_request"), href: "/requests", icon: <ClipboardText weight="fill" size={24} />, roles: ["admin", "review", "user"] },
    ];

    // Important: filtered list must also match server (empty if not mounted)
    const filteredNavItems = mounted && user && user.role
        ? NAV_ITEMS.filter(item => item.roles.includes(user.role as string))
        : [];

    return (
        <aside
            className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
            onMouseEnter={() => setCollapsed(false)}
            onMouseLeave={() => setCollapsed(true)}
        >
            <div className={styles.header}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>
                        <img src="/logo.png" alt="FAC Logo" className={styles.logoImg} />
                    </span>
                    {!collapsed && <span className={styles.logoText}>{t("fac_facial_access_control")}</span>}
                </div>
            </div>

            <nav className={styles.nav}>
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            {!collapsed && <span className={styles.label}>{item.label}</span>}
                            {isActive && !collapsed && <div className={styles.activeIndicator} />}
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
            </div>
        </aside>
    );
}
