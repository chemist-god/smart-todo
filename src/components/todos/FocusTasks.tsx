"use client";

import { useState, useEffect } from "react";
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import TodoItem from "./TodoItem";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  points: number;
  createdAt: string;
  completedAt?: string;
}

export default function FocusTasks() {
  const [focusTasks, setFocusTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFocusTasks();
  }, []);

  const fetchFocusTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos/focus');
      if (!response.ok) {
        throw new Error('Failed to fetch focus tasks');
      }
      const data = await response.json();
      setFocusTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    // Optimistic UI update
    setFocusTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    
    // Refetch to get updated focus tasks
    fetchFocusTasks();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p>Error loading focus tasks: {error}</p>
      </div>
    );
  }

  if (focusTasks.length === 0) {
    return (
      <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <LightBulbIcon className="mx-auto h-12 w-12 text-blue-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No focus tasks right now</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Complete some todos or add new ones to see your focus tasks here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          <LightBulbIcon className="h-5 w-5 inline-block mr-2 text-yellow-500" />
          Focus Tasks (80/20 Rule)
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
          {focusTasks.length} tasks
        </span>
      </div>
      
      <div className="space-y-3">
        {focusTasks.map((task) => (
          <div key={task.id} className="relative group">
            <div className="absolute -left-1 top-0 bottom-0 w-1 bg-yellow-500 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="pl-3">
              <TodoItem 
                todo={task} 
                onComplete={handleTaskComplete} 
                className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
        <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-yellow-500" />
        These are your highest impact tasks based on the 80/20 rule
      </div>
    </div>
  );
}
