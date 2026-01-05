import { motion } from 'framer-motion';
import { 
  FileText, 
  Hash, 
  Calendar, 
  HardDrive,
  Download,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForensicCase } from '@/lib/forensics/types';
import { downloadReport } from '@/lib/forensics/reportGenerator';

interface CaseSummaryProps {
  caseData: ForensicCase;
}

export function CaseSummary({ caseData }: CaseSummaryProps) {
  const handleDownload = () => {
    downloadReport(caseData);
  };

  return (
    <Card variant="glow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Case Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Case ID */}
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-2 rounded-md bg-primary/20">
            <Hash className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Case ID</p>
            <p className="font-mono font-semibold text-primary text-lg">{caseData.id}</p>
          </div>
        </motion.div>

        {/* File Info */}
        <motion.div 
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <HardDrive className="w-3 h-3" />
              <span className="text-xs">Evidence File</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate" title={caseData.fileName}>
              {caseData.fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {(caseData.fileSize / 1024).toFixed(2)} KB
            </p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Analysis Date</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {caseData.createdAt.toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {caseData.createdAt.toLocaleTimeString()}
            </p>
          </div>
        </motion.div>

        {/* Evidence Hash */}
        <motion.div
          className="p-3 rounded-lg bg-accent/10 border border-accent/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Evidence Integrity Verified</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">SHA-256 Hash</p>
            <p className="font-mono text-xs text-foreground/80 break-all leading-relaxed">
              {caseData.fileHash}
            </p>
          </div>
        </motion.div>

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="cyber" 
            size="lg" 
            className="w-full"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Forensic Report (PDF)
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
