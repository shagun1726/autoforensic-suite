/**
 * Log Parser Module
 * Parses various log formats and extracts structured data
 */

import { LogEntry } from './types';

// Common log patterns
const LOG_PATTERNS = [
  // Apache/Nginx access log
  /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) .* \[(\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}[^\]]*)\] "([^"]*)" (\d{3}) (\d+)/,
  // Syslog format
  /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\S+):\s+(.*)$/,
  // Windows Event Log style
  /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\w+)\s+(\w+)\s+(.*)$/,
  // ISO timestamp format
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\s]*)\s+\[?(\w+)\]?\s+(.*)$/,
  // Generic timestamp format
  /^\[?(\d{4}[-\/]\d{2}[-\/]\d{2}\s+\d{2}:\d{2}:\d{2})\]?\s+\[?(\w+)\]?\s*:?\s*(.*)$/,
];

const LEVEL_KEYWORDS: Record<string, LogEntry['level']> = {
  'info': 'INFO',
  'information': 'INFO',
  'notice': 'INFO',
  'warn': 'WARNING',
  'warning': 'WARNING',
  'err': 'ERROR',
  'error': 'ERROR',
  'crit': 'CRITICAL',
  'critical': 'CRITICAL',
  'alert': 'CRITICAL',
  'emerg': 'CRITICAL',
  'emergency': 'CRITICAL',
  'fatal': 'CRITICAL',
  'debug': 'DEBUG',
  'trace': 'DEBUG',
};

function detectLevel(text: string): LogEntry['level'] {
  const lowerText = text.toLowerCase();
  for (const [keyword, level] of Object.entries(LEVEL_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      return level;
    }
  }
  return 'INFO';
}

function parseTimestamp(timestampStr: string): Date {
  // Try various formats
  const formats = [
    // ISO format
    () => new Date(timestampStr),
    // Syslog format (e.g., "Jan 15 10:30:00")
    () => {
      const currentYear = new Date().getFullYear();
      return new Date(`${timestampStr} ${currentYear}`);
    },
    // Apache format (e.g., "15/Jan/2024:10:30:00 +0000")
    () => {
      const cleaned = timestampStr.replace(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}:\d{2}:\d{2})/, '$2 $1, $3 $4');
      return new Date(cleaned);
    },
  ];

  for (const parser of formats) {
    try {
      const date = parser();
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch {
      continue;
    }
  }

  return new Date();
}

function detectSource(line: string): string {
  // Common source indicators
  const sourcePatterns = [
    /sshd/i,
    /nginx/i,
    /apache/i,
    /kernel/i,
    /systemd/i,
    /cron/i,
    /sudo/i,
    /auth/i,
    /audit/i,
    /firewall/i,
    /iptables/i,
    /mysql/i,
    /postgresql/i,
    /docker/i,
  ];

  for (const pattern of sourcePatterns) {
    if (pattern.test(line)) {
      const match = line.match(pattern);
      return match ? match[0].toLowerCase() : 'system';
    }
  }

  return 'system';
}

export function parseLogFile(content: string): LogEntry[] {
  const lines = content.split('\n').filter(line => line.trim());
  const entries: LogEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let timestamp = new Date();
    let level: LogEntry['level'] = 'INFO';
    let message = line;
    let source = 'system';

    // Try to match against known patterns
    for (const pattern of LOG_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        timestamp = parseTimestamp(match[1]);
        level = detectLevel(match[2] || line);
        message = match[match.length - 1] || line;
        source = detectSource(line);
        break;
      }
    }

    // Fallback: try to extract any timestamp-like pattern
    if (message === line) {
      const timestampMatch = line.match(/\d{4}[-\/]\d{2}[-\/]\d{2}[\sT]\d{2}:\d{2}:\d{2}/);
      if (timestampMatch) {
        timestamp = new Date(timestampMatch[0]);
        message = line.replace(timestampMatch[0], '').trim();
      }
      level = detectLevel(line);
      source = detectSource(line);
    }

    entries.push({
      timestamp,
      level,
      source,
      message,
      rawLine: line,
      lineNumber: i + 1,
    });
  }

  return entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
