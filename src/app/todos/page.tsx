import AppLayout from "@/components/layout/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TodoList from "@/components/todos/TodoList";
import CreateTodoButton from "@/components/todos/CreateTodoButton";
import { CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";

export default async function TodosPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Todos</h1>
                        <p className="text-gray-600">Manage your tasks and stay organized</p>
                    </div>
                    <CreateTodoButton />
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Completed</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Overdue</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                </div>

                <TodoList />
            </div>
        </AppLayout>
    );
}
