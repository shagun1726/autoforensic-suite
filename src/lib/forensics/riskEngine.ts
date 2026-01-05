/**
 * Enhanced Risk Calculation Engine
 * Calculates overall risk score using the comprehensive forensic risk scoring framework
 */

import { TimelineEvent, RiskAnalysis, RiskFactor } from './types';
import { 
  ALL_EVENT_RISK_SCORES, 
  COMBINATION_PATTERNS,
  getRiskLevel,
  normalizeScoreToPercent,
  CombinationPattern,
  EventRiskScore
} from './riskScoring';

// ========================
// EVENT TYPE TO RISK SCORE MAPPING
// ========================

const EVENT_TYPE_BASE_SCORES: Record<TimelineEvent['type'], number> = {
  authentication: 5,
  security: 8,
  access: 4,
  network: 5,
  modification: 4,
  deletion: 6,
  system: 3,
  unknown: 4,
};

const SEVERITY_MULTIPLIERS: Record<TimelineEvent['severity'], number> = {
  low: 1,
  medium: 1.5,
  high: 2.5,
  critical: 4,
};

// ========================
// KEYWORD-BASED RISK SCORING
// ========================

interface KeywordRiskMatch {
  pattern: RegExp;
  riskScore: number;
  eventName: string;
  category: string;
}

