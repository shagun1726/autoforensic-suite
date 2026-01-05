/**
 * Case Manager Module
 * Manages forensic case creation and storage
 */

import { ForensicCase, LogEntry, TimelineEvent, RiskAnalysis, IncidentClassification } from './types';
import { calculateSHA256 } from './hashIntegrity';
import { parseLogFile } from './logParser';
import { buildTimeline, filterSignificantEvents } from './timelineBuilder';
import { calculateRisk } from './riskEngine';
import { classifyIncident, getIncidentTypeLabel } from './incidentClassifier';

function generateCaseId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `AF-${timestamp}-${random}`.toUpperCase();
}

function generateObservations(
  logs: LogEntry[],
  events: TimelineEvent[],
  risk: RiskAnalysis,
  incident: IncidentClassification
): string[] {
  const observations: string[] = [];
  
  // Log statistics
  observations.push(`Total log entries analyzed: ${logs.length}`);
  
  // Level distribution
  const levelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const levelSummary = Object.entries(levelCounts)
    .map(([level, count]) => `${level}: ${count}`)
    .join(', ');
  observations.push(`Log level distribution: ${levelSummary}`);
  
  // Timeline span
  if (events.length >= 2) {
    const start = events[0].timestamp.toISOString();
    const end = events[events.length - 1].timestamp.toISOString();
    observations.push(`Timeline span: ${start} to ${end}`);
  }
  
  // Event type distribution
  const typeCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const significantTypes = Object.entries(typeCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
    
  if (significantTypes.length > 0) {
    observations.push(`Most frequent event types: ${significantTypes.map(([type, count]) => `${type} (${count})`).join(', ')}`);
  }
  
  // Severity distribution
  const criticalEvents = events.filter(e => e.severity === 'critical').length;
  const highEvents = events.filter(e => e.severity === 'high').length;
  
  if (criticalEvents > 0) {
    observations.push(`Critical severity events detected: ${criticalEvents}`);
  }
  if (highEvents > 0) {
    observations.push(`High severity events detected: ${highEvents}`);
  }
  
  // Incident-specific observations
  if (incident.type !== 'UNKNOWN') {
    observations.push(`Incident classification: ${getIncidentTypeLabel(incident.type)} (${incident.confidence}% confidence)`);
    observations.push(`Key indicators: ${incident.indicators.join(', ')}`);
  }
  
  // Risk factors
  const significantFactors = risk.factors.filter(f => f.score > 30);
  if (significantFactors.length > 0) {
    observations.push(`Primary risk factors: ${significantFactors.map(f => f.name).join(', ')}`);
  }
  
  return observations;
}

function generateConclusion(
  risk: RiskAnalysis,
  incident: IncidentClassification
): string {
  const severity = risk.severity;
  const incidentType = getIncidentTypeLabel(incident.type);
  
  let conclusion = `Based on the forensic analysis of the provided log evidence, `;
  
  if (severity === 'CRITICAL') {
    conclusion += `a CRITICAL security incident has been identified. The investigation reveals ${incidentType.toLowerCase()} with a risk score of ${risk.overallScore}/100. Immediate incident response actions are strongly recommended. `;
  } else if (severity === 'HIGH') {
    conclusion += `a HIGH severity incident has been detected. The analysis indicates ${incidentType.toLowerCase()} with a risk score of ${risk.overallScore}/100. Prompt investigation and remediation measures are advised. `;
  } else if (severity === 'MEDIUM') {
    conclusion += `a MEDIUM severity incident has been identified. Evidence suggests ${incidentType.toLowerCase()} with a risk score of ${risk.overallScore}/100. Further investigation is recommended to assess the full scope of the incident. `;
  } else {
    conclusion += `a LOW severity finding has been recorded. The analysis indicates ${incidentType.toLowerCase()} with a risk score of ${risk.overallScore}/100. Continued monitoring and standard security practices are recommended. `;
  }
  
  conclusion += `The evidence hash has been recorded to maintain chain of custody. All findings should be reviewed by qualified security personnel.`;
  
  return conclusion;
}

export async function createForensicCase(
  file: File,
  content: string
): Promise<ForensicCase> {
  // Generate case ID
  const caseId = generateCaseId();
  
  // Calculate evidence hash
  const fileHash = await calculateSHA256(content);
  
  // Parse logs
  const parsedLogs = parseLogFile(content);
  
  // Build timeline
  const allEvents = buildTimeline(parsedLogs);
  const timeline = filterSignificantEvents(allEvents);
  
  // Calculate risk
  const riskAnalysis = calculateRisk(timeline);
  
  // Classify incident
  const incidentClassification = classifyIncident(timeline);
  
  // Generate observations
  const observations = generateObservations(parsedLogs, timeline, riskAnalysis, incidentClassification);
  
  // Generate conclusion
  const conclusion = generateConclusion(riskAnalysis, incidentClassification);
  
  const forensicCase: ForensicCase = {
    id: caseId,
    createdAt: new Date(),
    fileName: file.name,
    fileHash,
    fileSize: file.size,
    status: 'completed',
    parsedLogs,
    timeline,
    riskAnalysis,
    incidentClassification,
    observations,
    conclusion,
  };
  
  return forensicCase;
}
