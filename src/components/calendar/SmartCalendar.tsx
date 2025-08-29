"use client";

import { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg, EventApi, EventChangeArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { CalendarIcon, List, Grid2X2, CalendarDays } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { Todo } from '@prisma/client';
import { cn } from '@/lib/utils';
import { EventForm } from './EventForm';

interface SmartCalendarProps {
  todos: Todo[];
  onEventCreate: (event: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onEventUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onEventDelete: (id: string) => Promise<void>;
}

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export function SmartCalendar({ todos, onEventCreate, onEventUpdate, onEventDelete }: SmartCalendarProps) {
  const [view, setView] = useState<ViewType>('dayGridMonth');
  const [selectedEvent, setSelectedEvent] = useState<Todo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const calendarRef = useRef<FullCalendar>(null);

  // Convert todos to FullCalendar events
  const events = todos.map(todo => ({
    id: todo.id,
    title: todo.title,
    start: todo.dueDate ? new Date(todo.dueDate) : new Date(),
    end: todo.dueDate ? new Date(new Date(todo.dueDate).getTime() + 60 * 60 * 1000) : new Date(),
    allDay: !todo.dueTime,
    extendedProps: {
      description: todo.description,
      priority: todo.priority,
      completed: todo.completed,
    },
    backgroundColor: getPriorityColor(todo.priority),
    borderColor: getPriorityColor(todo.priority),
  }));

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#3b82f6';
    }
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = todos.find(todo => todo.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setIsFormOpen(true);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.start);
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleEventChange = async (changeInfo: EventChangeArg) => {
    const { event } = changeInfo;
    const updates = {
      dueDate: event.start ? event.start.toISOString() : new Date().toISOString(),
      dueTime: event.allDay ? null : format(event.start || new Date(), 'HH:mm'),
    };
    
    try {
      await onEventUpdate(event.id, updates);
  toast('Event updated: The event has been successfully rescheduled.');
    } catch (error) {
  toast('Error: Failed to update event.');
      // Revert the change on error
      changeInfo.revert();
    }
  };

  const handleCreateEvent = async (data: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await onEventCreate(data);
  toast('Event created: Your event has been created successfully.');
      setIsFormOpen(false);
    } catch (error) {
  toast('Error: Failed to create event.');
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<Todo>) => {
    try {
      await onEventUpdate(id, updates);
  toast('Event updated: Your event has been updated successfully.');
      setIsFormOpen(false);
    } catch (error) {
  toast('Error: Failed to update event.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await onEventDelete(id);
  toast('Event deleted: Your event has been deleted.');
      setIsFormOpen(false);
    } catch (error) {
  toast('Error: Failed to delete event.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex items-center space-x-2">
          <Tabs 
            value={view} 
            onValueChange={(value) => setView(value as ViewType)}
            className="mr-4"
          >
            <TabsList>
              <TabsTrigger value="dayGridMonth" className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Month
              </TabsTrigger>
              <TabsTrigger value="timeGridWeek" className="flex items-center">
                <Grid2X2 className="h-4 w-4 mr-2" />
                Week
              </TabsTrigger>
              <TabsTrigger value="timeGridDay" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Day
              </TabsTrigger>
              <TabsTrigger value="listWeek" className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={() => {
              setSelectedEvent(null);
              setIsFormOpen(true);
            }}
          >
            New Event
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-lg border bg-card text-card-foreground shadow-sm">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          initialDate={selectedDate}
          headerToolbar={false}
          events={events}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventChange={handleEventChange}
          height="100%"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
          }}
          eventClassNames={({ event }) =>
            cn(
              'cursor-pointer hover:opacity-90 transition-opacity',
              event.extendedProps.completed && 'opacity-60 line-through'
            )
          }
        />
      </div>

      <EventForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}