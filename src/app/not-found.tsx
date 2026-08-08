"use client";

import Link from "next/link";

export default function NotFound() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            minHeight: "400px",
            textAlign: "center",
            color: "var(--text-primary)"
        }}>
            <h1 style={{
                fontSize: "4rem",
                fontWeight: 800,
                marginBottom: "1rem",
                background: "var(--accent-gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
            }}>
                404
            </h1>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem", color: "var(--text-secondary)" }}>
                Page Not Found
            </h2>
            <p style={{ marginBottom: "2rem", color: "var(--text-secondary)", maxWidth: "400px" }}>
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                href="/"
                style={{
                    display: "inline-flex",
                    padding: "0.75rem 1.5rem",
                    background: "var(--accent-gradient)",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: 600,
                    boxShadow: "var(--shadow-accent)",
                    transition: "transform 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
                Return Home
            </Link>
        </div>
    );
}
