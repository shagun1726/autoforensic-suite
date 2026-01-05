/**
 * Forensic Risk Scoring Framework
 * Comprehensive risk assessment for digital forensics log analysis
 * 
 * Risk Score Range: 0-10
 * - 0-2: Very Low (Informational/Normal Activity)
 * - 3-4: Low (Minor Concern, Monitor)
 * - 5-6: Medium (Investigate Soon)
 * - 7-8: High (Immediate Investigation Required)
 * - 9-10: Critical (Active Threat/Breach)
 */

// ========================
// RISK LEVEL DEFINITIONS
// ========================

export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskLevelConfig {
  level: RiskLevel;
  minScore: number;
  maxScore: number;
  label: string;
  color: string;
  description: string;
}

export const RISK_LEVELS: RiskLevelConfig[] = [
  { level: 'VERY_LOW', minScore: 0, maxScore: 2, label: 'Very Low', color: 'emerald', description: 'Normal operational activity, no security concern' },
  { level: 'LOW', minScore: 3, maxScore: 4, label: 'Low', color: 'blue', description: 'Minor anomaly, routine monitoring recommended' },
  { level: 'MEDIUM', minScore: 5, maxScore: 6, label: 'Medium', color: 'yellow', description: 'Notable concern, investigation within 24-48 hours' },
  { level: 'HIGH', minScore: 7, maxScore: 8, label: 'High', color: 'orange', description: 'Serious threat indicator, immediate investigation required' },
  { level: 'CRITICAL', minScore: 9, maxScore: 10, label: 'Critical', color: 'red', description: 'Active threat or confirmed breach, immediate response required' },
];

// ========================
// EVENT CATEGORY DEFINITIONS
// ========================

export type EventCategory = 
  | 'SYSTEM'
  | 'AUTHENTICATION'
  | 'FILE_SYSTEM'
  | 'USB_DEVICE'
  | 'NETWORK'
  | 'SECURITY_CONTROL'
  | 'PROCESS_MALWARE'
  | 'CLOUD_REMOTE'
  | 'INFORMATIONAL';

// ========================
// INDIVIDUAL EVENT RISK SCORES
// ========================

export interface EventRiskScore {
  eventName: string;
  description: string;
  riskScore: number;
  category: EventCategory;
  forensicRelevance: string;
}

// 1. SYSTEM EVENTS (0-6 range typically)
export const SYSTEM_EVENTS: EventRiskScore[] = [
  { eventName: 'system_boot', description: 'Normal system startup', riskScore: 1, category: 'SYSTEM', forensicRelevance: 'Establishes timeline, normal operation' },
  { eventName: 'system_shutdown', description: 'Normal system shutdown', riskScore: 1, category: 'SYSTEM', forensicRelevance: 'Timeline marker, normal operation' },
  { eventName: 'scheduled_restart', description: 'Planned system restart', riskScore: 1, category: 'SYSTEM', forensicRelevance: 'Normal maintenance activity' },
  { eventName: 'system_idle', description: 'System in idle state', riskScore: 0, category: 'SYSTEM', forensicRelevance: 'Normal operational state' },
  { eventName: 'unexpected_shutdown', description: 'Unplanned system shutdown', riskScore: 5, category: 'SYSTEM', forensicRelevance: 'May indicate attack, crash, or power issue' },
  { eventName: 'system_crash', description: 'System crash/BSOD/kernel panic', riskScore: 6, category: 'SYSTEM', forensicRelevance: 'Potential exploit attempt or system instability' },
  { eventName: 'boot_anomaly', description: 'Unusual boot sequence detected', riskScore: 7, category: 'SYSTEM', forensicRelevance: 'May indicate rootkit or bootloader tampering' },
  { eventName: 'safe_mode_boot', description: 'System booted in safe mode', riskScore: 4, category: 'SYSTEM', forensicRelevance: 'Potential recovery from attack or troubleshooting' },
  { eventName: 'bios_change', description: 'BIOS/UEFI configuration modified', riskScore: 8, category: 'SYSTEM', forensicRelevance: 'Critical - may indicate firmware-level attack' },
];

