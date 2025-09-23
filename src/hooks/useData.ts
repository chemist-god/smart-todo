import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { getSWRConfig } from '@/lib/swr-config';

// Enhanced data fetching hooks with proper caching and real-time updates

// User stats hook
export function useUserStats() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/stats',
        fetcher,
        getSWRConfig('static')
    );

    return {
        stats: data,
        isLoading,
        isError: error,
        mutate,
        // Helper to refresh stats
        refreshStats: () => mutate(),
    };
}

// Todos hook with real-time updates
export function useTodos(filter: string = 'all', sortBy: string = 'created') {
    const { data, error, isLoading, mutate } = useSWR(
        `/api/todos?filter=${filter}&sortBy=${sortBy}`,
        fetcher,
        getSWRConfig('dynamic')
    );

    return {
        todos: data || [],
        isLoading,
        isError: error,
        mutate,
        // Helper to refresh todos
        refreshTodos: () => mutate(),
        // Helper to add a new todo optimistically
        addTodo: async (newTodo: any) => {
            // Optimistic update
            mutate((currentTodos: any) => [...(currentTodos || []), newTodo], false);

            try {
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTodo),
                });

                if (response.ok) {
                    // Revalidate to get the actual data
                    mutate();
                } else {
                    // Revert on error
                    mutate();
                }
            } catch (error) {
                // Revert on error
                mutate();
                throw error;
            }
        },
        // Helper to update a todo optimistically
        updateTodo: async (id: string, updates: any) => {
            // Optimistic update
            mutate((currentTodos: any) =>
                currentTodos?.map((todo: any) =>
                    todo.id === id ? { ...todo, ...updates } : todo
                ), false
            );

            try {
                const response = await fetch(`/api/todos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });

                if (response.ok) {
                    mutate();
                } else {
                    mutate();
                }
            } catch (error) {
                mutate();
                throw error;
            }
        },
        // Helper to delete a todo optimistically
        deleteTodo: async (id: string) => {
            // Optimistic update
            mutate((currentTodos: any) =>
                currentTodos?.filter((todo: any) => todo.id !== id), false
            );

            try {
                const response = await fetch(`/api/todos/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    mutate();
                }
            } catch (error) {
                mutate();
                throw error;
            }
        },
    };
}

// Goals hook with real-time updates
export function useGoals(status: string = 'all', type: string = 'all') {
    const params = new URLSearchParams();
    if (status !== 'all') params.append('status', status);
    if (type !== 'all') params.append('type', type);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/goals?${params.toString()}`,
        fetcher,
        getSWRConfig('dynamic')
    );

    return {
        goals: data || [],
        isLoading,
        isError: error,
        mutate,
        // Helper to refresh goals
        refreshGoals: () => mutate(),
        // Helper to add a new goal optimistically
        addGoal: async (newGoal: any) => {
            // Optimistic update
            mutate((currentGoals: any) => [...(currentGoals || []), newGoal], false);

            try {
                const response = await fetch('/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newGoal),
                });

                if (response.ok) {
                    mutate();
                } else {
                    mutate();
                }
            } catch (error) {
                mutate();
                throw error;
            }
        },
        // Helper to update a goal optimistically
        updateGoal: async (id: string, updates: any) => {
            // Optimistic update
            mutate((currentGoals: any) =>
                currentGoals?.map((goal: any) =>
                    goal.id === id ? { ...goal, ...updates } : goal
                ), false
            );

            try {
                const response = await fetch(`/api/goals/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });

                if (response.ok) {
                    mutate();
                } else {
                    mutate();
                }
            } catch (error) {
                mutate();
                throw error;
            }
        },
        // Helper to delete a goal optimistically
        deleteGoal: async (id: string) => {
            // Optimistic update
            mutate((currentGoals: any) =>
                currentGoals?.filter((goal: any) => goal.id !== id), false
            );

            try {
                const response = await fetch(`/api/goals/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    mutate();
                }
            } catch (error) {
                mutate();
                throw error;
            }
        },
    };
}

// Notes hook with real-time updates
export function useNotes() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/notes',
        fetcher,
        getSWRConfig('dynamic')
    );

    return {
        notes: data || [],
        isLoading,
        isError: error,
        mutate,
        // Helper to refresh notes
        refreshNotes: () => mutate(),
        // Helper to add a new note optimistically
        addNote: async (newNote: any) => {
            // Optimistic update
            mutate((currentNotes: any) => [...(currentNotes || []), newNote], false);

            try {
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newNote),
                });

                if (response.ok) {
                    mutate();
                } else {
                    mutate();
                }
            } catch (error) {
                mutate();
                throw error;
            }
        },
        // Helper to update a note optimistically
        updateNote: async (id: string, updates: any) => {
            // Optimistic update
            mutate((currentNotes: any) =>
                currentNotes?.map((note: any) =>
                    note.id === id ? { ...note, ...updates } : note
                ), false
            );

            try {
                const response = await fetch(`/api/notes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });

                if (response.ok) {
                    mutate();
                } else {
                    mutate();
                }
            } catch (error) {
                mutate();
                throw error;
            }
        },
        // Helper to delete a note optimistically
        deleteNote: async (id: string) => {
            // Optimistic update
            mutate((currentNotes: any) =>
                currentNotes?.filter((note: any) => note.id !== id), false
            );

            try {
                const response = await fetch(`/api/notes/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    mutate();
                }
            } catch (error) {
                mutate();
                throw error;
            }
        },
    };
}

// Analytics hooks with caching
export function useProductivityAnalytics(period: string = '30') {
    const { data, error, isLoading, mutate } = useSWR(
        `/api/analytics/productivity?period=${period}`,
        fetcher,
        getSWRConfig('analytics')
    );

    return {
        data,
        isLoading,
        isError: error,
        mutate,
        refreshAnalytics: () => mutate(),
    };
}

export function usePatternAnalytics(period: string = '30') {
    const { data, error, isLoading, mutate } = useSWR(
        `/api/analytics/patterns?period=${period}`,
        fetcher,
        getSWRConfig('analytics')
    );

    return {
        data,
        isLoading,
        isError: error,
        mutate,
        refreshAnalytics: () => mutate(),
    };
}
