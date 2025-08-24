"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
    HomeIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    UserIcon,
    TrophyIcon,
    ArrowRightOnRectangleIcon,
    CalendarIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Todos", href: "/todos", icon: CheckCircleIcon },
    { name: "Notes", href: "/notes", icon: DocumentTextIcon },
    { name: "Calendar", href: "/calendar", icon: CalendarIcon },
    { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
    { name: "Achievements", href: "/achievements", icon: TrophyIcon },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [userStats, setUserStats] = useState({ level: 1, totalPoints: 0 });

    useEffect(() => {
        if (session?.user) {
            fetchUserStats();
        }
    }, [session]);

    const fetchUserStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setUserStats({ level: data.level, totalPoints: data.totalPoints });
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }
    };

    return (
        <div className="flex h-full w-64 flex-col bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-gray-200">
            <div className="flex h-16 items-center justify-center border-b border-gray-200 bg-white">
                <h1 className="text-xl font-bold text-gray-900">Smart Todo</h1>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-100 text-blue-700 shadow-sm"
                                : "text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                                }`}
                        >
                            <item.icon
                                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                                    }`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {session?.user && (
                <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {session.user.image ? (
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {session.user.name || session.user.email}
                            </p>
                            <p className="text-xs text-gray-500">Level {userStats.level} • {userStats.totalPoints} XP</p>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Sign out"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
