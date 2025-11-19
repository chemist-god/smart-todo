"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    Cog6ToothIcon,
    UserPlusIcon,
    BellIcon,
    ShieldCheckIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    CreditCardIcon,
    TrashIcon,
    SparklesIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import GeneralSettings from "@/components/settings/GeneralSettings";
import InviteFriendsSettings from "@/components/settings/InviteFriendsSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import AccountSettings from "@/components/settings/AccountSettings";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        {
            id: "general",
            label: "General",
            icon: Cog6ToothIcon,
            component: GeneralSettings
        },
        {
            id: "invite",
            label: "Invite Friends",
            icon: UserPlusIcon,
            component: InviteFriendsSettings,
            badge: "New"
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: BellIcon,
            component: NotificationSettings
        },
        {
            id: "security",
            label: "Security",
            icon: ShieldCheckIcon,
            component: SecuritySettings
        },
        {
            id: "appearance",
            label: "Appearance",
            icon: PaintBrushIcon,
            component: AppearanceSettings
        },
        {
            id: "account",
            label: "Account",
            icon: TrashIcon,
            component: AccountSettings
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
            <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                            <Cog6ToothIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Settings
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Manage your account settings and preferences
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Tabs */}
                <Card className="border-border/50 shadow-soft bg-card/50 backdrop-blur-sm">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b border-border/50 px-6 pt-6">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-muted/30 p-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                                                "transition-all duration-200 hover:bg-muted/50"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="hidden sm:inline text-xs sm:text-sm font-medium">
                                                {tab.label}
                                            </span>
                                            {tab.badge && (
                                                <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </div>

                        {tabs.map((tab) => {
                            const Component = tab.component;
                            return (
                                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                                    <div className="p-6">
                                        <Component />
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}