// 2. USER & AUTHENTICATION EVENTS (3-10 range)
export const AUTHENTICATION_EVENTS: EventRiskScore[] = [
  { eventName: 'login_success', description: 'Successful user login', riskScore: 1, category: 'AUTHENTICATION', forensicRelevance: 'Normal activity, establishes user session' },
  { eventName: 'logout', description: 'User logout', riskScore: 0, category: 'AUTHENTICATION', forensicRelevance: 'Normal session termination' },
  { eventName: 'login_failed', description: 'Single failed login attempt', riskScore: 3, category: 'AUTHENTICATION', forensicRelevance: 'Possible typo or unauthorized attempt' },
  { eventName: 'login_failed_invalid_user', description: 'Failed login - user does not exist', riskScore: 5, category: 'AUTHENTICATION', forensicRelevance: 'Account enumeration or targeted attack' },
  { eventName: 'login_failed_multiple', description: '3-5 consecutive failed attempts', riskScore: 6, category: 'AUTHENTICATION', forensicRelevance: 'Potential password guessing attack' },
  { eventName: 'brute_force_detected', description: '10+ failed attempts in short period', riskScore: 9, category: 'AUTHENTICATION', forensicRelevance: 'Active brute force attack in progress' },
  { eventName: 'login_after_hours', description: 'Login outside normal business hours', riskScore: 5, category: 'AUTHENTICATION', forensicRelevance: 'May indicate unauthorized access' },
  { eventName: 'login_new_location', description: 'Login from new geographic location', riskScore: 6, category: 'AUTHENTICATION', forensicRelevance: 'Possible account compromise' },
  { eventName: 'privilege_escalation', description: 'User gained elevated privileges', riskScore: 8, category: 'AUTHENTICATION', forensicRelevance: 'Critical - unauthorized admin access attempt' },
  { eventName: 'sudo_command', description: 'Sudo/admin command executed', riskScore: 4, category: 'AUTHENTICATION', forensicRelevance: 'Privileged action, verify authorization' },
  { eventName: 'account_created', description: 'New user account created', riskScore: 5, category: 'AUTHENTICATION', forensicRelevance: 'Verify authorization, may be backdoor creation' },
  { eventName: 'account_deleted', description: 'User account deleted', riskScore: 6, category: 'AUTHENTICATION', forensicRelevance: 'Evidence destruction or unauthorized action' },
  { eventName: 'password_change', description: 'Password changed', riskScore: 4, category: 'AUTHENTICATION', forensicRelevance: 'May be legitimate or attacker locking out owner' },
  { eventName: 'account_lockout', description: 'Account locked due to failed attempts', riskScore: 7, category: 'AUTHENTICATION', forensicRelevance: 'Indicates active attack on specific account' },
  { eventName: 'session_hijack', description: 'Possible session hijacking detected', riskScore: 10, category: 'AUTHENTICATION', forensicRelevance: 'Critical - active compromise' },
];

