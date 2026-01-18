"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
    Home,
    CheckCircle2,
    FileText,
    DollarSign,
    Flag,
    BarChart3,
    Calendar as CalendarIcon,
    Trophy,
    Clock,
    CircleHelp,
    Bell,
    Settings,
    LogOut,
    Sparkles,
    Search,
    User,
    Monitor,
    Sun,
    Moon,
    ChevronsUpDown,
    Command
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Enhanced Navigation Data with grouping for cleaner code
const navGroups = [
    {
        label: "Platform",
        items: [
            { title: "Dashboard", url: "/dashboard", icon: Home },
            { title: "Todos", url: "/todos", icon: CheckCircle2, badge: "3/5" },
            { title: "Notes", url: "/notes", icon: FileText, badge: "New" },
            { title: "Stakes", url: "/stakes", icon: DollarSign, badge: "17" },
            { title: "Goals", url: "/goals", icon: Flag, badge: "164" },
        ]
    },
    {
        label: "Insights",
        items: [
            { title: "Analytics", url: "/analytics", icon: BarChart3 },
            { title: "Calendar", url: "/calendar", icon: CalendarIcon },
            { title: "Achievements", url: "/achievements", icon: Trophy },
            { title: "Timer", url: "/timer-demo", icon: Clock },
        ]
    },
    {
        label: "Support",
        items: [
            { title: "Help Center", url: "/help", icon: CircleHelp },
            { title: "Notifications", url: "/notifications", icon: Bell, badge: "3" },
        ]
    }
]

interface AppSidebarProps {
    isCollapsed?: boolean
}

export function AppSidebar({ isCollapsed = false }: AppSidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { setTheme } = useTheme()
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="flex h-full w-full flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-all duration-300">
            {/* Header */}
            <div className={cn("p-4 transition-all duration-300", isCollapsed && "px-2 py-4")}>
                <Link href="/dashboard" className={cn("flex items-center gap-2 mb-4", isCollapsed ? "justify-center" : "px-2")}>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Command className="size-4" />
                    </div>
                    {!isCollapsed && (
                        <div className="grid flex-1 text-left text-sm leading-tight animate-in fade-in duration-300">
                            <span className="truncate font-semibold">Smart Todo</span>
                            <span className="truncate text-xs text-muted-foreground">Productivity System</span>
                        </div>
                    )}
                </Link>

                {!isCollapsed ? (
                    <div className="relative px-2 animate-in fade-in duration-300">
                        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border focus-visible:ring-sidebar-ring"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                ) : (
                    <div className="flex justify-center h-9 items-center">
                        <Button variant="ghost" size="icon" className="size-8">
                            <Search className="size-4 text-muted-foreground" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 px-4">
                <TooltipProvider delayDuration={0}>
                    <div className="flex flex-col gap-6 py-2">
                        {navGroups.map((group) => (
                            <div key={group.label} className="flex flex-col gap-1">
                                {!isCollapsed && (
                                    <h4 className="px-2 text-xs font-semibold text-sidebar-foreground/60 tracking-wider uppercase mb-1 animate-in fade-in">
                                        {group.label}
                                    </h4>
                                )}
                                <nav className="grid gap-1">
                                    {group.items.filter(item =>
                                        !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map((item) => {
                                        const isActive = pathname === item.url
                                        const content = (
                                            <Link
                                                href={item.url}
                                                className={cn(
                                                    "group flex items-center rounded-md text-sm font-medium transition-all duration-200 outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ring-sidebar-ring focus-visible:ring-2",
                                                    isCollapsed ? "justify-center size-9 px-0" : "justify-between px-2 py-2",
                                                    isActive
                                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                                        : "text-sidebar-foreground/80"
                                                )}
                                            >
                                                <div className={cn("flex items-center", !isCollapsed && "gap-3")}>
                                                    <item.icon className={cn(
                                                        "size-4 shrink-0 transition-colors",
                                                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                                                    )} />
                                                    {!isCollapsed && <span>{item.title}</span>}
                                                </div>
                                                {!isCollapsed && item.badge && (
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded-md font-semibold border transition-colors",
                                                        isActive
                                                            ? "bg-background text-foreground border-border"
                                                            : "bg-sidebar-accent/50 text-muted-foreground border-transparent"
                                                    )}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        )

                                        if (isCollapsed) {
                                            return (
                                                <Tooltip key={item.title}>
                                                    <TooltipTrigger asChild>
                                                        {content}
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="flex items-center gap-4">
                                                        {item.title}
                                                        {item.badge && (
                                                            <span className="ml-auto text-xs text-muted-foreground">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        }

                                        return <div key={item.title}>{content}</div>
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                </TooltipProvider>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 mt-auto border-t border-sidebar-border">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "w-full h-12 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group",
                            isCollapsed ? "justify-center px-0" : "justify-start px-2"
                        )}>
                            <Avatar className="h-8 w-8 rounded-lg border border-border">
                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    {session?.user?.name?.slice(0, 2)?.toUpperCase() || "CN"}
                                </AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <>
                                    <div className="grid flex-1 text-left text-sm leading-tight ml-2 animate-in fade-in">
                                        <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                                        <span className="truncate text-xs text-muted-foreground">{session?.user?.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-2 size-4 text-muted-foreground group-hover:text-foreground" />
                                </>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60 mb-2 rounded-xl shadow-lg border-border/50" align="end" side="right">
                        <DropdownMenuLabel className="font-normal p-3">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="flex w-full items-center cursor-pointer gap-2">
                                    <User className="size-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="flex w-full items-center cursor-pointer gap-2">
                                    <Settings className="size-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2">
                                <Monitor className="size-4" />
                                <span>Theme</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                                        <Sun className="size-4" />
                                        <span>Light</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                                        <Moon className="size-4" />
                                        <span>Dark</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                                        <Monitor className="size-4" />
                                        <span>System</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600 cursor-pointer gap-2">
                            <LogOut className="size-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
