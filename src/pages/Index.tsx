import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Terminal, Fingerprint, Activity, Sparkles } from 'lucide-react';
import { FileUpload } from '@/components/forensics/FileUpload';
import { CaseSummary } from '@/components/forensics/CaseSummary';
import { RiskScoreDisplay } from '@/components/forensics/RiskScoreDisplay';
import { TimelineDisplay } from '@/components/forensics/TimelineDisplay';
import { IncidentTypeDisplay } from '@/components/forensics/IncidentTypeDisplay';
import { ObservationsDisplay } from '@/components/forensics/ObservationsDisplay';
import { ForensicCase, InvestigatorDetails } from '@/lib/forensics/types';
import { createForensicCase } from '@/lib/forensics/caseManager';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [forensicCase, setForensicCase] = useState<ForensicCase | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File, content: string, investigatorDetails: InvestigatorDetails) => {
    setIsProcessing(true);
    setForensicCase(null);

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
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 grid-pattern opacity-50 pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full status-dot-low" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  <span className="text-primary">Auto</span>Forensic
                </h1>
                <p className="text-xs text-muted-foreground font-mono tracking-wide">
                  Digital Forensics & Incident Analysis
                </p>
              </div>
            </motion.div>

            {forensicCase && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewAnalysis}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  New Analysis
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 relative">
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
              <div className="text-center mb-10">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Automated Investigation System</span>
                </motion.div>

                <motion.h2
                  className="text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Analyze System Logs
                  <br />
                  <span className="text-primary">Reconstruct Incidents</span>
                </motion.h2>

                <motion.p
                  className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
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
                    className="mt-8 p-5 rounded-xl bg-card border border-primary/30 shadow-glow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="p-2.5 rounded-lg bg-primary/20">
                          <Terminal className="w-5 h-5 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Forensic Analysis in Progress</p>
                        <p className="text-sm text-primary font-mono mt-0.5">{analysisStep}</p>
                      </div>
                      <Activity className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-shimmer" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Features */}
              <motion.div
                className="grid grid-cols-3 gap-5 mt-14"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { title: 'Log Parsing', desc: 'Multi-format support' },
                  { title: 'Timeline', desc: 'Chronological events' },
                  { title: 'PDF Reports', desc: 'Professional output' },
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    className="text-center p-5 rounded-xl bg-card/50 border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-sm"
                    whileHover={{ y: -2 }}
                  >
                    <p className="text-sm font-semibold text-foreground mb-1">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </motion.div>
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
              className="space-y-8"
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
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary/60" />
              <span><span className="text-foreground font-semibold">AutoForensic</span> — Automated Digital Forensics System</span>
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