// 3. FILE SYSTEM EVENTS (2-9 range)
export const FILE_SYSTEM_EVENTS: EventRiskScore[] = [
  { eventName: 'file_read', description: 'Normal file read operation', riskScore: 1, category: 'FILE_SYSTEM', forensicRelevance: 'Normal activity' },
  { eventName: 'file_create', description: 'New file created', riskScore: 2, category: 'FILE_SYSTEM', forensicRelevance: 'Normal activity, note for timeline' },
  { eventName: 'file_modify', description: 'File content modified', riskScore: 3, category: 'FILE_SYSTEM', forensicRelevance: 'Track changes to important files' },
  { eventName: 'file_rename', description: 'File renamed', riskScore: 2, category: 'FILE_SYSTEM', forensicRelevance: 'May indicate obfuscation attempt' },
  { eventName: 'file_copy', description: 'File copied', riskScore: 3, category: 'FILE_SYSTEM', forensicRelevance: 'Note destination, possible exfiltration prep' },
  { eventName: 'file_delete', description: 'File deleted', riskScore: 4, category: 'FILE_SYSTEM', forensicRelevance: 'Evidence destruction possibility' },
  { eventName: 'sensitive_file_access', description: 'Access to sensitive/confidential file', riskScore: 6, category: 'FILE_SYSTEM', forensicRelevance: 'Verify authorization, note access pattern' },
  { eventName: 'config_file_modify', description: 'System configuration file modified', riskScore: 7, category: 'FILE_SYSTEM', forensicRelevance: 'May indicate system tampering' },
  { eventName: 'mass_file_deletion', description: 'Multiple files deleted rapidly', riskScore: 9, category: 'FILE_SYSTEM', forensicRelevance: 'Ransomware or evidence destruction' },
  { eventName: 'mass_file_encryption', description: 'Multiple files encrypted', riskScore: 10, category: 'FILE_SYSTEM', forensicRelevance: 'Critical - active ransomware attack' },
  { eventName: 'executable_created', description: 'New executable file created', riskScore: 6, category: 'FILE_SYSTEM', forensicRelevance: 'Potential malware dropper' },
  { eventName: 'hidden_file_created', description: 'Hidden file/folder created', riskScore: 5, category: 'FILE_SYSTEM', forensicRelevance: 'May indicate covert activity' },
  { eventName: 'permission_change', description: 'File/folder permissions modified', riskScore: 5, category: 'FILE_SYSTEM', forensicRelevance: 'Possible privilege escalation prep' },
  { eventName: 'archive_created', description: 'Archive file (zip/tar) created', riskScore: 4, category: 'FILE_SYSTEM', forensicRelevance: 'Possible data staging for exfiltration' },
];

// 4. USB / EXTERNAL DEVICE EVENTS (4-9 range)
export const USB_DEVICE_EVENTS: EventRiskScore[] = [
  { eventName: 'usb_insert', description: 'USB device connected', riskScore: 4, category: 'USB_DEVICE', forensicRelevance: 'Note device ID, potential data movement' },
  { eventName: 'usb_mount', description: 'USB storage mounted', riskScore: 4, category: 'USB_DEVICE', forensicRelevance: 'Storage now accessible, monitor file ops' },
  { eventName: 'usb_unmount', description: 'USB storage unmounted', riskScore: 3, category: 'USB_DEVICE', forensicRelevance: 'Timeline marker, correlate with file access' },
  { eventName: 'usb_remove', description: 'USB device removed', riskScore: 3, category: 'USB_DEVICE', forensicRelevance: 'Timeline marker for data exfiltration analysis' },
  { eventName: 'usb_file_copy_to', description: 'File copied TO USB device', riskScore: 7, category: 'USB_DEVICE', forensicRelevance: 'Potential data exfiltration' },
  { eventName: 'usb_file_copy_from', description: 'File copied FROM USB device', riskScore: 5, category: 'USB_DEVICE', forensicRelevance: 'Potential malware introduction' },
  { eventName: 'unknown_usb_device', description: 'Unknown/unauthorized USB connected', riskScore: 8, category: 'USB_DEVICE', forensicRelevance: 'Unauthorized device, high exfil risk' },
  { eventName: 'usb_autorun', description: 'USB autorun executed', riskScore: 9, category: 'USB_DEVICE', forensicRelevance: 'Critical - potential malware execution' },
  { eventName: 'mass_usb_copy', description: 'Large amount of data copied to USB', riskScore: 9, category: 'USB_DEVICE', forensicRelevance: 'Critical - likely data theft' },
  { eventName: 'usb_badusb_detected', description: 'Malicious USB device detected', riskScore: 10, category: 'USB_DEVICE', forensicRelevance: 'Critical - BadUSB/Rubber Ducky attack' },
];

