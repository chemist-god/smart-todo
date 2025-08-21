"use client";

import { format } from "date-fns";
import {
    CheckCircleIcon,
    ClockIcon,
    StarIcon,
    FireIcon,
    BookOpenIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";

interface Achievement {
    id: string;
    name: string;
    description: string;
    points: number;
    unlockedAt?: Date;
    progress?: number;
    total?: number;
}

export default function AchievementList() {
    // TODO: Replace with actual data from API
    const achievements: Achievement[] = [
        {
            id: "1",
            name: "First Todo",
            description: "Create your first todo item",
            points: 10,
            progress: 0,
            total: 1
        },
        {
            id: "2",
            name: "Todo Master",
            description: "Complete 10 todos",
            points: 50,
            progress: 0,
            total: 10
        },
        {
            id: "3",
            name: "Note Taker",
            description: "Create your first note",
            points: 15,
            progress: 0,
            total: 1
        },
        {
            id: "4",
            name: "Consistent",
            description: "Complete todos for 7 days in a row",
            points: 100,
            progress: 0,
            total: 7
        },
        {
            id: "5",
            name: "High Priority",
            description: "Complete 5 high priority todos",
            points: 75,
            progress: 0,
            total: 5
        },
    ];

    const getAchievementIcon = (name: string) => {
        if (name.includes("Todo")) return CheckCircleIcon;
        if (name.includes("Note")) return DocumentTextIcon;
        if (name.includes("Consistent")) return FireIcon;
        if (name.includes("Bible")) return BookOpenIcon;
        return StarIcon;
    };

    const getProgressPercentage = (achievement: Achievement) => {
        if (!achievement.progress || !achievement.total) return 0;
        return Math.min((achievement.progress / achievement.total) * 100, 100);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Achievements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                    const IconComponent = getAchievementIcon(achievement.name);
                    const progressPercentage = getProgressPercentage(achievement);
                    const isUnlocked = !!achievement.unlockedAt;
                    const isInProgress = achievement.progress && achievement.progress > 0;

                    return (
                        <div
                            key={achievement.id}
                            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${isUnlocked
                                    ? "border-green-200 bg-green-50"
                                    : isInProgress
                                        ? "border-blue-200 bg-blue-50"
                                        : "border-gray-200"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className={`p-2 rounded-lg ${isUnlocked ? "bg-green-100" :
                                                isInProgress ? "bg-blue-100" : "bg-gray-100"
                                            }`}>
                                            <IconComponent className={`w-4 h-4 ${isUnlocked ? "text-green-600" :
                                                    isInProgress ? "text-blue-600" : "text-gray-400"
                                                }`} />
                                        </div>
                                        <h3 className={`font-medium ${isUnlocked ? "text-green-800" :
                                                isInProgress ? "text-blue-800" : "text-gray-900"
                                            }`}>
                                            {achievement.name}
                                        </h3>
                                    </div>
                                    <p className={`text-sm mb-3 ${isUnlocked ? "text-green-600" :
                                            isInProgress ? "text-blue-600" : "text-gray-600"
                                        }`}>
                                        {achievement.description}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isUnlocked
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}>
                                        <StarIcon className="w-3 h-3 mr-1" />
                                        {achievement.points}
                                    </span>

                                    {isUnlocked ? (
                                        <div className="text-green-600">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </div>
                                    ) : isInProgress ? (
                                        <div className="text-blue-600">
                                            <ClockIcon className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">
                                            <ClockIcon className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {achievement.progress !== undefined && achievement.total && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{achievement.progress} / {achievement.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${isUnlocked
                                                    ? "bg-green-500"
                                                    : isInProgress
                                                        ? "bg-blue-500"
                                                        : "bg-gray-300"
                                                }`}
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {isUnlocked && achievement.unlockedAt && (
                                <div className="mt-3 pt-3 border-t border-green-200">
                                    <p className="text-xs text-green-600">
                                        Unlocked {format(new Date(achievement.unlockedAt), "MMM d, yyyy")}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
