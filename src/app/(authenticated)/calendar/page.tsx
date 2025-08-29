"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { SmartCalendar } from "@/components/calendar/SmartCalendar";
import { Todo } from "@prisma/client";

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch todos
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchTodos = async () => {
      try {
        const response = await fetch("/api/todos");
        if (!response.ok) throw new Error("Failed to fetch todos");
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
        toast({
          title: "Error",
          description: "Failed to load todos. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [status]);

  const handleCreateEvent = async (event: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) throw new Error("Failed to create event");

      const newEvent = await response.json();
      setTodos(prev => [...prev, newEvent]);
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update event");

      const updatedEvent = await response.json();
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? { ...todo, ...updatedEvent } : todo))
      );
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Toaster position="top-right" />
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Calendar
        </h1>
        
        <div className="h-[calc(100vh-200px)]">
          <SmartCalendar
            todos={todos}
            onEventCreate={handleCreateEvent}
            onEventUpdate={handleUpdateEvent}
            onEventDelete={handleDeleteEvent}
          />
        </div>
      </div>
    </div>
  );
}