// 5. NETWORK EVENTS (3-10 range)
export const NETWORK_EVENTS: EventRiskScore[] = [
  { eventName: 'network_connection', description: 'Normal network connection', riskScore: 1, category: 'NETWORK', forensicRelevance: 'Normal activity' },
  { eventName: 'external_connection', description: 'Connection to external IP', riskScore: 3, category: 'NETWORK', forensicRelevance: 'Note destination, verify legitimacy' },
  { eventName: 'dns_query', description: 'DNS lookup performed', riskScore: 1, category: 'NETWORK', forensicRelevance: 'Normal activity, may reveal intent' },
  { eventName: 'suspicious_port', description: 'Connection on unusual port', riskScore: 6, category: 'NETWORK', forensicRelevance: 'May indicate tunneling or backdoor' },
  { eventName: 'port_scan_detected', description: 'Port scanning activity detected', riskScore: 7, category: 'NETWORK', forensicRelevance: 'Reconnaissance activity' },
  { eventName: 'data_upload_large', description: 'Large data upload detected', riskScore: 7, category: 'NETWORK', forensicRelevance: 'Potential data exfiltration' },
  { eventName: 'data_download_large', description: 'Large data download detected', riskScore: 5, category: 'NETWORK', forensicRelevance: 'May be malware or tools download' },
  { eventName: 'c2_communication', description: 'Command & Control traffic detected', riskScore: 10, category: 'NETWORK', forensicRelevance: 'Critical - active malware communication' },
  { eventName: 'dns_tunneling', description: 'DNS tunneling detected', riskScore: 9, category: 'NETWORK', forensicRelevance: 'Data exfiltration via DNS' },
  { eventName: 'tor_connection', description: 'Tor network connection', riskScore: 7, category: 'NETWORK', forensicRelevance: 'Anonymous communication, verify policy' },
  { eventName: 'vpn_connection', description: 'VPN connection established', riskScore: 4, category: 'NETWORK', forensicRelevance: 'May be legitimate or evasion' },
  { eventName: 'known_malicious_ip', description: 'Connection to known malicious IP', riskScore: 10, category: 'NETWORK', forensicRelevance: 'Critical - confirmed threat communication' },
  { eventName: 'lateral_movement', description: 'Connection to internal system', riskScore: 6, category: 'NETWORK', forensicRelevance: 'May indicate lateral movement' },
  { eventName: 'smb_connection', description: 'SMB/file share connection', riskScore: 4, category: 'NETWORK', forensicRelevance: 'Common attack vector, verify legitimacy' },
];

// 6. SECURITY CONTROL EVENTS (5-10 range)
export const SECURITY_CONTROL_EVENTS: EventRiskScore[] = [
  { eventName: 'antivirus_scan', description: 'Antivirus scan completed', riskScore: 1, category: 'SECURITY_CONTROL', forensicRelevance: 'Normal security operation' },
  { eventName: 'antivirus_update', description: 'Antivirus definitions updated', riskScore: 1, category: 'SECURITY_CONTROL', forensicRelevance: 'Normal maintenance' },
  { eventName: 'antivirus_disabled', description: 'Antivirus protection disabled', riskScore: 9, category: 'SECURITY_CONTROL', forensicRelevance: 'Critical - security control bypass' },
  { eventName: 'firewall_disabled', description: 'Firewall disabled', riskScore: 9, category: 'SECURITY_CONTROL', forensicRelevance: 'Critical - network protection removed' },
  { eventName: 'firewall_rule_added', description: 'New firewall rule created', riskScore: 6, category: 'SECURITY_CONTROL', forensicRelevance: 'Verify authorization, may allow C2' },
  { eventName: 'security_policy_change', description: 'Security policy modified', riskScore: 7, category: 'SECURITY_CONTROL', forensicRelevance: 'May weaken security posture' },
  { eventName: 'audit_log_cleared', description: 'Audit/security logs cleared', riskScore: 10, category: 'SECURITY_CONTROL', forensicRelevance: 'Critical - evidence destruction' },
  { eventName: 'log_deletion', description: 'Log files deleted', riskScore: 10, category: 'SECURITY_CONTROL', forensicRelevance: 'Critical - evidence tampering' },
  { eventName: 'audit_disabled', description: 'Audit logging disabled', riskScore: 9, category: 'SECURITY_CONTROL', forensicRelevance: 'Critical - attempt to hide activity' },
  { eventName: 'defender_exclusion', description: 'Security exclusion added', riskScore: 7, category: 'SECURITY_CONTROL', forensicRelevance: 'May allow malware execution' },
  { eventName: 'tamper_protection_disabled', description: 'Tamper protection disabled', riskScore: 10, category: 'SECURITY_CONTROL', forensicRelevance: 'Critical - security bypass' },
];

