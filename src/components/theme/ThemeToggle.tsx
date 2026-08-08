"use client";

import { useTheme } from "next-themes";
import styles from "@/components/layout/Header.module.css";
import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className={styles.actionBtn} aria-label="Toggle Theme placeholder">
                <span className={styles.icon}>...</span>
            </button>
        );
    }

    const toggleTheme = () => {
        if (theme === "system") {
            setTheme(resolvedTheme === "light" ? "dark" : "light");
        } else {
            setTheme(theme === "light" ? "dark" : "light");
        }
    };

    return (
        <button
            className={styles.actionBtn}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={`Current theme: ${theme === "system" ? `System (${resolvedTheme})` : theme}`}
        >
            <span className={styles.icon}>
                {resolvedTheme === "dark" ? <Moon size={18} weight="fill" /> : <Sun size={18} weight="bold" />}
            </span>
        </button>
    );
}