const KEYWORD_RISK_PATTERNS: KeywordRiskMatch[] = [
  // Critical Events (9-10)
  { pattern: /ransomware|encrypt.*file|cryptolocker/i, riskScore: 10, eventName: 'ransomware_behavior', category: 'PROCESS_MALWARE' },
  { pattern: /c2|command.*control|beacon/i, riskScore: 10, eventName: 'c2_communication', category: 'NETWORK' },
  { pattern: /rootkit|bootkit/i, riskScore: 10, eventName: 'rootkit_detected', category: 'PROCESS_MALWARE' },
  { pattern: /keylogger|keystroke/i, riskScore: 10, eventName: 'keylogger_detected', category: 'PROCESS_MALWARE' },
  { pattern: /log.*clear|clear.*log|audit.*clear/i, riskScore: 10, eventName: 'audit_log_cleared', category: 'SECURITY_CONTROL' },
  { pattern: /session.*hijack/i, riskScore: 10, eventName: 'session_hijack', category: 'AUTHENTICATION' },
  { pattern: /malicious.*ip|blacklist.*ip|threat.*intel/i, riskScore: 10, eventName: 'known_malicious_ip', category: 'NETWORK' },
  { pattern: /tamper.*protect.*disable/i, riskScore: 10, eventName: 'tamper_protection_disabled', category: 'SECURITY_CONTROL' },
  
  // High Events (7-8)
  { pattern: /brute.*force|multiple.*fail.*login/i, riskScore: 9, eventName: 'brute_force_detected', category: 'AUTHENTICATION' },
  { pattern: /antivirus.*disable|av.*disable|defender.*disable/i, riskScore: 9, eventName: 'antivirus_disabled', category: 'SECURITY_CONTROL' },
  { pattern: /firewall.*disable/i, riskScore: 9, eventName: 'firewall_disabled', category: 'SECURITY_CONTROL' },
  { pattern: /malware.*detect|virus.*detect|trojan/i, riskScore: 9, eventName: 'malware_detected', category: 'PROCESS_MALWARE' },
  { pattern: /process.*inject/i, riskScore: 9, eventName: 'process_injection', category: 'PROCESS_MALWARE' },
  { pattern: /dll.*hijack|dll.*side.*load/i, riskScore: 9, eventName: 'dll_hijack', category: 'PROCESS_MALWARE' },
  { pattern: /dns.*tunnel/i, riskScore: 9, eventName: 'dns_tunneling', category: 'NETWORK' },
  { pattern: /usb.*mass.*copy|large.*usb.*transfer/i, riskScore: 9, eventName: 'mass_usb_copy', category: 'USB_DEVICE' },
  { pattern: /privilege.*escalat|priv.*esc/i, riskScore: 8, eventName: 'privilege_escalation', category: 'AUTHENTICATION' },
  { pattern: /encoded.*powershell|powershell.*encode|-enc\s/i, riskScore: 8, eventName: 'powershell_encoded', category: 'PROCESS_MALWARE' },
  { pattern: /bios.*change|uefi.*modif/i, riskScore: 8, eventName: 'bios_change', category: 'SYSTEM' },
  { pattern: /unknown.*usb|unauthorized.*usb/i, riskScore: 8, eventName: 'unknown_usb_device', category: 'USB_DEVICE' },
  { pattern: /cloud.*mass.*download|bulk.*download/i, riskScore: 8, eventName: 'cloud_mass_download', category: 'CLOUD_REMOTE' },
  
  // Medium-High Events (5-7)
  { pattern: /account.*lock/i, riskScore: 7, eventName: 'account_lockout', category: 'AUTHENTICATION' },
  { pattern: /large.*upload|data.*exfil/i, riskScore: 7, eventName: 'data_upload_large', category: 'NETWORK' },
  { pattern: /tor.*connect|onion.*network/i, riskScore: 7, eventName: 'tor_connection', category: 'NETWORK' },
  { pattern: /port.*scan/i, riskScore: 7, eventName: 'port_scan_detected', category: 'NETWORK' },
  { pattern: /security.*policy.*change/i, riskScore: 7, eventName: 'security_policy_change', category: 'SECURITY_CONTROL' },
  { pattern: /config.*file.*modif|system.*config.*change/i, riskScore: 7, eventName: 'config_file_modify', category: 'FILE_SYSTEM' },
  { pattern: /registry.*run.*key|autorun.*registry/i, riskScore: 7, eventName: 'registry_run_key', category: 'PROCESS_MALWARE' },
  { pattern: /remote.*tool|psexec|wmic.*remote/i, riskScore: 7, eventName: 'remote_tool_execution', category: 'CLOUD_REMOTE' },
  { pattern: /copy.*usb|usb.*copy.*to/i, riskScore: 7, eventName: 'usb_file_copy_to', category: 'USB_DEVICE' },
  { pattern: /boot.*anomal|unusual.*boot/i, riskScore: 7, eventName: 'boot_anomaly', category: 'SYSTEM' },
  { pattern: /failed.*login.*\d+|login.*fail.*multiple/i, riskScore: 6, eventName: 'login_failed_multiple', category: 'AUTHENTICATION' },
  { pattern: /new.*location.*login|login.*new.*geo/i, riskScore: 6, eventName: 'login_new_location', category: 'AUTHENTICATION' },
  { pattern: /suspicious.*port|unusual.*port/i, riskScore: 6, eventName: 'suspicious_port', category: 'NETWORK' },
  { pattern: /account.*creat|new.*user.*account/i, riskScore: 5, eventName: 'account_created', category: 'AUTHENTICATION' },
  { pattern: /account.*delet|user.*remov/i, riskScore: 6, eventName: 'account_deleted', category: 'AUTHENTICATION' },
  { pattern: /sensitive.*file|confidential.*access/i, riskScore: 6, eventName: 'sensitive_file_access', category: 'FILE_SYSTEM' },
  { pattern: /executable.*creat|\.exe.*creat/i, riskScore: 6, eventName: 'executable_created', category: 'FILE_SYSTEM' },
  { pattern: /unknown.*process|suspicious.*process/i, riskScore: 6, eventName: 'unknown_process', category: 'PROCESS_MALWARE' },
  { pattern: /lateral.*movement|internal.*connect/i, riskScore: 6, eventName: 'lateral_movement', category: 'NETWORK' },
  { pattern: /cloud.*share.*external/i, riskScore: 6, eventName: 'cloud_file_share', category: 'CLOUD_REMOTE' },
  { pattern: /system.*crash|kernel.*panic|bsod/i, riskScore: 6, eventName: 'system_crash', category: 'SYSTEM' },
  { pattern: /firewall.*rule.*add/i, riskScore: 6, eventName: 'firewall_rule_added', category: 'SECURITY_CONTROL' },
  
  // Lower Events (3-5)
  { pattern: /after.*hour.*login|login.*off.*hour/i, riskScore: 5, eventName: 'login_after_hours', category: 'AUTHENTICATION' },
  { pattern: /script.*execut|powershell|vbscript|wscript/i, riskScore: 5, eventName: 'script_execution', category: 'PROCESS_MALWARE' },
  { pattern: /scheduled.*task.*creat/i, riskScore: 5, eventName: 'scheduled_task_created', category: 'PROCESS_MALWARE' },
  { pattern: /hidden.*file|hidden.*folder/i, riskScore: 5, eventName: 'hidden_file_created', category: 'FILE_SYSTEM' },
  { pattern: /rdp.*connect/i, riskScore: 5, eventName: 'rdp_connection', category: 'CLOUD_REMOTE' },
  { pattern: /permission.*change|chmod|icacls/i, riskScore: 5, eventName: 'permission_change', category: 'FILE_SYSTEM' },
  { pattern: /download.*large|large.*download/i, riskScore: 5, eventName: 'data_download_large', category: 'NETWORK' },
  { pattern: /invalid.*user.*login|user.*not.*exist/i, riskScore: 5, eventName: 'login_failed_invalid_user', category: 'AUTHENTICATION' },
  { pattern: /unexpected.*shutdown|forced.*shutdown/i, riskScore: 5, eventName: 'unexpected_shutdown', category: 'SYSTEM' },
  { pattern: /usb.*insert|usb.*connect/i, riskScore: 4, eventName: 'usb_insert', category: 'USB_DEVICE' },
  { pattern: /sudo|runas.*admin/i, riskScore: 4, eventName: 'sudo_command', category: 'AUTHENTICATION' },
  { pattern: /ssh.*connect/i, riskScore: 4, eventName: 'ssh_connection', category: 'CLOUD_REMOTE' },
  { pattern: /vpn.*connect/i, riskScore: 4, eventName: 'vpn_connection', category: 'NETWORK' },
  { pattern: /archive.*creat|zip.*creat|tar.*creat/i, riskScore: 4, eventName: 'archive_created', category: 'FILE_SYSTEM' },
  { pattern: /remote.*login|remote.*access/i, riskScore: 4, eventName: 'remote_login', category: 'CLOUD_REMOTE' },
  { pattern: /smb.*connect|file.*share.*access/i, riskScore: 4, eventName: 'smb_connection', category: 'NETWORK' },
  { pattern: /password.*change/i, riskScore: 4, eventName: 'password_change', category: 'AUTHENTICATION' },
  { pattern: /file.*delet/i, riskScore: 4, eventName: 'file_delete', category: 'FILE_SYSTEM' },
  { pattern: /safe.*mode.*boot/i, riskScore: 4, eventName: 'safe_mode_boot', category: 'SYSTEM' },
  { pattern: /fail.*login|login.*fail|authentication.*fail/i, riskScore: 3, eventName: 'login_failed', category: 'AUTHENTICATION' },
  { pattern: /file.*modif/i, riskScore: 3, eventName: 'file_modify', category: 'FILE_SYSTEM' },
  { pattern: /file.*copy/i, riskScore: 3, eventName: 'file_copy', category: 'FILE_SYSTEM' },
  { pattern: /external.*connect|outbound.*connect/i, riskScore: 3, eventName: 'external_connection', category: 'NETWORK' },
  { pattern: /usb.*mount/i, riskScore: 4, eventName: 'usb_mount', category: 'USB_DEVICE' },
  { pattern: /usb.*remove|usb.*eject/i, riskScore: 3, eventName: 'usb_remove', category: 'USB_DEVICE' },
  { pattern: /cloud.*access|cloud.*file/i, riskScore: 3, eventName: 'cloud_file_access', category: 'CLOUD_REMOTE' },
];