// 7. PROCESS & MALWARE EVENTS (4-10 range)
export const PROCESS_MALWARE_EVENTS: EventRiskScore[] = [
  { eventName: 'process_start', description: 'Normal process started', riskScore: 1, category: 'PROCESS_MALWARE', forensicRelevance: 'Normal activity' },
  { eventName: 'process_end', description: 'Process terminated', riskScore: 1, category: 'PROCESS_MALWARE', forensicRelevance: 'Normal activity' },
  { eventName: 'unknown_process', description: 'Unknown process executed', riskScore: 6, category: 'PROCESS_MALWARE', forensicRelevance: 'Investigate origin and purpose' },
  { eventName: 'script_execution', description: 'Script (PS/VBS/JS) executed', riskScore: 5, category: 'PROCESS_MALWARE', forensicRelevance: 'Common attack vector, review content' },
  { eventName: 'powershell_encoded', description: 'Encoded PowerShell command', riskScore: 8, category: 'PROCESS_MALWARE', forensicRelevance: 'High malware indicator' },
  { eventName: 'malware_detected', description: 'Malware detected by AV', riskScore: 9, category: 'PROCESS_MALWARE', forensicRelevance: 'Confirmed threat, verify remediation' },
  { eventName: 'ransomware_behavior', description: 'Ransomware behavior detected', riskScore: 10, category: 'PROCESS_MALWARE', forensicRelevance: 'Critical - immediate isolation required' },
  { eventName: 'process_injection', description: 'Process injection detected', riskScore: 9, category: 'PROCESS_MALWARE', forensicRelevance: 'Advanced attack technique' },
  { eventName: 'dll_hijack', description: 'DLL hijacking detected', riskScore: 9, category: 'PROCESS_MALWARE', forensicRelevance: 'Persistence mechanism' },
  { eventName: 'memory_manipulation', description: 'Memory manipulation detected', riskScore: 8, category: 'PROCESS_MALWARE', forensicRelevance: 'Fileless malware indicator' },
  { eventName: 'scheduled_task_created', description: 'Scheduled task created', riskScore: 5, category: 'PROCESS_MALWARE', forensicRelevance: 'Persistence mechanism, verify legitimacy' },
  { eventName: 'registry_run_key', description: 'Run key added to registry', riskScore: 7, category: 'PROCESS_MALWARE', forensicRelevance: 'Persistence mechanism' },
  { eventName: 'rootkit_detected', description: 'Rootkit detected', riskScore: 10, category: 'PROCESS_MALWARE', forensicRelevance: 'Critical - deep system compromise' },
  { eventName: 'keylogger_detected', description: 'Keylogger activity detected', riskScore: 10, category: 'PROCESS_MALWARE', forensicRelevance: 'Critical - credential theft' },
];

