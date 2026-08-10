"use client";

import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";
import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useAuth } from "@/context/AuthContext";
import { useTranslation, Language } from "@/context/LanguageContext";

export default function Header() {
    const { user } = useAuth();
    const { language, setLanguage, t } = useTranslation();

    // Prevent hydration mismatch: any content that differs between server and client
    // must wait until after mount before rendering
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const languages: { code: Language; label: string }[] = [
        { code: "vi", label: "VI" },
        { code: "en", label: "EN" },
        { code: "zh", label: "ZH" },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <span className={styles.logoIcon}>
                    <img src="/logo.png" alt="FAC Logo" className={styles.logoImg} />
                </span>
                <span className={styles.logoText}>{t("fac_facial_access_control")}</span>
            </div>
            <div className={styles.actions}>
                <div className={styles.languageToggle}>
                    {languages.map((lang) => {
                        // Before mount: VI is always active (matches server); after mount: use real language
                        const isActive = isMounted ? language === lang.code : lang.code === "vi";
                        return (
                            <button
                                key={lang.code}
                                className={`${styles.langBtn} ${isActive ? styles.langActive : ""}`}
                                onClick={() => setLanguage(lang.code)}
                                suppressHydrationWarning
                            >
                                {lang.label}
                            </button>
                        );
                    })}
                </div>

                <ThemeToggle />
                <NotificationDropdown />
                {/* Only render user info after mount to avoid server/client mismatch */}
                {isMounted && user && (
                    <span className={styles.userLabel}>
                        {user.name} — {user.dept}
                    </span>
                )}
            </div>
        </header>
    );
}
