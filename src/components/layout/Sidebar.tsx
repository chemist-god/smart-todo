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
    XMarkIcon,
    MagnifyingGlassIcon,
    BellIcon,
    QuestionMarkCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Todos", href: "/todos", icon: CheckCircleIcon, badge: "3/5" },
    { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
    { name: "Notes", href: "/notes", icon: DocumentTextIcon, badge: "New" },
    { name: "Timer", href: "/timer-demo", icon: ClockIcon },
    { name: "Stakes", href: "/stakes", icon: CurrencyDollarIcon, badge: "17" },
    { name: "Goals", href: "/goals", icon: FlagIcon, badge: "164" },
    { name: "Calendar", href: "/calendar", icon: CalendarIcon },
    { name: "Achievements", href: "/achievements", icon: TrophyIcon },
];

const bottomNavigation = [
    { name: "Help Center", href: "/help", icon: QuestionMarkCircleIcon },
    { name: "Notifications", href: "/notifications", icon: BellIcon, badge: "3" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { data: stats } = useSWR<{ level: number; totalPoints: number }>(session?.user ? "/api/stats" : null, fetcher, { refreshInterval: 30000 });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Handle keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('sidebar-search')?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const sidebarWidth = isCollapsed ? 'w-16' : 'w-72';
    const mobileSidebarWidth = isMobileCollapsed ? 'w-16' : 'w-72';

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    variant="outline"
                    size="sm"
                    className="bg-card/80 backdrop-blur-sm border-border/50"
                >
                    {isMobileOpen ? (
                        <XMarkIcon className="w-4 h-4" />
                    ) : (
                        <Bars3Icon className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out",
                "flex flex-col bg-card/50 backdrop-blur-sm border-r border-border/50 shadow-xl lg:shadow-lg",
                // Mobile behavior
                "lg:transform-none lg:transition-all",
                isMobileOpen ? `translate-x-0 ${mobileSidebarWidth}` : '-translate-x-full lg:translate-x-0',
                // Desktop behavior
                `lg:${sidebarWidth}`
            )}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <Image
                                src="/logo.svg"
                                alt="Smart Todo"
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                        </div>
                        {(!isCollapsed && !isMobileCollapsed) && (
                            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                Smart Todo
                            </h1>
                        )}
                    </div>
                    
                    {/* Desktop collapse toggle */}
                    <div className="hidden lg:flex items-center gap-2">
                        <Button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted/50"
                        >
                            {isCollapsed ? (
                                <ChevronRightIcon className="w-4 h-4" />
                            ) : (
                                <ChevronLeftIcon className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    {/* Mobile controls */}
                    <div className="lg:hidden flex items-center gap-2">
                        <Button
                            onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted/50"
                        >
                            {isMobileCollapsed ? (
                                <ChevronRightIcon className="w-4 h-4" />
                            ) : (
                                <ChevronLeftIcon className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            onClick={() => setIsMobileOpen(false)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Search */}
                {(!isCollapsed && !isMobileCollapsed) && (
                    <div className="p-4 border-b border-border/50">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="sidebar-search"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-12 h-9 bg-muted/30 border-border/50 focus:bg-background"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                                    ⌘F
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                    "hover:bg-muted/50 hover:scale-[1.02]",
                                    isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-muted-foreground hover:text-foreground',
                                    (isCollapsed || isMobileCollapsed) && 'justify-center px-2'
                                )}
                                title={(isCollapsed || isMobileCollapsed) ? item.name : undefined}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {(!isCollapsed && !isMobileCollapsed) && (
                                    <>
                                        <span className="truncate">{item.name}</span>
                                        {item.badge && (
                                            <Badge 
                                                variant={item.badge === "New" ? "default" : "secondary"}
                                                className={cn(
                                                    "ml-auto text-xs h-5 px-1.5",
                                                    item.badge === "New" && "bg-primary text-primary-foreground",
                                                    item.badge !== "New" && "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Navigation */}
                <div className="px-3 py-4 border-t border-border/50 space-y-1">
                    {bottomNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                    "hover:bg-muted/50 hover:scale-[1.02]",
                                    isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-muted-foreground hover:text-foreground',
                                    (isCollapsed || isMobileCollapsed) && 'justify-center px-2'
                                )}
                                title={(isCollapsed || isMobileCollapsed) ? item.name : undefined}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {(!isCollapsed && !isMobileCollapsed) && (
                                    <>
                                        <span className="truncate">{item.name}</span>
                                        {item.badge && (
                                            <Badge 
                                                variant="destructive"
                                                className="ml-auto text-xs h-5 px-1.5 bg-destructive text-destructive-foreground"
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* User Profile - only show when expanded */}
                {(!isCollapsed && !isMobileCollapsed) && session?.user && (
                    <div className="p-4 border-t border-border/50">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                            <div className="flex-shrink-0">
                                {session.user.image ? (
                                    <img
                                        className="h-8 w-8 rounded-full ring-2 ring-primary/20"
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/20">
                                        <UserIcon className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">
                                    {session.user.name || session.user.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Level {stats?.level ?? 1} • {stats?.totalPoints?.toLocaleString() ?? 0} XP
                                </p>
                            </div>
                            <Button
                                onClick={() => signOut()}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Sign out"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