// 8. CLOUD / REMOTE ACCESS EVENTS (3-9 range)
export const CLOUD_REMOTE_EVENTS: EventRiskScore[] = [
  { eventName: 'remote_login', description: 'Remote desktop/SSH login', riskScore: 4, category: 'CLOUD_REMOTE', forensicRelevance: 'Verify source IP and authorization' },
  { eventName: 'rdp_connection', description: 'RDP connection established', riskScore: 5, category: 'CLOUD_REMOTE', forensicRelevance: 'Common attack vector, verify legitimacy' },
  { eventName: 'ssh_connection', description: 'SSH connection established', riskScore: 4, category: 'CLOUD_REMOTE', forensicRelevance: 'Verify source and authorization' },
  { eventName: 'vpn_login', description: 'VPN login', riskScore: 3, category: 'CLOUD_REMOTE', forensicRelevance: 'Remote access, verify credentials' },
  { eventName: 'cloud_file_access', description: 'Cloud storage file accessed', riskScore: 3, category: 'CLOUD_REMOTE', forensicRelevance: 'Note file and user context' },
  { eventName: 'cloud_file_share', description: 'Cloud file shared externally', riskScore: 6, category: 'CLOUD_REMOTE', forensicRelevance: 'Potential data leak' },
  { eventName: 'cloud_mass_download', description: 'Mass download from cloud', riskScore: 8, category: 'CLOUD_REMOTE', forensicRelevance: 'Potential data exfiltration' },
  { eventName: 'cloud_api_access', description: 'Cloud API access', riskScore: 4, category: 'CLOUD_REMOTE', forensicRelevance: 'Automated access, verify authorization' },
  { eventName: 'remote_tool_execution', description: 'Remote admin tool used', riskScore: 7, category: 'CLOUD_REMOTE', forensicRelevance: 'Common attack tool (PSExec, etc.)' },
  { eventName: 'cloud_config_change', description: 'Cloud configuration modified', riskScore: 7, category: 'CLOUD_REMOTE', forensicRelevance: 'May affect security posture' },
  { eventName: 'oauth_token_created', description: 'OAuth token/app authorized', riskScore: 5, category: 'CLOUD_REMOTE', forensicRelevance: 'Third-party access granted' },
];

// 9. INFORMATIONAL / NORMAL EVENTS (0-2 range)
export const INFORMATIONAL_EVENTS: EventRiskScore[] = [
  { eventName: 'info_log', description: 'Informational log entry', riskScore: 0, category: 'INFORMATIONAL', forensicRelevance: 'Normal operation logging' },
  { eventName: 'debug_log', description: 'Debug log entry', riskScore: 0, category: 'INFORMATIONAL', forensicRelevance: 'Development/diagnostic info' },
  { eventName: 'config_read', description: 'Configuration file read', riskScore: 1, category: 'INFORMATIONAL', forensicRelevance: 'Normal application behavior' },
  { eventName: 'service_start', description: 'Service started', riskScore: 1, category: 'INFORMATIONAL', forensicRelevance: 'Normal system operation' },
  { eventName: 'service_stop', description: 'Service stopped', riskScore: 2, category: 'INFORMATIONAL', forensicRelevance: 'May be normal or deliberate disable' },
  { eventName: 'backup_created', description: 'Backup completed', riskScore: 1, category: 'INFORMATIONAL', forensicRelevance: 'Normal maintenance' },
  { eventName: 'update_installed', description: 'System update installed', riskScore: 1, category: 'INFORMATIONAL', forensicRelevance: 'Normal maintenance' },
  { eventName: 'application_start', description: 'Application launched', riskScore: 1, category: 'INFORMATIONAL', forensicRelevance: 'Normal user activity' },
];

// ========================
// ALL EVENTS COMBINED
// ========================

export const ALL_EVENT_RISK_SCORES: EventRiskScore[] = [
  ...SYSTEM_EVENTS,
  ...AUTHENTICATION_EVENTS,
  ...FILE_SYSTEM_EVENTS,
  ...USB_DEVICE_EVENTS,
  ...NETWORK_EVENTS,
  ...SECURITY_CONTROL_EVENTS,
  ...PROCESS_MALWARE_EVENTS,
  ...CLOUD_REMOTE_EVENTS,
  ...INFORMATIONAL_EVENTS,
];

// ========================
// COMBINATION-BASED RISK PATTERNS
// ========================

export interface CombinationPattern {
  id: string;
  name: string;
  description: string;
  requiredEvents: string[];
  timeWindowMinutes: number;
  combinedRiskScore: number;
  incidentType: string;
  forensicSignificance: string;
}

