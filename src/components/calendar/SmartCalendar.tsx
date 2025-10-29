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
import { CalendarIcon, List, Grid2X2, CalendarDays, Clock, X, Pencil, Trash2, Check, Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner';
// Use a UI-facing todo type to avoid Prisma Date typing and missing fields
type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | Date | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
};
interface CalendarTodo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | Date | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
}
import { cn } from '@/lib/utils';
import { EventForm } from './EventForm';

interface SmartCalendarProps {
  todos: CalendarTodo[];
  onEventCreate: (event: Record<string, unknown>) => Promise<void>;
  onEventUpdate: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onEventDelete: (id: string) => Promise<void>;
}

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export function SmartCalendar({ todos, onEventCreate, onEventUpdate, onEventDelete }: SmartCalendarProps) {
  const [view, setView] = useState<ViewType>('dayGridMonth');
  const [selectedEvent, setSelectedEvent] = useState<CalendarTodo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // We currently treat dueDate as the single source of timing (no separate dueTime)
  const calendarRef = useRef<FullCalendar>(null);
  const externalRef = useRef<HTMLDivElement>(null);

  // Convert todos to FullCalendar events
  const events = todos.map(todo => ({
    id: todo.id,
    title: todo.title,
    start: todo.dueDate ? new Date(todo.dueDate as string | Date) : new Date(),
    end: todo.dueDate ? new Date(new Date(todo.dueDate as string | Date).getTime() + 60 * 60 * 1000) : new Date(),
    allDay: true,
    extendedProps: {
      description: todo.description,
      priority: todo.priority,
      completed: todo.completed,
    },
    backgroundColor: getPriorityColorRaw(todo.priority),
    borderColor: getPriorityColorRaw(todo.priority),
  }));

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'HIGH': return 'hsl(var(--destructive))';
      case 'MEDIUM': return 'hsl(var(--warning))';
      case 'LOW': return 'hsl(var(--success))';
      default: return 'hsl(var(--primary))';
    }
  }

  function getPriorityColorRaw(priority: string) {
    switch (priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#4f46e5';
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
    const dotColor = getPriorityColorRaw(priority);
    return (
      <div className="flex items-center gap-1.5 truncate px-1">
        <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
        <span className={cn(
          'truncate text-xs font-medium',
          isCompleted && 'line-through opacity-70'
        )}>
          {arg.event.title}
        </span>
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

  const handleCreateEvent = async (data: Record<string, unknown>) => {
    try {
      await onEventCreate(data);
      toast('Event created: Your event has been created successfully.');
      setIsFormOpen(false);
    } catch (error) {
      toast('Error: Failed to create event.');
    }
  };

  const handleUpdateEvent = async (id: string, updates: Record<string, unknown>) => {
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
    <div className="flex flex-col h-full space-y-4">
      {/* Mobile-first header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Calendar
          </h2>
          <Button
            onClick={() => {
              setSelectedEvent(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Event</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* Mobile navigation controls */}
        <div className="flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => calendarRef.current?.getApi().prev()}
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => calendarRef.current?.getApi().today()}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => calendarRef.current?.getApi().next()}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setView('dayGridMonth')}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('timeGridWeek')}>
                <Grid2X2 className="h-4 w-4 mr-2" />
                Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('timeGridDay')}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Day
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('listWeek')}>
                <List className="h-4 w-4 mr-2" />
                List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop controls */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* External drag sources */}
            <div ref={externalRef} className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground mr-2">Quick create:</span>
              <Badge 
                variant="outline" 
                className="fc-external cursor-grab hover:cursor-grabbing bg-success/10 text-success border-success/20 hover:bg-success/20" 
                data-priority="LOW" 
                data-title="Low priority task"
              >
                Low
              </Badge>
              <Badge 
                variant="outline" 
                className="fc-external cursor-grab hover:cursor-grabbing bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" 
                data-priority="MEDIUM" 
                data-title="Medium priority task"
              >
                Medium
              </Badge>
              <Badge 
                variant="outline" 
                className="fc-external cursor-grab hover:cursor-grabbing bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" 
                data-priority="HIGH" 
                data-title="High priority task"
              >
                High
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* View toggles */}
            <Tabs
              value={view}
              onValueChange={(value) => setView(value as ViewType)}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dayGridMonth" className="flex items-center text-xs">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  Month
                </TabsTrigger>
                <TabsTrigger value="timeGridWeek" className="flex items-center text-xs">
                  <Grid2X2 className="h-3 w-3 mr-1" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="timeGridDay" className="flex items-center text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Day
                </TabsTrigger>
                <TabsTrigger value="listWeek" className="flex items-center text-xs">
                  <List className="h-3 w-3 mr-1" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Navigation controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => calendarRef.current?.getApi().today()}
              >
                Today
              </Button>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => calendarRef.current?.getApi().prev()}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => calendarRef.current?.getApi().next()}
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-warning" />
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-success" />
          <span>Low Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-destructive" />
          <span>Overdue</span>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg relative overflow-hidden">
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
            const ext = info.event.extendedProps as { priority?: 'LOW' | 'MEDIUM' | 'HIGH' };
            const priority: 'LOW' | 'MEDIUM' | 'HIGH' = ext?.priority || 'MEDIUM';
            const title = info.event.title || 'New Todo';
            try {
              await handleCreateEvent({
                title,
                description: '',
                dueDate: start.toISOString(),
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
              'cursor-pointer hover:opacity-90 transition-all duration-200 hover:scale-[1.02] rounded-md',
              isCompleted && 'opacity-60',
              isOverdue && 'ring-2 ring-destructive/50 animate-pulse'
            );
          }}
        />

        {selectedEvent && (
          <div className="absolute top-0 right-0 h-full w-full sm:w-80 bg-background/95 backdrop-blur-sm border-l shadow-xl p-4 flex flex-col z-10">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-foreground truncate pr-2 text-lg">{selectedEvent.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4 text-sm flex-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Priority:</span>
                <Badge 
                  variant={selectedEvent.priority === 'HIGH' ? 'destructive' : selectedEvent.priority === 'MEDIUM' ? 'secondary' : 'outline'}
                  className={cn(
                    selectedEvent.priority === 'LOW' && 'bg-success/10 text-success border-success/20',
                    selectedEvent.priority === 'MEDIUM' && 'bg-warning/10 text-warning border-warning/20'
                  )}
                >
                  {selectedEvent.priority}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Date:</span>
                <span className="text-foreground">
                  {selectedEvent.dueDate ? format(new Date(selectedEvent.dueDate), 'PPP') : '—'}
                </span>
              </div>
              
              {selectedEvent.description && (
                <div className="space-y-2">
                  <div className="text-muted-foreground font-medium">Description</div>
                  <div className="text-foreground whitespace-pre-wrap break-words bg-muted/30 rounded-lg p-3 text-sm">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-3">
              <Button
                variant={selectedEvent.completed ? 'default' : 'outline'}
                onClick={async () => {
                  await onEventUpdate(selectedEvent.id, { completed: !selectedEvent.completed });
                }}
                className={cn(
                  'w-full justify-start',
                  selectedEvent.completed && 'bg-success hover:bg-success/90 text-success-foreground'
                )}
              >
                <Check className="h-4 w-4 mr-2" />
                {selectedEvent.completed ? 'Completed' : 'Mark as Complete'}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFormOpen(true)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onEventDelete(selectedEvent.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <EventForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        event={selectedEvent as unknown as CalendarEvent | null}
        selectedDate={selectedDate}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}