// ========================
// MAIN RISK CALCULATION
// ========================

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
  let maxEventScore = 0;
  let totalWeightedScore = 0;
  const detectedPatterns: CombinationPattern[] = [];
  const eventScores: { event: TimelineEvent; score: number; matchedPattern?: string }[] = [];

  // ========================
  // Step 1: Score Individual Events
  // ========================
  
  for (const event of events) {
    let eventScore = EVENT_TYPE_BASE_SCORES[event.type] || 3;
    let matchedPatternName: string | undefined;

    // Apply keyword-based scoring
    const eventText = `${event.description} ${event.source} ${JSON.stringify(event.details || {})}`.toLowerCase();
    
    for (const pattern of KEYWORD_RISK_PATTERNS) {
      if (pattern.pattern.test(eventText)) {
        if (pattern.riskScore > eventScore) {
          eventScore = pattern.riskScore;
          matchedPatternName = pattern.eventName;
        }
      }
    }

    // Apply severity multiplier
    const multiplier = SEVERITY_MULTIPLIERS[event.severity];
    eventScore = Math.min(eventScore * multiplier, 10);
    
    eventScores.push({ event, score: eventScore, matchedPattern: matchedPatternName });
    maxEventScore = Math.max(maxEventScore, eventScore);
    totalWeightedScore += eventScore;
  }

  // ========================
  // Step 2: Detect Combination Patterns
  // ========================
  
  const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  for (const pattern of COMBINATION_PATTERNS) {
    const matchedEvents = detectPatternMatch(sortedEvents, pattern, eventScores);
    if (matchedEvents.length >= Math.ceil(pattern.requiredEvents.length * 0.6)) {
      detectedPatterns.push(pattern);
    }
  }

  // ========================
  // Step 3: Calculate Risk Factors
  // ========================

  // Factor 1: Maximum Event Severity (0-10 scale converted to 0-100)
  const maxSeverityFactor: RiskFactor = {
    name: 'Peak Threat Level',
    weight: 0.35,
    score: normalizeScoreToPercent(maxEventScore),
    description: `Highest individual event risk: ${maxEventScore.toFixed(1)}/10`,
  };
  factors.push(maxSeverityFactor);

  // Factor 2: Critical Event Count
  const criticalCount = eventScores.filter(e => e.score >= 9).length;
  const highCount = eventScores.filter(e => e.score >= 7 && e.score < 9).length;
  const criticalFactor: RiskFactor = {
    name: 'Critical Events',
    weight: 0.25,
    score: Math.min((criticalCount * 25) + (highCount * 10), 100),
    description: `${criticalCount} critical, ${highCount} high-risk events`,
  };
  factors.push(criticalFactor);

  // Factor 3: Attack Pattern Detection
  const patternScore = detectedPatterns.length > 0 
    ? Math.min(detectedPatterns.reduce((sum, p) => sum + p.combinedRiskScore, 0) * 10, 100)
    : 0;
  const patternFactor: RiskFactor = {
    name: 'Attack Patterns',
    weight: 0.2,
    score: patternScore,
    description: detectedPatterns.length > 0 
      ? `${detectedPatterns.length} attack pattern(s) detected: ${detectedPatterns.map(p => p.name).join(', ')}`
      : 'No attack patterns detected',
  };
  factors.push(patternFactor);

  // Factor 4: Security Control Tampering
  const securityTampering = eventScores.filter(e => 
    e.matchedPattern && 
    ['antivirus_disabled', 'firewall_disabled', 'audit_log_cleared', 'log_deletion', 'audit_disabled', 'tamper_protection_disabled'].includes(e.matchedPattern)
  ).length;
  const securityFactor: RiskFactor = {
    name: 'Security Bypass',
    weight: 0.1,
    score: Math.min(securityTampering * 35, 100),
    description: `${securityTampering} security control tampering events`,
  };
  factors.push(securityFactor);

  // Factor 5: Event Velocity (events per hour)
  if (events.length >= 2) {
    const timeSpan = sortedEvents[sortedEvents.length - 1].timestamp.getTime() - sortedEvents[0].timestamp.getTime();
    const hours = Math.max(timeSpan / (1000 * 60 * 60), 0.1);
    const eventsPerHour = events.length / hours;
    const velocityScore = Math.min(eventsPerHour * 2, 100);
    const velocityFactor: RiskFactor = {
      name: 'Event Velocity',
      weight: 0.1,
      score: velocityScore,
      description: `${eventsPerHour.toFixed(1)} events/hour`,
    };
    factors.push(velocityFactor);
  }

  // ========================
  // Step 4: Calculate Overall Score
  // ========================
  
  let overallScore = factors.reduce((sum, f) => sum + (f.score * f.weight), 0);
  
  // Boost score if attack patterns detected
  if (detectedPatterns.length > 0) {
    const patternBoost = Math.max(...detectedPatterns.map(p => p.combinedRiskScore)) * 5;
    overallScore = Math.min(overallScore + patternBoost, 100);
  }

  overallScore = Math.round(Math.min(overallScore, 100));

  // ========================
  // Step 5: Determine Severity Level
  // ========================
  
  let severity: RiskAnalysis['severity'];
  if (overallScore >= 80 || detectedPatterns.some(p => p.combinedRiskScore === 10)) {
    severity = 'CRITICAL';
  } else if (overallScore >= 60) {
    severity = 'HIGH';
  } else if (overallScore >= 35) {
    severity = 'MEDIUM';
  } else {
    severity = 'LOW';
  }

  // ========================
  // Step 6: Generate Recommendations
  // ========================
  
  const recommendations = generateRecommendations(eventScores, factors, severity, detectedPatterns);

  return {
    overallScore,
    severity,
    factors,
    recommendations,
  };
}

