import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertTriangle, Shield, X, User, Hash, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { InvestigatorDetails } from '@/lib/forensics/types';

interface FileUploadProps {
  onFileSelect: (file: File, content: string, investigatorDetails: InvestigatorDetails) => void;
  isProcessing: boolean;
}

const ALLOWED_EXTENSIONS = ['.txt', '.log', '.syslog', '.csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Investigator details
  const [caseNumber, setCaseNumber] = useState('');
  const [investigatorName, setInvestigatorName] = useState('');
  const [investigationId, setInvestigationId] = useState('');

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);

    try {
      const content = await file.text();
      setFileContent(content);
    } catch {
      setError('Failed to read file contents');
      setSelectedFile(null);
      setFileContent(null);
    }
  }, []);

  const handleStartAnalysis = () => {
    if (!selectedFile || !fileContent) return;
    
    if (!caseNumber.trim() || !investigatorName.trim() || !investigationId.trim()) {
      setError('Please fill in all investigator details');
      return;
    }
    
    onFileSelect(selectedFile, fileContent, {
      caseNumber: caseNumber.trim(),
      investigatorName: investigatorName.trim(),
      investigationId: investigationId.trim(),
    });
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const clearFile = () => {
    setSelectedFile(null);
    setFileContent(null);
    setError(null);
  };

  const isFormValid = selectedFile && fileContent && caseNumber.trim() && investigatorName.trim() && investigationId.trim();

  return (
    <Card variant="cyber" className="p-1">
      {/* Investigator Details Section */}
      <div className="p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Investigation Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="caseNumber" className="text-xs text-muted-foreground">
              Case Number
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="caseNumber"
                placeholder="e.g., CASE-2024-001"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
                disabled={isProcessing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="investigatorName" className="text-xs text-muted-foreground">
              Investigator Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="investigatorName"
                placeholder="e.g., John Smith"
                value={investigatorName}
                onChange={(e) => setInvestigatorName(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
                disabled={isProcessing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="investigationId" className="text-xs text-muted-foreground">
              Investigation ID
            </Label>
            <div className="relative">
              <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="investigationId"
                placeholder="e.g., INV-2024-0042"
                value={investigationId}
                onChange={(e) => setInvestigationId(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <motion.div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all duration-300 p-8 m-4",
          isDragActive 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50 hover:bg-card/50",
          isProcessing && "pointer-events-none opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="file"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing || !!selectedFile}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            className={cn(
              "p-4 rounded-full",
              isDragActive ? "bg-primary/20" : "bg-secondary"
            )}
            animate={{
              scale: isDragActive ? 1.1 : 1,
              boxShadow: isDragActive 
                ? "0 0 30px hsl(var(--primary) / 0.5)" 
                : "0 0 0 transparent"
            }}
          >
            {isProcessing ? (
              <Shield className="w-10 h-10 text-primary animate-pulse" />
            ) : (
              <Upload className={cn(
                "w-10 h-10 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
            )}
          </motion.div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isProcessing 
                ? "Analyzing Evidence..." 
                : isDragActive 
                  ? "Drop your log file here" 
                  : "Upload System Logs"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isProcessing 
                ? "Running forensic analysis pipeline"
                : "Drag and drop or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Supported: .txt, .log, .syslog, .csv (Max 10MB)
            </p>
          </div>

          {!isProcessing && !selectedFile && (
            <Button variant="outline" size="sm" className="mt-2 pointer-events-none">
              <FileText className="w-4 h-4 mr-2" />
              Select File
            </Button>
          )}
        </div>

        <AnimatePresence>
          {selectedFile && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              {!isProcessing && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearFile(); }}
                  className="h-8 w-8 relative z-10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-md bg-destructive/20 border border-destructive/30 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Start Analysis Button */}
      {selectedFile && fileContent && !isProcessing && (
        <div className="p-4 pt-0 flex justify-center">
          <Button 
            onClick={handleStartAnalysis}
            size="lg"
            disabled={!isFormValid}
            className="w-full sm:w-auto"
          >
            <Shield className="w-4 h-4 mr-2" />
            Start Forensic Analysis
          </Button>
        </div>
      )}
    </Card>
  );
}