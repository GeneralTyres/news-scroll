"use client";

import Link from "next/link";

export function Navbar() {

    return (
        <header className="w-full border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                    <div className="h-6 w-6 rounded bg-linear-to-br from-blue-500 to-red-500" />
                    News Scroll
                </Link>
            </div>
        </header>
    );
}