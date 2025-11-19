"use client";

import { useState } from 'react';
import { PaintBrushIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function AppearanceSettings() {
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
    const { addToast } = useToast();

    const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme);
        // TODO: Implement theme switching
        addToast({
            type: 'success',
            title: 'Theme Updated',
            message: `Theme changed to ${newTheme}`
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Appearance</h2>
                <p className="text-muted-foreground mt-1">
                    Customize the look and feel of Smart Todo
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PaintBrushIcon className="h-5 w-5" />
                        Theme
                    </CardTitle>
                    <CardDescription>
                        Choose your preferred color theme
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => handleThemeChange("light")}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-all text-left",
                                theme === "light"
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <SunIcon className="h-6 w-6 mb-2" />
                            <p className="font-semibold">Light</p>
                            <p className="text-sm text-muted-foreground">Light theme</p>
                        </button>

                        <button
                            onClick={() => handleThemeChange("dark")}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-all text-left",
                                theme === "dark"
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <MoonIcon className="h-6 w-6 mb-2" />
                            <p className="font-semibold">Dark</p>
                            <p className="text-sm text-muted-foreground">Dark theme</p>
                        </button>

                        <button
                            onClick={() => handleThemeChange("system")}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-all text-left",
                                theme === "system"
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <ComputerDesktopIcon className="h-6 w-6 mb-2" />
                            <p className="font-semibold">System</p>
                            <p className="text-sm text-muted-foreground">Follow system</p>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

