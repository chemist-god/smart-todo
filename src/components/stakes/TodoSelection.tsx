"use client";

import { useState, useEffect } from "react";
import { CheckIcon, XMarkIcon, ListBulletIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Todo {
    id: string;
    title: string;
    description?: string;
    priority: string;
    dueDate?: string;
    completed: boolean;
    points: number;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

interface TodoSelectionProps {
    onTodoSelect: (todo: Todo | null) => void;
    selectedTodo: Todo | null;
}

export default function TodoSelection({ onTodoSelect, selectedTodo }: TodoSelectionProps) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSelection, setShowSelection] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { addToast } = useToast();

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/todos?filter=active');
            if (response.ok) {
                const todos = await response.json();
                // The API returns todos directly, not wrapped in a 'todos' property
                // Filter for pending/incomplete todos only
                const pendingTodos = todos.filter((todo: Todo) =>
                    !todo.completed
                );
                setTodos(pendingTodos);
            } else {
                const errorData = await response.json();
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: errorData.error || 'Failed to fetch todos'
                });
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while fetching todos'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTodoSelect = (todo: Todo) => {
        onTodoSelect(todo);
        setShowSelection(false);
        addToast({
            type: 'success',
            title: 'Todo Selected!',
            message: `"${todo.title}" has been selected for staking`
        });
    };

    const handleClearSelection = () => {
        onTodoSelect(null);
        addToast({
            type: 'info',
            title: 'Selection Cleared',
            message: 'No todo selected for staking'
        });
    };

    const filteredTodos = todos.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-100';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
            case 'LOW': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (completed: boolean) => {
        return completed ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100';
    };

    const formatDueDate = (dueDate: string) => {
        const date = new Date(dueDate);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        if (diffDays <= 7) return `Due in ${diffDays} days`;
        return `Due ${date.toLocaleDateString()}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-600">Loading your todos...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListBulletIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Link to Existing Todo</h3>
                </div>
                <button
                    onClick={() => setShowSelection(!showSelection)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                    {showSelection ? 'Hide Todos' : 'Show Todos'}
                </button>
            </div>

            {/* Selected Todo Display */}
            {selectedTodo && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckIcon className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">Selected Todo:</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{selectedTodo.title}</h4>
                            {selectedTodo.description && (
                                <p className="text-sm text-gray-600 mb-2">{selectedTodo.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTodo.priority)}`}>
                                    {selectedTodo.priority}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTodo.completed)}`}>
                                    {selectedTodo.completed ? 'Completed' : 'Pending'}
                                </span>
                                {selectedTodo.dueDate && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <ClockIcon className="w-3 h-3" />
                                        {formatDueDate(selectedTodo.dueDate)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleClearSelection}
                            className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4 text-purple-600" />
                        </button>
                    </div>
                </div>
            )}

            {/* Todo Selection Modal */}
            {showSelection && (
                <div className="border border-gray-200 rounded-lg bg-white">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search todos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Todo List */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredTodos.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {searchTerm ? 'No todos found matching your search' : 'No pending todos available'}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredTodos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        onClick={() => handleTodoSelect(todo)}
                                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 mb-1">{todo.title}</h4>
                                                {todo.description && (
                                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                        {todo.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                                                        {todo.priority}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todo.completed)}`}>
                                                        {todo.completed ? 'Completed' : 'Pending'}
                                                    </span>
                                                    {todo.dueDate && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <ClockIcon className="w-3 h-3" />
                                                            {formatDueDate(todo.dueDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedTodo?.id === todo.id && (
                                                <CheckIcon className="w-5 h-5 text-purple-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Help Text */}
            <p className="text-sm text-gray-500">
                💡 Select an existing todo to create a stake for it, or create a new stake from scratch.
            </p>
        </div>
    );
}
