"use client";

import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useAuth } from "@/context/AuthContext";
import { useTranslation, Language } from "@/context/LanguageContext";
import { MagnifyingGlass, XCircle } from "@phosphor-icons/react";

export default function Header() {
    const { user } = useAuth();
    const { language, setLanguage, t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [inputValue, setInputValue] = useState("");
    // Prevent hydration mismatch: any content that differs between server and client
    // must wait until after mount before rendering
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync input with URL search param
    useEffect(() => {
        const query = searchParams.get("search") || "";
        setInputValue(query);
    }, [searchParams]);

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    // Debounce URL updates
    useEffect(() => {
        if (!isMounted) return;
        const handler = setTimeout(() => {
            if (pathname === "/user-config" || pathname === "/device-manager") {
                const params = new URLSearchParams(searchParams);
                if (inputValue) params.set("search", inputValue);
                else params.delete("search");
                
                if (searchParams.get("search") !== (inputValue || null)) {
                    router.replace(`${pathname}?${params.toString()}`);
                }
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [inputValue, pathname, router, searchParams, isMounted]);

    const languages: { code: Language; label: string }[] = [
        { code: "vi", label: "VI" },
        { code: "en", label: "EN" },
        { code: "zh", label: "ZH" },
    ];

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleClear = () => {
        setInputValue("");
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            if (pathname === "/") {
                const query = inputValue.trim().toLowerCase();
                const isDeviceQuery = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(query) ||
                                     query.includes("device") ||
                                     query.includes("cam") ||
                                     query.includes("gate");
                if (isDeviceQuery && user?.role === "admin") {
                    router.push(`/device-manager?search=${encodeURIComponent(query)}`);
                } else if (user?.role === "admin" || user?.role === "review") {
                    router.push(`/user-config?search=${encodeURIComponent(query)}`);
                }
            }
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.searchContainer}>
                <span className={styles.searchIcon}><MagnifyingGlass size={18} weight="bold" /></span>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={t("search_placeholder")}
                    className={styles.searchInput}
                    value={inputValue}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    suppressHydrationWarning
                />
                {!inputValue && isMounted && (
                    <span className={styles.shortcutHint}>Ctrl K</span>
                )}
                {inputValue && (
                    <button 
                        type="button"
                        className={styles.clearBtn} 
                        onMouseDown={(e) => {
                            e.preventDefault(); // Ngăn ô input lấy focus từ mousedown
                            handleClear();
                        }} 
                        title={t("clear")}
                    >
                        <XCircle size={18} weight="fill" />
                    </button>
                )}
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
