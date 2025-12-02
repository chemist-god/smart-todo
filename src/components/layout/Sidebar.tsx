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
    ChevronRightIcon,
    Cog6ToothIcon,
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
    ChevronDownIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

    // Detect OS for keyboard shortcut display
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const keyboardShortcut = isMac ? '⌘F' : 'Ctrl+F';

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

    // Filter navigation based on search query
    const filteredNavigation = navigation.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredBottomNavigation = bottomNavigation.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    aria-label={isMobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMobileOpen}
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
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            aria-expanded={!isCollapsed}
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
                            aria-label={isMobileCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            aria-expanded={!isMobileCollapsed}
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
                            aria-label="Close menu"
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
                                aria-label="Search navigation"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                                    {keyboardShortcut}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
                    {filteredNavigation.length > 0 ? (
                        filteredNavigation.map((item) => {
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
                                    aria-current={isActive ? "page" : undefined}
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
                        })
                    ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                            No results found
                        </div>
                    )}
                </nav>

                {/* Bottom Navigation */}
                <div className="px-3 py-4 border-t border-border/50 space-y-1" aria-label="Secondary navigation">
                    {filteredBottomNavigation.length > 0 ? (
                        filteredBottomNavigation.map((item) => {
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
                        })
                    ) : searchQuery ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                            No results found
                        </div>
                    ) : null}
                </div>

                {/* User Profile Section */}
                <div className={cn("border-t border-border/50 transition-all duration-300", {
                    'p-2': isCollapsed || isMobileCollapsed,
                    'p-4': !isCollapsed && !isMobileCollapsed
                })}>
                    {session?.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200",
                                    "hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20",
                                    isCollapsed || isMobileCollapsed ? 'justify-center' : 'justify-between',
                                )}
                                    aria-label="User menu"
                                    aria-haspopup="true"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            {session.user.image ? (
                                                <Image
                                                    className="h-8 w-8 rounded-full ring-2 ring-primary/20"
                                                    src={session.user.image}
                                                    alt={session.user.name || "User"}
                                                    width={32}
                                                    height={32}
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/20">
                                                    <UserIcon className="h-4 w-4 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {(!isCollapsed && !isMobileCollapsed) && (
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
                                                    {session.user.name || session.user.email?.split('@')[0]}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-8 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.min(100, ((stats?.totalPoints ?? 0) % 100))}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        Lvl {stats?.level ?? 1}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(!isCollapsed && !isMobileCollapsed) && (
                                        <ChevronDownIcon className="w-4 h-4 text-muted-foreground transition-colors duration-200" />
                                    )}
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56 p-2 border-border/50 bg-card/95 backdrop-blur-sm" align="end" sideOffset={10}>
                                <div className="px-2 py-1.5">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <div className="flex-shrink-0">
                                            {session.user.image ? (
                                                <Image
                                                    className="h-10 w-10 rounded-full ring-2 ring-primary/20"
                                                    src={session.user.image}
                                                    alt={session.user.name || "User"}
                                                    width={40}
                                                    height={40}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/20">
                                                    <UserIcon className="h-5 w-5 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {session.user.name || session.user.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <UserCircleIcon className="mr-2 h-4 w-4" />
                                        <span>My Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Cog6ToothIcon className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                    onClick={() => signOut()}
                                >
                                    <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </>
    );
}
