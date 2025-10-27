"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    HomeIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    UserIcon,
    TrophyIcon,
    ArrowRightOnRectangleIcon,
    CalendarIcon,
    ChartBarIcon,
    FlagIcon,
    CurrencyDollarIcon,
    ClockIcon,
    Bars3Icon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Todos", href: "/todos", icon: CheckCircleIcon },
    { name: "Timer Demo", href: "/timer-demo", icon: ClockIcon },
    { name: "Notes", href: "/notes", icon: DocumentTextIcon },
    { name: "Goals", href: "/goals", icon: FlagIcon },
    { name: "Stakes", href: "/stakes", icon: CurrencyDollarIcon },
    { name: "Calendar", href: "/calendar", icon: CalendarIcon },
    { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
    { name: "Achievements", href: "/achievements", icon: TrophyIcon },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { data: stats } = useSWR<{ level: number; totalPoints: number }>(session?.user ? "/api/stats" : null, fetcher, { refreshInterval: 30000 });
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 rounded-lg bg-card border border-border shadow-medium hover:shadow-strong transition-all duration-200 focus-enhanced"
                >
                    {isMobileOpen ? (
                        <XMarkIcon className="w-5 h-5 text-foreground" />
                    ) : (
                        <Bars3Icon className="w-5 h-5 text-foreground" />
                    )}
                </button>
            </div>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:transform-none lg:transition-none
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col bg-card border-r border-border shadow-strong lg:shadow-none
            `}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                    <h1 className="text-xl font-bold text-foreground">Smart Todo</h1>
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="p-1 rounded-md hover:bg-muted transition-colors focus-enhanced"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus-enhanced
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-medium'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-soft'
                                    }
                                `}
                            >
                                <item.icon className={`
                                    w-5 h-5 flex-shrink-0 transition-all duration-200
                                    ${isActive
                                        ? 'text-primary-foreground'
                                        : 'text-muted-foreground group-hover:text-foreground group-hover:scale-110'
                                    }
                                `} />
                                <span className="truncate">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground/70" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                {session?.user && (
                    <div className="p-4 border-t border-border bg-muted/30">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-soft transition-all duration-200">
                            <div className="flex-shrink-0">
                                {session.user.image ? (
                                    <img
                                        className="h-10 w-10 rounded-full ring-2 ring-primary/20"
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-2 ring-primary/20">
                                        <UserIcon className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {session.user.name || session.user.email}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Level {stats?.level ?? 1} • {stats?.totalPoints?.toLocaleString() ?? 0} XP
                                </p>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 focus-enhanced"
                                title="Sign out"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
