"use client";

import { useState } from "react";
import TodoItem from "./TodoItem";
import { FunnelIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

export default function TodoList() {
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [sortBy, setSortBy] = useState<"created" | "due" | "priority">("created");

    // TODO: Replace with actual data from API
    const todos: any[] = [];

    const filteredTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    });

    return (
        <div className="space-y-4">
            {/* Filters and Sort */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === "all"
                                        ? "bg-blue-100 text-blue-700 font-medium"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter("active")}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === "active"
                                        ? "bg-blue-100 text-blue-700 font-medium"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilter("completed")}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === "completed"
                                        ? "bg-blue-100 text-blue-700 font-medium"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="created">Created Date</option>
                            <option value="due">Due Date</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Todo List */}
            <div className="space-y-3">
                {filteredTodos.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No todos found</h3>
                        <p className="text-gray-500 mb-4">
                            {filter === "all"
                                ? "Create your first todo to get started on your productivity journey!"
                                : `No ${filter} todos found.`
                            }
                        </p>
                        {filter === "all" && (
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Your First Todo
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTodos.map((todo) => (
                        <TodoItem key={todo.id} todo={todo} />
                    ))
                )}
            </div>
        </div>
    );
}
