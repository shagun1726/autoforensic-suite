/**
 * Incident Classification Module
 * Classifies incidents based on event patterns and indicators
 */

import { TimelineEvent, IncidentClassification, IncidentType } from './types';

interface IncidentPattern {
  type: IncidentType;
  indicators: RegExp[];
  minMatches: number;
  description: string;
}

const INCIDENT_PATTERNS: IncidentPattern[] = [
  {
    type: 'UNAUTHORIZED_ACCESS',
    indicators: [
      /failed\s+(password|login|auth)/i,
      /invalid\s+(user|credentials)/i,
      /authentication\s+failure/i,
      /access\s+denied/i,
      /permission\s+denied/i,
      /unauthorized/i,
    ],
    minMatches: 2,
    description: 'Attempted or successful unauthorized access to system resources',
  },
  {
    type: 'DATA_BREACH',
    indicators: [
      /data\s+(leak|breach|exfil)/i,
      /sensitive\s+data/i,
      /unauthorized\s+download/i,
      /mass\s+copy/i,
      /export/i,
      /large\s+transfer/i,
    ],
    minMatches: 1,
    description: 'Potential unauthorized access or exfiltration of sensitive data',
  },
  {
    type: 'MALWARE_INFECTION',
    indicators: [
      /malware/i,
      /virus/i,
      /trojan/i,
      /ransomware/i,
      /cryptolocker/i,
      /worm/i,
      /backdoor/i,
      /rootkit/i,
      /keylogger/i,
    ],
    minMatches: 1,
    description: 'System infected with malicious software',
  },
  {
    type: 'DENIAL_OF_SERVICE',
    indicators: [
      /ddos/i,
      /denial\s+of\s+service/i,
      /syn\s+flood/i,
      /connection\s+flood/i,
      /resource\s+exhaustion/i,
      /too\s+many\s+connections/i,
      /rate\s+limit/i,
    ],
    minMatches: 2,
    description: 'Attack aimed at making system resources unavailable',
  },
  {
    type: 'PRIVILEGE_ESCALATION',
    indicators: [
      /privilege\s+escalation/i,
      /sudo/i,
      /root\s+access/i,
      /admin\s+privilege/i,
      /elevation/i,
      /setuid/i,
      /capability/i,
    ],
    minMatches: 2,
    description: 'Attempt to gain elevated access rights beyond normal user privileges',
  },
  {
    type: 'SYSTEM_COMPROMISE',
    indicators: [
      /exploit/i,
      /vulnerability/i,
      /shell\s+access/i,
      /reverse\s+shell/i,
      /command\s+injection/i,
      /code\s+execution/i,
      /buffer\s+overflow/i,
    ],
    minMatches: 1,
    description: 'System has been compromised through exploitation of vulnerabilities',
  },
  {
    type: 'POLICY_VIOLATION',
    indicators: [
      /policy\s+violation/i,
      /compliance/i,
      /unauthorized\s+software/i,
      /prohibited/i,
      /blocked\s+by\s+policy/i,
    ],
    minMatches: 1,
    description: 'Actions that violate established security policies',
  },
  {
    type: 'SUSPICIOUS_ACTIVITY',
    indicators: [
      /suspicious/i,
      /anomal/i,
      /unusual/i,
      /unexpected/i,
      /abnormal/i,
      /warning/i,
      /alert/i,
    ],
    minMatches: 3,
    description: 'Unusual or suspicious activity detected that warrants investigation',
  },
];

export function classifyIncident(events: TimelineEvent[]): IncidentClassification {
  const allText = events.map(e => e.description + ' ' + (e.source || '')).join(' ');
  
  const scores: Array<{ pattern: IncidentPattern; matches: number; matchedIndicators: string[] }> = [];
  
  for (const pattern of INCIDENT_PATTERNS) {
    let matches = 0;
    const matchedIndicators: string[] = [];
    
    for (const indicator of pattern.indicators) {
      const matchCount = (allText.match(new RegExp(indicator, 'gi')) || []).length;
      if (matchCount > 0) {
        matches += matchCount;
        matchedIndicators.push(indicator.source.replace(/\\s\+/g, ' ').replace(/[\\^$.*+?()[\]{}|]/g, ''));
      }
    }
    
    if (matches >= pattern.minMatches) {
      scores.push({ pattern, matches, matchedIndicators });
    }
  }
  
  // Sort by match count
  scores.sort((a, b) => b.matches - a.matches);
  
  if (scores.length > 0) {
    const topMatch = scores[0];
    const confidence = Math.min((topMatch.matches / (topMatch.pattern.indicators.length * 2)) * 100, 95);
    
    return {
      type: topMatch.pattern.type,
      confidence: Math.round(confidence),
      indicators: topMatch.matchedIndicators.slice(0, 5),
      description: topMatch.pattern.description,
    };
  }
  
  // Default classification based on severity distribution
  const highSeverity = events.filter(e => e.severity === 'high' || e.severity === 'critical').length;
  
  if (highSeverity > events.length * 0.3) {
    return {
      type: 'SUSPICIOUS_ACTIVITY',
      confidence: 40,
      indicators: ['High concentration of severe events'],
      description: 'Multiple high-severity events detected requiring investigation',
    };
  }
  
  return {
    type: 'UNKNOWN',
    confidence: 20,
    indicators: ['No specific incident patterns matched'],
    description: 'Unable to classify incident type based on available evidence',
  };
}

export function getIncidentTypeLabel(type: IncidentType): string {
  const labels: Record<IncidentType, string> = {
    UNAUTHORIZED_ACCESS: 'Unauthorized Access Attempt',
    DATA_BREACH: 'Data Breach / Exfiltration',
    MALWARE_INFECTION: 'Malware Infection',
    DENIAL_OF_SERVICE: 'Denial of Service Attack',
    PRIVILEGE_ESCALATION: 'Privilege Escalation',
    SUSPICIOUS_ACTIVITY: 'Suspicious Activity',
    POLICY_VIOLATION: 'Policy Violation',
    SYSTEM_COMPROMISE: 'System Compromise',
    UNKNOWN: 'Unknown Incident Type',
  };
  return labels[type] || type;
}