export const COMBINATION_PATTERNS: CombinationPattern[] = [
  // Data Exfiltration Patterns
  {
    id: 'USB_EXFIL_PATTERN',
    name: 'USB Data Exfiltration',
    description: 'USB insertion followed by sensitive file access and USB removal',
    requiredEvents: ['usb_insert', 'sensitive_file_access', 'usb_file_copy_to', 'usb_remove'],
    timeWindowMinutes: 30,
    combinedRiskScore: 10,
    incidentType: 'DATA_EXFILTRATION',
    forensicSignificance: 'Strong indicator of deliberate data theft via removable media',
  },
  {
    id: 'CLOUD_EXFIL_PATTERN',
    name: 'Cloud Data Exfiltration',
    description: 'Mass file archive creation followed by cloud upload',
    requiredEvents: ['archive_created', 'cloud_file_share'],
    timeWindowMinutes: 60,
    combinedRiskScore: 9,
    incidentType: 'DATA_EXFILTRATION',
    forensicSignificance: 'Data staging and exfiltration via cloud services',
  },
  
  // Brute Force Patterns
  {
    id: 'BRUTE_FORCE_PATTERN',
    name: 'Brute Force Attack',
    description: 'Multiple failed login attempts followed by successful login',
    requiredEvents: ['login_failed_multiple', 'login_success'],
    timeWindowMinutes: 15,
    combinedRiskScore: 10,
    incidentType: 'CREDENTIAL_COMPROMISE',
    forensicSignificance: 'Successful brute force attack - account compromised',
  },
  {
    id: 'PASSWORD_SPRAY_PATTERN',
    name: 'Password Spray Attack',
    description: 'Failed logins across multiple accounts in short period',
    requiredEvents: ['login_failed_invalid_user', 'login_failed'],
    timeWindowMinutes: 10,
    combinedRiskScore: 8,
    incidentType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    forensicSignificance: 'Coordinated credential guessing attack',
  },
  
  // Evidence Tampering Patterns
  {
    id: 'EVIDENCE_DESTRUCTION_PATTERN',
    name: 'Evidence Destruction',
    description: 'File deletion combined with log deletion',
    requiredEvents: ['file_delete', 'log_deletion'],
    timeWindowMinutes: 60,
    combinedRiskScore: 10,
    incidentType: 'ANTI_FORENSICS',
    forensicSignificance: 'Critical - deliberate evidence destruction',
  },
  {
    id: 'AUDIT_EVASION_PATTERN',
    name: 'Audit Evasion',
    description: 'Audit logging disabled followed by suspicious activity',
    requiredEvents: ['audit_disabled', 'unknown_process'],
    timeWindowMinutes: 30,
    combinedRiskScore: 10,
    incidentType: 'ANTI_FORENSICS',
    forensicSignificance: 'Deliberate attempt to hide malicious activity',
  },
  
  // Malware Execution Patterns
  {
    id: 'AV_BYPASS_MALWARE_PATTERN',
    name: 'Security Bypass + Malware',
    description: 'Antivirus disabled followed by unknown process execution',
    requiredEvents: ['antivirus_disabled', 'unknown_process'],
    timeWindowMinutes: 30,
    combinedRiskScore: 10,
    incidentType: 'MALWARE_INFECTION',
    forensicSignificance: 'Security control bypass preceding malware execution',
  },
  {
    id: 'DROPPER_EXECUTION_PATTERN',
    name: 'Malware Dropper Execution',
    description: 'Script execution followed by executable creation and process start',
    requiredEvents: ['script_execution', 'executable_created', 'unknown_process'],
    timeWindowMinutes: 5,
    combinedRiskScore: 9,
    incidentType: 'MALWARE_INFECTION',
    forensicSignificance: 'Classic malware dropper behavior chain',
  },
  
  // Privilege Escalation Patterns
  {
    id: 'PRIV_ESC_PATTERN',
    name: 'Privilege Escalation Chain',
    description: 'Normal login followed by privilege escalation and config changes',
    requiredEvents: ['login_success', 'privilege_escalation', 'config_file_modify'],
    timeWindowMinutes: 60,
    combinedRiskScore: 10,
    incidentType: 'PRIVILEGE_ESCALATION',
    forensicSignificance: 'Unauthorized elevation and system modification',
  },
  {
    id: 'ACCOUNT_TAKEOVER_PATTERN',
    name: 'Account Takeover',
    description: 'Login from new location followed by password change',
    requiredEvents: ['login_new_location', 'password_change'],
    timeWindowMinutes: 30,
    combinedRiskScore: 9,
    incidentType: 'ACCOUNT_COMPROMISE',
    forensicSignificance: 'Account taken over and credentials changed',
  },
  
  // Lateral Movement Patterns
  {
    id: 'LATERAL_MOVEMENT_PATTERN',
    name: 'Lateral Movement',
    description: 'Remote tool execution followed by connection to internal systems',
    requiredEvents: ['remote_tool_execution', 'lateral_movement', 'smb_connection'],
    timeWindowMinutes: 30,
    combinedRiskScore: 9,
    incidentType: 'LATERAL_MOVEMENT',
    forensicSignificance: 'Attacker moving through network',
  },
  
  // Ransomware Patterns
  {
    id: 'RANSOMWARE_PATTERN',
    name: 'Ransomware Attack',
    description: 'Mass file encryption following security control disable',
    requiredEvents: ['antivirus_disabled', 'mass_file_encryption'],
    timeWindowMinutes: 60,
    combinedRiskScore: 10,
    incidentType: 'RANSOMWARE',
    forensicSignificance: 'Critical - active ransomware encryption in progress',
  },
  
  // C2 Communication Patterns
  {
    id: 'C2_ESTABLISHMENT_PATTERN',
    name: 'C2 Channel Establishment',
    description: 'Unknown process followed by C2 communication',
    requiredEvents: ['unknown_process', 'c2_communication'],
    timeWindowMinutes: 15,
    combinedRiskScore: 10,
    incidentType: 'MALWARE_COMMUNICATION',
    forensicSignificance: 'Critical - malware actively communicating with attacker',
  },
  {
    id: 'DNS_EXFIL_PATTERN',
    name: 'DNS Exfiltration',
    description: 'Sensitive file access followed by DNS tunneling',
    requiredEvents: ['sensitive_file_access', 'dns_tunneling'],
    timeWindowMinutes: 30,
    combinedRiskScore: 10,
    incidentType: 'DATA_EXFILTRATION',
    forensicSignificance: 'Data exfiltration via covert DNS channel',
  },
  
  // Insider Threat Patterns
  {
    id: 'INSIDER_THREAT_PATTERN',
    name: 'Insider Threat Activity',
    description: 'After-hours login with sensitive file access and USB copy',
    requiredEvents: ['login_after_hours', 'sensitive_file_access', 'usb_file_copy_to'],
    timeWindowMinutes: 120,
    combinedRiskScore: 10,
    incidentType: 'INSIDER_THREAT',
    forensicSignificance: 'Strong insider threat indicator - deliberate data theft',
  },
];

