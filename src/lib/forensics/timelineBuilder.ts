/**
 * Timeline Reconstruction Module
 * Builds a chronological timeline of security-relevant events
 */

import { LogEntry, TimelineEvent } from './types';

// Security-relevant keywords and their event types
const EVENT_PATTERNS: Array<{
  pattern: RegExp;
  type: TimelineEvent['type'];
  severityBase: TimelineEvent['severity'];
}> = [
  // Authentication events
  { pattern: /failed\s+(password|login|auth)/i, type: 'authentication', severityBase: 'high' },
  { pattern: /invalid\s+(user|password|credentials)/i, type: 'authentication', severityBase: 'high' },
  { pattern: /authentication\s+failure/i, type: 'authentication', severityBase: 'high' },
  { pattern: /accepted\s+(password|publickey)/i, type: 'authentication', severityBase: 'low' },
  { pattern: /session\s+opened/i, type: 'authentication', severityBase: 'low' },
  { pattern: /session\s+closed/i, type: 'authentication', severityBase: 'low' },
  { pattern: /login|logged\s+in/i, type: 'authentication', severityBase: 'low' },
  { pattern: /logout|logged\s+out/i, type: 'authentication', severityBase: 'low' },
  
  // Access events
  { pattern: /permission\s+denied/i, type: 'access', severityBase: 'medium' },
  { pattern: /access\s+denied/i, type: 'access', severityBase: 'medium' },
  { pattern: /unauthorized/i, type: 'access', severityBase: 'high' },
  { pattern: /forbidden/i, type: 'access', severityBase: 'medium' },
  
  // Security events
  { pattern: /brute\s*force/i, type: 'security', severityBase: 'critical' },
  { pattern: /intrusion/i, type: 'security', severityBase: 'critical' },
  { pattern: /malware|virus|trojan/i, type: 'security', severityBase: 'critical' },
  { pattern: /exploit|vulnerability/i, type: 'security', severityBase: 'critical' },
  { pattern: /rootkit/i, type: 'security', severityBase: 'critical' },
  { pattern: /privilege\s+escalation/i, type: 'security', severityBase: 'critical' },
  { pattern: /sudo|root/i, type: 'security', severityBase: 'medium' },
  
  // Network events
  { pattern: /connection\s+from/i, type: 'network', severityBase: 'low' },
  { pattern: /port\s+scan/i, type: 'network', severityBase: 'high' },
  { pattern: /syn\s+flood/i, type: 'network', severityBase: 'critical' },
  { pattern: /ddos|denial\s+of\s+service/i, type: 'network', severityBase: 'critical' },
  { pattern: /firewall/i, type: 'network', severityBase: 'medium' },
  
  // System events
  { pattern: /kernel/i, type: 'system', severityBase: 'medium' },
  { pattern: /segfault|segmentation\s+fault/i, type: 'system', severityBase: 'high' },
  { pattern: /oom|out\s+of\s+memory/i, type: 'system', severityBase: 'high' },
  { pattern: /crash|core\s+dump/i, type: 'system', severityBase: 'high' },
  { pattern: /restart|reboot/i, type: 'system', severityBase: 'medium' },
  
  // File events
  { pattern: /file\s+modified/i, type: 'modification', severityBase: 'medium' },
  { pattern: /file\s+created/i, type: 'modification', severityBase: 'low' },
  { pattern: /file\s+deleted|rm\s+-rf/i, type: 'deletion', severityBase: 'high' },
  { pattern: /chmod|chown/i, type: 'modification', severityBase: 'medium' },
];

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function classifyEvent(entry: LogEntry): { type: TimelineEvent['type']; severity: TimelineEvent['severity'] } {
  const text = entry.message + ' ' + entry.rawLine;
  
  for (const { pattern, type, severityBase } of EVENT_PATTERNS) {
    if (pattern.test(text)) {
      // Adjust severity based on log level
      let severity = severityBase;
      if (entry.level === 'CRITICAL' || entry.level === 'ERROR') {
        severity = severity === 'low' ? 'medium' : severity === 'medium' ? 'high' : 'critical';
      }
      return { type, severity };
    }
  }
  
  // Default classification based on log level
  const severityMap: Record<LogEntry['level'], TimelineEvent['severity']> = {
    'DEBUG': 'low',
    'INFO': 'low',
    'WARNING': 'medium',
    'ERROR': 'high',
    'CRITICAL': 'critical',
  };
  
  return { type: 'unknown', severity: severityMap[entry.level] };
}

function extractDetails(entry: LogEntry): Record<string, string> {
  const details: Record<string, string> = {};
  
  // Extract IP addresses
  const ipMatch = entry.rawLine.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
  if (ipMatch) {
    details['IP Address'] = ipMatch[1];
  }
  
  // Extract usernames
  const userMatch = entry.rawLine.match(/user[=:\s]+(\w+)/i);
  if (userMatch) {
    details['User'] = userMatch[1];
  }
  
  // Extract ports
  const portMatch = entry.rawLine.match(/port[=:\s]+(\d+)/i);
  if (portMatch) {
    details['Port'] = portMatch[1];
  }
  
  // Extract PIDs
  const pidMatch = entry.rawLine.match(/pid[=:\s]+(\d+)/i);
  if (pidMatch) {
    details['PID'] = pidMatch[1];
  }
  
  return details;
}

export function buildTimeline(logs: LogEntry[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  
  for (const entry of logs) {
    const { type, severity } = classifyEvent(entry);
    const details = extractDetails(entry);
    
    events.push({
      id: generateUUID(),
      timestamp: entry.timestamp,
      type,
      severity,
      description: entry.message,
      source: entry.source,
      details: Object.keys(details).length > 0 ? details : undefined,
    });
  }
  
  // Sort by timestamp
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export function filterSignificantEvents(events: TimelineEvent[]): TimelineEvent[] {
  // Filter to show only medium severity and above, or keep at least 20 events
  const significant = events.filter(e => e.severity !== 'low');
  
  if (significant.length >= 10) {
    return significant;
  }
  
  // If not enough significant events, return all events up to 50
  return events.slice(0, 50);
}
