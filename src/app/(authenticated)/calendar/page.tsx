"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Calendar } from "lucide-react";
import { Toaster, toast } from "sonner";
import { SmartCalendar } from "@/components/calendar/SmartCalendar";
import { Todo } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { data: todos, mutate } = useSWR<Todo[]>(
    status === "authenticated" ? "/api/todos?sortBy=due" : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && todos) {
      setIsLoading(false);
    }
  }, [status, todos]);

  const handleCreateEvent = async (event: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) throw new Error("Failed to create event");

      await mutate();
      toast.success("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  const handleUpdateEvent = async (id: string, updates: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update event");

      await mutate();
      toast.success("Event updated successfully!");
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

      await mutate();
      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Calendar className="h-12 w-12 text-primary/20" />
            <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-2 left-2" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Toaster position="top-right" richColors />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-160px)]">
              <SmartCalendar
                todos={todos || []}
                onEventCreate={handleCreateEvent}
                onEventUpdate={handleUpdateEvent}
                onEventDelete={handleDeleteEvent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
