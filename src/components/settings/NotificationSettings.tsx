"use client";

import { useState } from "react";
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";

export default function NotificationSettings() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        todoReminders: true,
        stakeUpdates: true,
        achievementAlerts: true,
        weeklyDigest: true,
        marketingEmails: false
    });
    const { addToast } = useToast();

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        // TODO: Implement API endpoint to save notification preferences
        addToast({
            type: 'success',
            title: 'Saved!',
            message: 'Notification preferences updated'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Notification Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Control how and when you receive notifications
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BellIcon className="h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>
                        Choose which notifications you want to receive
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notifications">Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications via email
                                </p>
                            </div>
                            <Switch
                                id="email-notifications"
                                checked={settings.emailNotifications}
                                onCheckedChange={() => handleToggle('emailNotifications')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="push-notifications">Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive browser push notifications
                                </p>
                            </div>
                            <Switch
                                id="push-notifications"
                                checked={settings.pushNotifications}
                                onCheckedChange={() => handleToggle('pushNotifications')}
                            />
                        </div>

                        <div className="border-t border-border/50 pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="todo-reminders">Todo Reminders</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get reminded about upcoming todos
                                    </p>
                                </div>
                                <Switch
                                    id="todo-reminders"
                                    checked={settings.todoReminders}
                                    onCheckedChange={() => handleToggle('todoReminders')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="stake-updates">Stake Updates</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Notifications about your stakes
                                    </p>
                                </div>
                                <Switch
                                    id="stake-updates"
                                    checked={settings.stakeUpdates}
                                    onCheckedChange={() => handleToggle('stakeUpdates')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Celebrate when you unlock achievements
                                    </p>
                                </div>
                                <Switch
                                    id="achievement-alerts"
                                    checked={settings.achievementAlerts}
                                    onCheckedChange={() => handleToggle('achievementAlerts')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="weekly-digest">Weekly Digest</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive a weekly summary of your activity
                                    </p>
                                </div>
                                <Switch
                                    id="weekly-digest"
                                    checked={settings.weeklyDigest}
                                    onCheckedChange={() => handleToggle('weeklyDigest')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive updates about new features and tips
                                    </p>
                                </div>
                                <Switch
                                    id="marketing-emails"
                                    checked={settings.marketingEmails}
                                    onCheckedChange={() => handleToggle('marketingEmails')}
                                />
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleSave} className="w-full sm:w-auto">
                        Save Preferences
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

