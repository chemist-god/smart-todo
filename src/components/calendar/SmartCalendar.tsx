"use client";

import { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg, EventChangeArg, EventContentArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { CalendarIcon, List, Grid2X2, CalendarDays, Clock, X, Pencil, Trash2, Check } from 'lucide-react';
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
  const [selectedAllDay, setSelectedAllDay] = useState<boolean>(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const externalRef = useRef<HTMLDivElement>(null);

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
    setSelectedAllDay(selectInfo.allDay ?? true);
    setSelectedTime(selectInfo.allDay ? null : format(selectInfo.start, 'HH:mm'));
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
    } catch {
      toast('Error: Failed to update event.');
      // Revert the change on error
      changeInfo.revert();
    }
  };

  // External draggable sources (priority chips)
  useEffect(() => {
    if (!externalRef.current) return;
    const draggable = new Draggable(externalRef.current, {
      itemSelector: '.fc-external',
      eventData: (el) => {
        const priority = (el as HTMLElement).dataset.priority || 'MEDIUM';
        const title = (el as HTMLElement).dataset.title || 'New Todo';
        return { title, extendedProps: { priority } };
      },
    });
    return () => draggable.destroy();
  }, []);

  // Custom render for events
  const renderEventContent = (arg: EventContentArg) => {
    const isCompleted = Boolean(arg.event.extendedProps.completed);
    const priority = String(arg.event.extendedProps.priority || 'MEDIUM');
    const dotColor = getPriorityColor(priority);
    return (
      <div className="flex items-center gap-1 truncate">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className={`truncate ${isCompleted ? 'line-through opacity-70' : ''}`}>{arg.event.title}</span>
      </div>
    );
  };

  // Initialize and persist view preference
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('calendar:view') as ViewType | null) : null;
    if (stored) {
      setView(stored);
      const api = calendarRef.current?.getApi();
      api?.changeView(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendar:view', view);
    }
    const api = calendarRef.current?.getApi();
    api?.changeView(view);
  }, [view]);

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
          {/* External drag sources */}
          <div ref={externalRef} className="hidden md:flex items-center space-x-2 mr-4">
            <span className="text-xs text-gray-500 mr-1">Drag to create:</span>
            <button className="fc-external px-2 py-1 text-xs rounded bg-green-100 text-green-700" data-priority="LOW" data-title="Low priority">
              Low
            </button>
            <button className="fc-external px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700" data-priority="MEDIUM" data-title="Medium priority">
              Med
            </button>
            <button className="fc-external px-2 py-1 text-xs rounded bg-red-100 text-red-700" data-priority="HIGH" data-title="High priority">
              High
            </button>
          </div>
          {/* View toggles */}
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
          {/* Navigation controls */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <Button
              variant="outline"
              onClick={() => calendarRef.current?.getApi().today()}
            >
              Today
            </Button>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button
                variant="outline"
                className="rounded-r-none"
                onClick={() => calendarRef.current?.getApi().prev()}
                aria-label="Previous"
              >
                ‹
              </Button>
              <Button
                variant="outline"
                className="rounded-l-none"
                onClick={() => calendarRef.current?.getApi().next()}
                aria-label="Next"
              >
                ›
              </Button>
            </div>
          </div>
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

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getPriorityColor('HIGH') }} /> High</div>
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getPriorityColor('MEDIUM') }} /> Medium</div>
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getPriorityColor('LOW') }} /> Low</div>
        <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-red-500" /> Overdue</div>
      </div>

      <div className="flex-1 rounded-lg border bg-card text-card-foreground shadow-sm relative">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
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
          droppable={true}
          eventReceive={async (info) => {
            // Create a new todo from external drag
            const start = info.event.start || new Date();
            const isAllDay = info.event.allDay;
            const ext = info.event.extendedProps as { priority?: 'LOW' | 'MEDIUM' | 'HIGH' };
            const priority: 'LOW' | 'MEDIUM' | 'HIGH' = ext?.priority || 'MEDIUM';
            const title = info.event.title || 'New Todo';
            try {
              await handleCreateEvent({
                title,
                description: '',
                dueDate: start.toISOString(),
                dueTime: isAllDay ? null : format(start, 'HH:mm'),
                priority,
                completed: false,
              });
            } catch {
              info.revert();
            }
          }}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventChange={handleEventChange}
          height="100%"
          datesSet={() => {
            const api = calendarRef.current?.getApi();
            if (!api) return;
            if (api.view.type !== view) {
              setView(api.view.type as ViewType);
            }
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
          }}
          eventClassNames={({ event }) => {
            const isCompleted = Boolean(event.extendedProps.completed);
            const start = event.start as Date | null;
            const isOverdue = !!start && start.getTime() < Date.now() && !isCompleted;
            return cn(
              'cursor-pointer hover:opacity-90 transition-opacity',
              isCompleted && 'opacity-60 line-through',
              isOverdue && 'ring-2 ring-red-400'
            );
          }}
        />

        {selectedEvent && (
          <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l shadow-lg p-4 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Priority:</span>
                <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${getPriorityColor(selectedEvent.priority)}20`, color: getPriorityColor(selectedEvent.priority) }}>
                  {selectedEvent.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">When:</span>
                <span>{selectedEvent.dueDate ? format(new Date(selectedEvent.dueDate), selectedEvent.dueTime ? 'PP p' : 'PP') : '—'}</span>
              </div>
              {selectedEvent.description && (
                <div>
                  <div className="text-gray-500 mb-1">Details</div>
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-auto pt-3 flex items-center justify-between">
              <button
                onClick={async () => {
                  await onEventUpdate(selectedEvent.id, { completed: !selectedEvent.completed });
                }}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded ${selectedEvent.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <Check className="h-4 w-4" /> {selectedEvent.completed ? 'Completed' : 'Mark done'}
              </button>
              <div className="space-x-2">
                <button onClick={() => setIsFormOpen(true)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => onEventDelete(selectedEvent.id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-600 text-white">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
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