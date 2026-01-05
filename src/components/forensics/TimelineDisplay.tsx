import { motion } from 'framer-motion';
import { 
  Clock, 
  Shield, 
  User, 
  Network, 
  FileEdit, 
  Trash2, 
  Server,
  HelpCircle,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimelineEvent } from '@/lib/forensics/types';
import { cn } from '@/lib/utils';

interface TimelineDisplayProps {
  events: TimelineEvent[];
}

const eventTypeConfig: Record<TimelineEvent['type'], { icon: React.ElementType; color: string }> = {
  authentication: { icon: Lock, color: 'text-blue-400' },
  security: { icon: Shield, color: 'text-destructive' },
  access: { icon: User, color: 'text-purple-400' },
  network: { icon: Network, color: 'text-cyan-400' },
  modification: { icon: FileEdit, color: 'text-yellow-400' },
  deletion: { icon: Trash2, color: 'text-orange-400' },
  system: { icon: Server, color: 'text-gray-400' },
  unknown: { icon: HelpCircle, color: 'text-muted-foreground' },
};

const severityConfig: Record<TimelineEvent['severity'], { color: string; bgColor: string }> = {
  critical: { color: 'border-destructive', bgColor: 'bg-destructive/20' },
  high: { color: 'border-warning', bgColor: 'bg-warning/20' },
  medium: { color: 'border-yellow-400', bgColor: 'bg-yellow-400/20' },
  low: { color: 'border-accent', bgColor: 'bg-accent/20' },
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TimelineDisplay({ events }: TimelineDisplayProps) {
  // Sort all events by timestamp first
  const sortedEvents = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Group events by date
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const dateKey = formatDate(event.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    // Get the first event from each group to compare dates
    const dateA = groupedEvents[a][0]?.timestamp.getTime() || 0;
    const dateB = groupedEvents[b][0]?.timestamp.getTime() || 0;
    return dateA - dateB;
  });

  // Sort events within each date group by time
  for (const date of sortedDates) {
    groupedEvents[date].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          Incident Timeline
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({events.length} events)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 max-h-[400px] overflow-y-auto">
        {sortedDates.map((date, dateIndex) => (
          <div key={date} className="relative">
            {/* Date Header */}
            <div className="sticky top-0 z-10 px-6 py-2 bg-secondary/80 backdrop-blur-sm border-b border-border/50">
              <span className="text-sm font-semibold text-primary font-mono">{date}</span>
            </div>

            {/* Events for this date */}
            <div className="relative pl-10 pr-6 py-4">
              {/* Timeline line */}
              <div className="absolute left-7 top-0 bottom-0 w-px bg-border" />

              {groupedEvents[date].map((event, eventIndex) => {
                const typeConfig = eventTypeConfig[event.type];
                const sevConfig = severityConfig[event.severity];
                const Icon = typeConfig.icon;

                return (
                  <motion.div
                    key={event.id}
                    className="relative mb-4 last:mb-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (dateIndex * 0.1) + (eventIndex * 0.05) }}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center border-2",
                      sevConfig.color,
                      sevConfig.bgColor
                    )}>
                      <div className={cn("w-2 h-2 rounded-full", 
                        event.severity === 'critical' ? 'bg-destructive' :
                        event.severity === 'high' ? 'bg-warning' :
                        event.severity === 'medium' ? 'bg-yellow-400' :
                        'bg-accent'
                      )} />
                    </div>

                    {/* Event card */}
                    <div className={cn(
                      "ml-4 p-3 rounded-lg border transition-all hover:border-primary/50",
                      "bg-card/50 border-border/50"
                    )}>
                      <div className="flex items-start gap-3">
                        <div className={cn("p-1.5 rounded-md bg-secondary", typeConfig.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              {formatTime(event.timestamp)}
                            </span>
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded uppercase font-semibold",
                              sevConfig.bgColor,
                              event.severity === 'critical' ? 'text-destructive' :
                              event.severity === 'high' ? 'text-warning' :
                              event.severity === 'medium' ? 'text-yellow-400' :
                              'text-accent'
                            )}>
                              {event.severity}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {event.type}
                            </span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">
                            {event.description}
                          </p>
                          {event.details && Object.keys(event.details).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(event.details).map(([key, value]) => (
                                <span 
                                  key={key}
                                  className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground font-mono"
                                >
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No timeline events to display
          </div>
        )}
      </CardContent>
    </Card>
  );
}