// ========================
// PATTERN DETECTION HELPER
// ========================

function detectPatternMatch(
  events: TimelineEvent[],
  pattern: CombinationPattern,
  eventScores: { event: TimelineEvent; score: number; matchedPattern?: string }[]
): TimelineEvent[] {
  const matchedEvents: TimelineEvent[] = [];
  
  for (const requiredEvent of pattern.requiredEvents) {
    const matchingScores = eventScores.filter(es => es.matchedPattern === requiredEvent);
    if (matchingScores.length > 0) {
      matchedEvents.push(matchingScores[0].event);
    }
  }
  
  // Also check description/source for pattern keywords
  for (const event of events) {
    const eventText = `${event.description} ${event.source}`.toLowerCase();
    for (const requiredEvent of pattern.requiredEvents) {
      const keyword = requiredEvent.replace(/_/g, ' ').toLowerCase();
      if (eventText.includes(keyword) && !matchedEvents.includes(event)) {
        matchedEvents.push(event);
      }
    }
  }
  
  return matchedEvents;
}

// ========================
// RECOMMENDATION GENERATOR
// ========================

function generateRecommendations(
  eventScores: { event: TimelineEvent; score: number; matchedPattern?: string }[],
  factors: RiskFactor[],
  severity: RiskAnalysis['severity'],
  detectedPatterns: CombinationPattern[]
): string[] {
  const recommendations: string[] = [];

  // Pattern-specific recommendations
  for (const pattern of detectedPatterns) {
    switch (pattern.incidentType) {
      case 'DATA_EXFILTRATION':
        recommendations.push('URGENT: Investigate potential data exfiltration. Identify affected data and scope of breach.');
        recommendations.push('Review all USB device connections and file transfers in the timeline.');
        break;
      case 'CREDENTIAL_COMPROMISE':
        recommendations.push('URGENT: Reset all potentially compromised credentials immediately.');
        recommendations.push('Enable multi-factor authentication (MFA) for all accounts.');
        break;
      case 'ANTI_FORENSICS':
        recommendations.push('CRITICAL: Evidence tampering detected. Preserve remaining logs immediately.');
        recommendations.push('Engage forensic specialists to recover deleted data if possible.');
        break;
      case 'MALWARE_INFECTION':
        recommendations.push('URGENT: Isolate affected systems from the network immediately.');
        recommendations.push('Perform full malware scan with updated definitions on all systems.');
        break;
      case 'RANSOMWARE':
        recommendations.push('CRITICAL: Immediately isolate all affected systems to prevent spread.');
        recommendations.push('Do not pay ransom. Engage incident response team and law enforcement.');
        break;
      case 'PRIVILEGE_ESCALATION':
        recommendations.push('Review and revoke unauthorized privilege assignments.');
        recommendations.push('Audit all administrative accounts and their recent activities.');
        break;
      case 'INSIDER_THREAT':
        recommendations.push('URGENT: Investigate user activities and data access patterns.');
        recommendations.push('Review HR and legal obligations before confronting suspected insider.');
        break;
      default:
        recommendations.push(`Investigate ${pattern.name} pattern thoroughly.`);
    }
  }

  // Security control recommendations
  const securityFactor = factors.find(f => f.name === 'Security Bypass');
  if (securityFactor && securityFactor.score > 0) {
    recommendations.push('Re-enable all disabled security controls immediately.');
    recommendations.push('Investigate who disabled security controls and when.');
  }

  // Critical event recommendations
  const criticalFactor = factors.find(f => f.name === 'Critical Events');
  if (criticalFactor && criticalFactor.score > 50) {
    recommendations.push('Prioritize investigation of all critical-severity events.');
    recommendations.push('Create a detailed timeline of critical events for legal documentation.');
  }

  // Severity-based recommendations
  if (severity === 'CRITICAL') {
    recommendations.push('Initiate full incident response procedures.');
    recommendations.push('Document all findings and maintain chain of custody for evidence.');
    recommendations.push('Notify relevant stakeholders and consider legal/regulatory reporting requirements.');
  } else if (severity === 'HIGH') {
    recommendations.push('Conduct immediate security review of affected systems.');
    recommendations.push('Increase monitoring and logging on potentially compromised systems.');
  } else if (severity === 'MEDIUM') {
    recommendations.push('Schedule investigation within 24-48 hours.');
    recommendations.push('Review access controls and authentication policies.');
  } else {
    recommendations.push('Continue standard security monitoring procedures.');
    recommendations.push('Ensure all systems are patched and up to date.');
  }

  // Deduplicate and limit
  const uniqueRecs = [...new Set(recommendations)];
  return uniqueRecs.slice(0, 6);
}
