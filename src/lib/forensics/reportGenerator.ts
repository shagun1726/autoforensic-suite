/**
 * Report Generation Module
 * Generates PDF forensic investigation reports
 */

import jsPDF from 'jspdf';
import { ForensicCase, ForensicReport, TimelineEvent } from './types';
import { getIncidentTypeLabel } from './incidentClassifier';

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateReport(caseData: ForensicCase): ForensicReport {
  return {
    caseId: caseData.id,
    generatedAt: new Date(),
    title: 'Digital Forensic Investigation Report',
    caseSummary: `Forensic analysis of ${caseData.fileName} (${(caseData.fileSize / 1024).toFixed(2)} KB) containing ${caseData.parsedLogs.length} log entries.`,
    incidentType: getIncidentTypeLabel(caseData.incidentClassification.type),
    severity: caseData.riskAnalysis.severity,
    riskScore: caseData.riskAnalysis.overallScore,
    evidenceHash: caseData.fileHash,
    timeline: caseData.timeline,
    observations: caseData.observations,
    conclusion: caseData.conclusion,
    generatedBy: 'AutoForensic - Automated Digital Forensics System',
  };
}

export function generatePDF(report: ForensicReport): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;
  
  const addNewPageIfNeeded = (requiredHeight: number) => {
    if (y + requiredHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };
  
  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(0, 212, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTOFORENSIC', margin, 22);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Digital Forensic Investigation Report', margin, 32);
  
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${formatDate(report.generatedAt)}`, margin, 40);
  
  y = 55;
  
  // Case Summary Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CASE SUMMARY', margin, y);
  y += 8;
  
  doc.setDrawColor(0, 212, 255);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 40, y);
  y += 8;
  
  // Case details table
  const details = [
    ['Case ID:', report.caseId],
    ['Incident Type:', report.incidentType],
    ['Severity:', report.severity],
    ['Risk Score:', `${report.riskScore}/100`],
  ];
  
  doc.setFontSize(10);
  for (const [label, value] of details) {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 35, y);
    y += 6;
  }
  
  y += 5;
  
  // Case Summary Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(report.caseSummary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 10;
  
  // Evidence Integrity Section
  addNewPageIfNeeded(30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EVIDENCE INTEGRITY', margin, y);
  y += 8;
  
  doc.setDrawColor(0, 212, 255);
  doc.line(margin, y, margin + 50, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SHA-256 Hash:', margin, y);
  y += 6;
  
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text(report.evidenceHash, margin, y);
  y += 12;
  
  // Incident Timeline Section
  addNewPageIfNeeded(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INCIDENT TIMELINE', margin, y);
  y += 8;
  
  doc.setDrawColor(0, 212, 255);
  doc.line(margin, y, margin + 50, y);
  y += 8;
  
  doc.setFontSize(9);
  const significantEvents = report.timeline.filter(
    e => e.severity === 'high' || e.severity === 'critical'
  ).slice(0, 15);
  
  const eventsToShow = significantEvents.length > 0 ? significantEvents : report.timeline.slice(0, 10);
  
  for (const event of eventsToShow) {
    addNewPageIfNeeded(15);
    
    // Severity indicator
    const severityColors: Record<string, [number, number, number]> = {
      critical: [239, 68, 68],
      high: [249, 115, 22],
      medium: [234, 179, 8],
      low: [34, 197, 94],
    };
    const [r, g, b] = severityColors[event.severity] || [100, 100, 100];
    
    doc.setFillColor(r, g, b);
    doc.circle(margin + 2, y - 1.5, 2, 'F');
    
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(formatShortDate(event.timestamp), margin + 8, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    const descLines = doc.splitTextToSize(event.description, contentWidth - 60);
    doc.text(descLines[0].substring(0, 80), margin + 45, y);
    y += 7;
  }
  
  if (report.timeline.length > eventsToShow.length) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`... and ${report.timeline.length - eventsToShow.length} more events`, margin, y);
    y += 8;
  }
  
  y += 5;
  
  // Observations Section
  addNewPageIfNeeded(40);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('OBSERVATIONS', margin, y);
  y += 8;
  
  doc.setDrawColor(0, 212, 255);
  doc.line(margin, y, margin + 40, y);
  y += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  for (const observation of report.observations) {
    addNewPageIfNeeded(12);
    doc.setFillColor(0, 212, 255);
    doc.circle(margin + 2, y - 1.5, 1.5, 'F');
    
    const obsLines = doc.splitTextToSize(observation, contentWidth - 10);
    doc.text(obsLines, margin + 8, y);
    y += obsLines.length * 5 + 3;
  }
  
  y += 5;
  
  // Conclusion Section
  addNewPageIfNeeded(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CONCLUSION', margin, y);
  y += 8;
  
  doc.setDrawColor(0, 212, 255);
  doc.line(margin, y, margin + 35, y);
  y += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const conclusionLines = doc.splitTextToSize(report.conclusion, contentWidth);
  doc.text(conclusionLines, margin, y);
  y += conclusionLines.length * 5 + 10;
  
  // Recommendations
  addNewPageIfNeeded(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Recommendations:', margin, y);
  y += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Get recommendations from the case (we'll need to pass these through)
  const defaultRecommendations = [
    'Continue monitoring affected systems for unusual activity.',
    'Review and update security policies as needed.',
    'Document all findings for future reference.',
  ];
  
  for (const rec of defaultRecommendations) {
    addNewPageIfNeeded(10);
    doc.text(`• ${rec}`, margin + 5, y);
    y += 6;
  }
  
  // Footer on last page
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Report Generated By: ' + report.generatedBy, margin, footerY);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 15, footerY);
  
  // Add page numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 20,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  return doc;
}

export function downloadReport(caseData: ForensicCase): void {
  const report = generateReport(caseData);
  const pdf = generatePDF(report);
  pdf.save(`AutoForensic_Report_${caseData.id}.pdf`);
}