// ========================
// HELPER FUNCTIONS
// ========================

export function getRiskLevel(score: number): RiskLevelConfig {
  for (const level of RISK_LEVELS) {
    if (score >= level.minScore && score <= level.maxScore) {
      return level;
    }
  }
  return RISK_LEVELS[0]; // Default to Very Low
}

export function getEventRiskScore(eventName: string): EventRiskScore | undefined {
  return ALL_EVENT_RISK_SCORES.find(e => e.eventName === eventName);
}

export function getEventsByCategory(category: EventCategory): EventRiskScore[] {
  return ALL_EVENT_RISK_SCORES.filter(e => e.category === category);
}

export function getHighRiskEvents(minScore: number = 7): EventRiskScore[] {
  return ALL_EVENT_RISK_SCORES.filter(e => e.riskScore >= minScore);
}

export function getCriticalEvents(): EventRiskScore[] {
  return ALL_EVENT_RISK_SCORES.filter(e => e.riskScore >= 9);
}

// Convert 0-10 score to 0-100 for display
export function normalizeScoreToPercent(score: number): number {
  return Math.round((score / 10) * 100);
}

// Convert 0-100 score to 0-10 for internal use
export function normalizeScoreToTen(score: number): number {
  return Math.round((score / 100) * 10);
}
