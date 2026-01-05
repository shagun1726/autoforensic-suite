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
  // Clean up the timestamp string
  const cleaned = timestampStr.trim();
  
  // Try various formats
  const formats = [
    // ISO format (e.g., "2024-01-15T10:30:00Z")
    () => new Date(cleaned),
    // Standard datetime (e.g., "2024-01-15 10:30:00")
    () => new Date(cleaned.replace(/[-\/]/g, '-')),
    // Syslog format (e.g., "Jan 15 10:30:00")
    () => {
      const currentYear = new Date().getFullYear();
      return new Date(`${cleaned} ${currentYear}`);
    },
    // Apache format (e.g., "15/Jan/2024:10:30:00 +0000")
    () => {
      const apacheMatch = cleaned.match(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}:\d{2}:\d{2})/);
      if (apacheMatch) {
        return new Date(`${apacheMatch[2]} ${apacheMatch[1]}, ${apacheMatch[3]} ${apacheMatch[4]}`);
      }
      throw new Error('Not Apache format');
    },
    // Unix timestamp (numeric)
    () => {
      const num = parseInt(cleaned);
      if (!isNaN(num) && num > 946684800 && num < 2147483647) {
        return new Date(num * 1000);
      }
      if (!isNaN(num) && num > 946684800000) {
        return new Date(num);
      }
      throw new Error('Not unix timestamp');
    },
    // Various date formats with slashes or dashes
    () => {
      const dateMatch = cleaned.match(/(\d{1,4})[-\/](\d{1,2})[-\/](\d{1,4})[\sT]?(\d{2}:\d{2}:\d{2})?/);
      if (dateMatch) {
        let year = parseInt(dateMatch[1]);
        let month = parseInt(dateMatch[2]) - 1;
        let day = parseInt(dateMatch[3]);
        
        // Handle DD/MM/YYYY vs YYYY/MM/DD
        if (year < 100) {
          year = year + 2000;
        }
        if (dateMatch[1].length <= 2 && dateMatch[3].length === 4) {
          // DD/MM/YYYY format
          day = parseInt(dateMatch[1]);
          year = parseInt(dateMatch[3]);
        }
        
        const timeStr = dateMatch[4] || '00:00:00';
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        
        return new Date(year, month, day, hours || 0, minutes || 0, seconds || 0);
      }
      throw new Error('Not date format');
    },
  ];

  for (const parser of formats) {
    try {
      const date = parser();
      if (date && !isNaN(date.getTime()) && date.getTime() > 0) {
        return date;
      }
    } catch {
      continue;
    }
  }

  // Return epoch + line number hash if nothing works (to maintain relative order)
  return new Date(0);
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

    let timestamp: Date | null = null;
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
    if (!timestamp || timestamp.getTime() === 0) {
      // Try multiple timestamp patterns
      const timestampPatterns = [
        /(\d{4}[-\/]\d{2}[-\/]\d{2}[\sT]\d{2}:\d{2}:\d{2})/,
        /(\d{2}[-\/]\d{2}[-\/]\d{4}[\sT]\d{2}:\d{2}:\d{2})/,
        /(\d{2}:\d{2}:\d{2})/,
        /(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/,
      ];
      
      for (const pattern of timestampPatterns) {
        const timestampMatch = line.match(pattern);
        if (timestampMatch) {
          const parsed = parseTimestamp(timestampMatch[1]);
          if (parsed.getTime() !== 0) {
            timestamp = parsed;
            message = line.replace(timestampMatch[0], '').trim();
            break;
          }
        }
      }
      
      level = detectLevel(line);
      source = detectSource(line);
    }

    // If still no valid timestamp, use line number to create relative ordering
    if (!timestamp || timestamp.getTime() === 0) {
      // Use a base date + line number to maintain order for logs without timestamps
      timestamp = new Date(2024, 0, 1, 0, 0, i);
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

  // Sort by timestamp
  return entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
