import AppLayout from "@/components/layout/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    CheckCircleIcon,
    DocumentTextIcon,
    TrophyIcon,
    FireIcon,
    CalendarIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name || user.email}!</h1>
                    <p className="text-blue-100">Ready to crush your goals today? Let's get productive! 🚀</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Todos</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Notes</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <TrophyIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Points</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Progress */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Today's Progress</h2>
                            <FireIcon className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Daily Goal</span>
                                    <span className="text-gray-900">0/5 tasks</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Streak</span>
                                    <span className="text-gray-900">0 days</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 mb-2" />
                                <p className="text-sm font-medium text-gray-900">New Todo</p>
                                <p className="text-xs text-gray-600">Add a task</p>
                            </button>
                            <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                                <DocumentTextIcon className="w-5 h-5 text-purple-600 mb-2" />
                                <p className="text-sm font-medium text-gray-900">New Note</p>
                                <p className="text-xs text-gray-600">Capture thoughts</p>
                            </button>
                            <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                                <CalendarIcon className="w-5 h-5 text-green-600 mb-2" />
                                <p className="text-sm font-medium text-gray-900">View Calendar</p>
                                <p className="text-xs text-gray-600">Schedule tasks</p>
                            </button>
                            <button className="p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left">
                                <ChartBarIcon className="w-5 h-5 text-yellow-600 mb-2" />
                                <p className="text-sm font-medium text-gray-900">Analytics</p>
                                <p className="text-xs text-gray-600">View progress</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Todos</h2>
                        <div className="space-y-3">
                            <div className="text-center py-8">
                                <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No todos yet. Create your first todo to get started!</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notes</h2>
                        <div className="space-y-3">
                            <div className="text-center py-8">
                                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No notes yet. Start taking notes to keep track of your thoughts!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
