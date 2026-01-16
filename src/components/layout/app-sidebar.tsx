"use client"

import * as React from "react"
import {
    CalendarIcon,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Flag,
    Home,
    Trophy,
    BarChart3,
    CircleHelp,
    Bell,
    Settings,
    LogOut,
    User,
    Search,
    Moon,
    Sun,
    Monitor,
    ChevronsUpDown,
    Sparkles,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { useTheme } from "next-themes"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetcher } from "@/lib/fetcher"

// Navigation Data
const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Todos", url: "/todos", icon: CheckCircle2, badge: "3/5" },
    { title: "Notes", url: "/notes", icon: FileText, badge: "New" },
    { title: "Stakes", url: "/stakes", icon: DollarSign, badge: "17" },
    { title: "Goals", url: "/goals", icon: Flag, badge: "164" },
]

const navAnalytics = [
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Calendar", url: "/calendar", icon: CalendarIcon },
    { title: "Achievements", url: "/achievements", icon: Trophy },
    { title: "Timer", url: "/timer-demo", icon: Clock },
]

const navSupport = [
    { title: "Help Center", url: "/help", icon: CircleHelp },
    { title: "Notifications", url: "/notifications", icon: Bell, badge: "3" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { setTheme } = useTheme()
    const { data: stats } = useSWR<{ level: number; totalPoints: number }>(
        session?.user ? "/api/stats" : null,
        fetcher
    )

    const [searchQuery, setSearchQuery] = React.useState("")

    // Filter navigation
    const filterNav = (items: typeof navMain) =>
        items.filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )

    const filteredMain = filterNav(navMain)
    const filteredAnalytics = filterNav(navAnalytics)
    const filteredSupport = filterNav(navSupport)

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Sparkles className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Smart Todo</span>
                                    <span className="truncate text-xs">Productivity System</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="px-2 py-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
                        <SidebarInput
                            placeholder="Search..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {filteredMain.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Platform</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {filteredMain.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {filteredAnalytics.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Insights</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {filteredAnalytics.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {filteredSupport.length > 0 && (
                    <SidebarGroup className="mt-auto">
                        <SidebarGroupLabel>Support</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {filteredSupport.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                        <AvatarFallback className="rounded-lg">
                                            {session?.user?.name?.slice(0, 2)?.toUpperCase() || "CN"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                                        <span className="truncate text-xs">Lvl {stats?.level ?? 1} • {stats?.totalPoints ?? 0} pts</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                            <AvatarFallback className="rounded-lg">
                                                {session?.user?.name?.slice(0, 2)?.toUpperCase() || "CN"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                                            <span className="truncate text-xs">{session?.user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                                            <User className="size-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                                            <Settings className="size-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Monitor className="mr-2 size-4" />
                                            Theme
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                                    <Sun className="mr-2 size-4" />
                                                    Light
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                                    <Moon className="mr-2 size-4" />
                                                    Dark
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                                    <Monitor className="mr-2 size-4" />
                                                    System
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                                    <LogOut className="mr-2 size-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
