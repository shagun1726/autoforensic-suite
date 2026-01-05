/**
 * Risk Calculation Engine
 * Calculates overall risk score and severity based on analyzed events
 */

import { TimelineEvent, RiskAnalysis, RiskFactor } from './types';

const SEVERITY_WEIGHTS = {
  low: 1,
  medium: 3,
  high: 7,
  critical: 15,
};

const EVENT_TYPE_RISK = {
  authentication: 8,
  security: 10,
  access: 6,
  network: 5,
  modification: 4,
  deletion: 7,
  system: 3,
  unknown: 2,
};

export function calculateRisk(events: TimelineEvent[]): RiskAnalysis {
  if (events.length === 0) {
    return {
      overallScore: 0,
      severity: 'LOW',
      factors: [],
      recommendations: ['No security events detected in the logs.'],
    };
  }

  const factors: RiskFactor[] = [];
  let totalScore = 0;

  // Factor 1: Critical Events Count
  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const criticalFactor: RiskFactor = {
    name: 'Critical Events',
    weight: 0.3,
    score: Math.min(criticalCount * 20, 100),
    description: `${criticalCount} critical severity events detected`,
  };
  factors.push(criticalFactor);
  totalScore += criticalFactor.score * criticalFactor.weight;

  // Factor 2: High Severity Events
  const highCount = events.filter(e => e.severity === 'high').length;
  const highFactor: RiskFactor = {
    name: 'High Severity Events',
    weight: 0.25,
    score: Math.min(highCount * 10, 100),
    description: `${highCount} high severity events detected`,
  };
  factors.push(highFactor);
  totalScore += highFactor.score * highFactor.weight;

  // Factor 3: Authentication Failures
  const authFailures = events.filter(
    e => e.type === 'authentication' && 
    (e.description.toLowerCase().includes('fail') || 
     e.description.toLowerCase().includes('invalid'))
  ).length;
  const authFactor: RiskFactor = {
    name: 'Authentication Failures',
    weight: 0.2,
    score: Math.min(authFailures * 15, 100),
    description: `${authFailures} authentication failures detected`,
  };
  factors.push(authFactor);
  totalScore += authFactor.score * authFactor.weight;

  // Factor 4: Security Events
  const securityEvents = events.filter(e => e.type === 'security').length;
  const securityFactor: RiskFactor = {
    name: 'Security Incidents',
    weight: 0.15,
    score: Math.min(securityEvents * 25, 100),
    description: `${securityEvents} security-related events detected`,
  };
  factors.push(securityFactor);
  totalScore += securityFactor.score * securityFactor.weight;

  // Factor 5: Event Density (events per hour)
  if (events.length >= 2) {
    const timeSpan = events[events.length - 1].timestamp.getTime() - events[0].timestamp.getTime();
    const hours = Math.max(timeSpan / (1000 * 60 * 60), 1);
    const eventsPerHour = events.length / hours;
    const densityScore = Math.min(eventsPerHour * 2, 100);
    const densityFactor: RiskFactor = {
      name: 'Event Density',
      weight: 0.1,
      score: densityScore,
      description: `${eventsPerHour.toFixed(1)} events per hour detected`,
    };
    factors.push(densityFactor);
    totalScore += densityFactor.score * densityFactor.weight;
  }

  // Calculate overall score (0-100)
  const overallScore = Math.round(Math.min(totalScore, 100));

  // Determine severity
  let severity: RiskAnalysis['severity'];
  if (overallScore >= 75) {
    severity = 'CRITICAL';
  } else if (overallScore >= 50) {
    severity = 'HIGH';
  } else if (overallScore >= 25) {
    severity = 'MEDIUM';
  } else {
    severity = 'LOW';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(events, factors, severity);

  return {
    overallScore,
    severity,
    factors,
    recommendations,
  };
}

function generateRecommendations(
  events: TimelineEvent[],
  factors: RiskFactor[],
  severity: RiskAnalysis['severity']
): string[] {
  const recommendations: string[] = [];

  // Check for authentication issues
  const authFactor = factors.find(f => f.name === 'Authentication Failures');
  if (authFactor && authFactor.score > 30) {
    recommendations.push('Implement account lockout policies after multiple failed login attempts.');
    recommendations.push('Review and strengthen password policies.');
    recommendations.push('Consider implementing multi-factor authentication (MFA).');
  }

  // Check for security events
  const securityFactor = factors.find(f => f.name === 'Security Incidents');
  if (securityFactor && securityFactor.score > 20) {
    recommendations.push('Conduct a thorough malware scan on affected systems.');
    recommendations.push('Review and update firewall rules and access controls.');
    recommendations.push('Isolate potentially compromised systems for further investigation.');
  }

  // Check for critical events
  const criticalFactor = factors.find(f => f.name === 'Critical Events');
  if (criticalFactor && criticalFactor.score > 0) {
    recommendations.push('Immediately investigate all critical severity events.');
    recommendations.push('Preserve evidence and maintain chain of custody.');
    recommendations.push('Consider engaging incident response team.');
  }

  // General recommendations based on severity
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    recommendations.push('Initiate incident response procedures.');
    recommendations.push('Document all findings and actions taken.');
    recommendations.push('Report to appropriate stakeholders and authorities if required.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue regular security monitoring and log review.');
    recommendations.push('Ensure all systems are patched and up to date.');
    recommendations.push('Maintain regular backup schedules.');
  }

  return recommendations.slice(0, 5);
}
