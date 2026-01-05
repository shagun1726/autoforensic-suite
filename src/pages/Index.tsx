import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Terminal, Fingerprint, Activity } from 'lucide-react';
import { FileUpload } from '@/components/forensics/FileUpload';
import { CaseSummary } from '@/components/forensics/CaseSummary';
import { RiskScoreDisplay } from '@/components/forensics/RiskScoreDisplay';
import { TimelineDisplay } from '@/components/forensics/TimelineDisplay';
import { IncidentTypeDisplay } from '@/components/forensics/IncidentTypeDisplay';
import { ObservationsDisplay } from '@/components/forensics/ObservationsDisplay';
import { ForensicCase, InvestigatorDetails } from '@/lib/forensics/types';
import { createForensicCase } from '@/lib/forensics/caseManager';

const Index = () => {
  const [forensicCase, setForensicCase] = useState<ForensicCase | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File, content: string, investigatorDetails: InvestigatorDetails) => {
    setIsProcessing(true);
    setForensicCase(null);

    // Simulate analysis steps for UX
    const steps = [
      'Calculating evidence hash...',
      'Parsing log entries...',
      'Building incident timeline...',
      'Analyzing risk factors...',
      'Classifying incident type...',
      'Generating report...',
    ];

    for (const step of steps) {
      setAnalysisStep(step);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    try {
      const caseData = await createForensicCase(file, content, investigatorDetails);
      setForensicCase(caseData);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsProcessing(false);
      setAnalysisStep('');
    }
  }, []);

  const handleNewAnalysis = () => {
    setForensicCase(null);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-2 rounded-lg bg-primary/20 box-glow-primary">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  <span className="text-primary">Auto</span>Forensic
                </h1>
                <p className="text-xs text-muted-foreground font-mono">
                  Digital Forensics & Incident Reconstruction
                </p>
              </div>
            </motion.div>

            {forensicCase && (
              <motion.button
                className="text-sm text-primary hover:text-primary/80 font-medium"
                onClick={handleNewAnalysis}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                + New Analysis
              </motion.button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!forensicCase ? (
            /* Upload Section */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Hero Section */}
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Automated Investigation System</span>
                </motion.div>

                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Analyze System Logs
                  <br />
                  <span className="text-primary text-glow-primary">Reconstruct Incidents</span>
                </motion.h2>

                <motion.p
                  className="text-muted-foreground max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Upload your system log files for automated forensic analysis, 
                  timeline reconstruction, and professional PDF report generation.
                </motion.p>
              </div>

              {/* Upload Component */}
              <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />

              {/* Processing Status */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 p-4 rounded-lg bg-card border border-primary/30 box-glow-primary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Terminal className="w-5 h-5 text-primary" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Forensic Analysis in Progress</p>
                        <p className="text-xs text-primary font-mono">{analysisStep}</p>
                      </div>
                      <Activity className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Features */}
              <motion.div
                className="grid grid-cols-3 gap-4 mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { title: 'Log Parsing', desc: 'Multi-format support' },
                  { title: 'Timeline', desc: 'Chronological events' },
                  { title: 'PDF Reports', desc: 'Professional output' },
                ].map((feature, i) => (
                  <div 
                    key={i}
                    className="text-center p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            /* Results Section */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Top Row: Case Summary + Risk Score + Incident Type */}
              <div className="grid gap-6 lg:grid-cols-3">
                <CaseSummary caseData={forensicCase} />
                <RiskScoreDisplay risk={forensicCase.riskAnalysis} />
                <IncidentTypeDisplay classification={forensicCase.incidentClassification} />
              </div>

              {/* Timeline */}
              <TimelineDisplay events={forensicCase.timeline} />

              {/* Observations & Recommendations */}
              <ObservationsDisplay caseData={forensicCase} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              <span className="text-primary font-semibold">AutoForensic</span> — Automated Digital Forensics System
            </p>
            <p className="font-mono text-xs">
              Evidence integrity secured with SHA-256 hashing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
