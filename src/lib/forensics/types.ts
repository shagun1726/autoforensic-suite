export interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'DEBUG';
  source: string;
  message: string;
  rawLine: string;
  lineNumber: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'access' | 'modification' | 'deletion' | 'authentication' | 'network' | 'system' | 'security' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  details?: Record<string, string>;
}

export interface RiskAnalysis {
  overallScore: number; // 0-100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
}

export interface IncidentClassification {
  type: IncidentType;
  confidence: number;
  indicators: string[];
  description: string;
}

export type IncidentType = 
  | 'UNAUTHORIZED_ACCESS'
  | 'DATA_BREACH'
  | 'MALWARE_INFECTION'
  | 'DENIAL_OF_SERVICE'
  | 'PRIVILEGE_ESCALATION'
  | 'SUSPICIOUS_ACTIVITY'
  | 'POLICY_VIOLATION'
  | 'SYSTEM_COMPROMISE'
  | 'UNKNOWN';

export interface ForensicCase {
  id: string;
  createdAt: Date;
  fileName: string;
  fileHash: string;
  fileSize: number;
  status: 'processing' | 'completed' | 'error';
  parsedLogs: LogEntry[];
  timeline: TimelineEvent[];
  riskAnalysis: RiskAnalysis;
  incidentClassification: IncidentClassification;
  observations: string[];
  conclusion: string;
}

export interface ForensicReport {
  caseId: string;
  generatedAt: Date;
  title: string;
  caseSummary: string;
  incidentType: string;
  severity: string;
  riskScore: number;
  evidenceHash: string;
  timeline: TimelineEvent[];
  observations: string[];
  conclusion: string;
  generatedBy: string;
}
