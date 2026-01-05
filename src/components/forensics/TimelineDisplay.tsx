import { useState } from 'react';
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
  Lock,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  X,
  Download,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const severityConfig: Record<TimelineEvent['severity'], { color: string; bgColor: string; textColor: string }> = {
  critical: { color: 'border-destructive', bgColor: 'bg-destructive/20', textColor: 'text-destructive' },
  high: { color: 'border-warning', bgColor: 'bg-warning/20', textColor: 'text-warning' },
  medium: { color: 'border-yellow-400', bgColor: 'bg-yellow-400/20', textColor: 'text-yellow-400' },
  low: { color: 'border-accent', bgColor: 'bg-accent/20', textColor: 'text-accent' },
};

const severityLevels: TimelineEvent['severity'][] = ['critical', 'high', 'medium', 'low'];
const eventTypes: TimelineEvent['type'][] = ['authentication', 'security', 'access', 'network', 'modification', 'deletion', 'system', 'unknown'];

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
  const [sortAscending, setSortAscending] = useState(true);
  const [activeSeverities, setActiveSeverities] = useState<Set<TimelineEvent['severity']>>(
    new Set(severityLevels)
  );
  const [activeTypes, setActiveTypes] = useState<Set<TimelineEvent['type']>>(
    new Set(eventTypes)
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSeverity = (severity: TimelineEvent['severity']) => {
    setActiveSeverities(prev => {
      const next = new Set(prev);
      if (next.has(severity)) {
        if (next.size > 1) {
          next.delete(severity);
        }
      } else {
        next.add(severity);
      }
      return next;
    });
  };

  const selectAllSeverities = () => {
    setActiveSeverities(new Set(severityLevels));
  };

  const toggleType = (type: TimelineEvent['type']) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) {
          next.delete(type);
        }
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const selectAllTypes = () => {
    setActiveTypes(new Set(eventTypes));
  };

  const exportToJSON = () => {
    const exportData = sortedEvents.map(event => ({
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      type: event.type,
      severity: event.severity,
      description: event.description,
      source: event.source,
      details: event.details || {}
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-events-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'Severity', 'Description', 'Source', 'Details'];
    const rows = sortedEvents.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.type,
      event.severity,
      `"${event.description.replace(/"/g, '""')}"`,
      event.source,
      event.details ? `"${JSON.stringify(event.details).replace(/"/g, '""')}"` : ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-events-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter events by severity, type, and search query
  const filteredEvents = events.filter(event => {
    if (!activeSeverities.has(event.severity)) return false;
    if (!activeTypes.has(event.type)) return false;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = event.description.toLowerCase().includes(query);
      const matchesSource = event.source.toLowerCase().includes(query);
      const matchesDetails = event.details 
        ? Object.values(event.details).some(v => v.toLowerCase().includes(query))
        : false;
      
      if (!matchesDescription && !matchesSource && !matchesDetails) return false;
    }
    
    return true;
  });

  // Sort filtered events by timestamp
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const diff = a.timestamp.getTime() - b.timestamp.getTime();
    return sortAscending ? diff : -diff;
  });

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
    const dateA = groupedEvents[a][0]?.timestamp.getTime() || 0;
    const dateB = groupedEvents[b][0]?.timestamp.getTime() || 0;
    return sortAscending ? dateA - dateB : dateB - dateA;
  });

  // Sort events within each date group by time
  for (const date of sortedDates) {
    groupedEvents[date].sort((a, b) => {
      const diff = a.timestamp.getTime() - b.timestamp.getTime();
      return sortAscending ? diff : -diff;
    });
  }

  // Count events by severity
  const severityCounts = events.reduce((counts, event) => {
    counts[event.severity] = (counts[event.severity] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Count events by type
  const typeCounts = events.reduce((counts, event) => {
    counts[event.type] = (counts[event.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Incident Timeline
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredEvents.length} of {events.length} events)
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {filteredEvents.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToJSON}
                  className="gap-1.5"
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortAscending(!sortAscending)}
              className="gap-2"
            >
              {sortAscending ? (
                <>
                  <ArrowUp className="w-4 h-4" />
                  Oldest First
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4" />
                  Newest First
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Severity Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="w-3 h-3" />
            <span>Severity:</span>
          </div>
          {severityLevels.map(severity => {
            const config = severityConfig[severity];
            const count = severityCounts[severity] || 0;
            const isActive = activeSeverities.has(severity);
            
            return (
              <button
                key={severity}
                onClick={() => toggleSeverity(severity)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-semibold uppercase transition-all border",
                  isActive 
                    ? cn(config.bgColor, config.color, config.textColor)
                    : "bg-secondary/50 border-border/50 text-muted-foreground opacity-50"
                )}
              >
                {severity} ({count})
              </button>
            );
          })}
          {activeSeverities.size < severityLevels.length && (
            <button
              onClick={selectAllSeverities}
              className="px-2 py-1 rounded text-xs text-primary hover:text-primary/80 underline"
            >
              All
            </button>
          )}
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="w-3 h-3" />
            <span>Type:</span>
          </div>
          {eventTypes.map(type => {
            const config = eventTypeConfig[type];
            const count = typeCounts[type] || 0;
            const isActive = activeTypes.has(type);
            const Icon = config.icon;
            
            if (count === 0) return null;
            
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium capitalize transition-all border flex items-center gap-1",
                  isActive 
                    ? cn("bg-secondary border-border", config.color)
                    : "bg-secondary/50 border-border/50 text-muted-foreground opacity-50"
                )}
              >
                <Icon className="w-3 h-3" />
                {type} ({count})
              </button>
            );
          })}
          {activeTypes.size < eventTypes.length && (
            <button
              onClick={selectAllTypes}
              className="px-2 py-1 rounded text-xs text-primary hover:text-primary/80 underline"
            >
              All
            </button>
          )}
        </div>

        {/* Search Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events by description, source, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 bg-secondary/50 border-border/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
