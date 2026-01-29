import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertTriangle, Shield, X, User, Hash, FileSearch, Files, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { InvestigatorDetails } from '@/lib/forensics/types';

interface SelectedFile {
  file: File;
  content: string;
}

interface FileUploadProps {
  onFileSelect: (file: File, content: string, investigatorDetails: InvestigatorDetails) => void;
  isProcessing: boolean;
}

const ALLOWED_EXTENSIONS = ['.txt', '.log', '.syslog', '.csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Investigator details
  const [caseNumber, setCaseNumber] = useState('');
  const [investigatorName, setInvestigatorName] = useState('');
  const [investigationId, setInvestigationId] = useState('');

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Invalid file type: ${file.name}. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} exceeds 10MB limit`;
    }
    
    return null;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: SelectedFile[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      try {
        const content = await file.text();
        validFiles.push({ file, content });
      } catch {
        errors.push(`Failed to read ${file.name}`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('; '));
    } else {
      setError(null);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  }, []);

  const handleStartAnalysis = () => {
    if (selectedFiles.length === 0) return;
    
    if (!caseNumber.trim() || !investigatorName.trim() || !investigationId.trim()) {
      setError('Please fill in all investigator details');
      return;
    }

    // Combine all file contents with file separators
    const combinedContent = selectedFiles
      .map(sf => `\n=== FILE: ${sf.file.name} ===\n${sf.content}`)
      .join('\n');
    
    // Create a virtual combined file
    const totalSize = selectedFiles.reduce((sum, sf) => sum + sf.file.size, 0);
    const combinedFile = new File(
      [combinedContent], 
      selectedFiles.length === 1 
        ? selectedFiles[0].file.name 
        : `combined_${selectedFiles.length}_files.log`,
      { type: 'text/plain' }
    );
    
    // Override size for display purposes
    Object.defineProperty(combinedFile, 'size', { value: totalSize });
    
    onFileSelect(combinedFile, combinedContent, {
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
      handleFiles(files);
    }
  }, [handleFiles]);

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
      handleFiles(files);
    }
    // Reset input to allow selecting same file again
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setError(null);
  };

  const loadDemoLog = async () => {
    try {
      setError(null);
      const response = await fetch('/demo-logs/security-incident-sample.log');
      if (!response.ok) throw new Error('Failed to load demo log');
      const content = await response.text();
      const demoFile = new File([content], 'security-incident-sample.log', { type: 'text/plain' });
      setSelectedFiles([{ file: demoFile, content }]);
      setCaseNumber('DEMO-2024-001');
      setInvestigatorName('Demo Analyst');
      setInvestigationId('INV-DEMO-001');
    } catch {
      setError('Failed to load demo log file');
    }
  };

  const isFormValid = selectedFiles.length > 0 && caseNumber.trim() && investigatorName.trim() && investigationId.trim();

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
          disabled={isProcessing}
          multiple
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
                  ? "Drop your log files here" 
                  : "Upload System Logs"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isProcessing 
                ? "Running forensic analysis pipeline"
                : "Drag and drop or click to browse (multiple files supported)"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Supported: .txt, .log, .syslog, .csv (Max 10MB each)
            </p>
          </div>

          {!isProcessing && (
            <div className="flex items-center gap-3 mt-2">
              <Button variant="outline" size="sm" className="pointer-events-none">
                <Files className="w-4 h-4 mr-2" />
                Select Files
              </Button>
              <span className="text-xs text-muted-foreground">or</span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); loadDemoLog(); }}
                className="relative z-10"
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Load Demo
              </Button>
            </div>
          )}
        </div>

        {/* Selected Files List */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedFiles.length} file(s) selected
                </span>
                {!isProcessing && selectedFiles.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearAllFiles(); }}
                    className="h-6 text-xs relative z-10"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              {selectedFiles.map((sf, index) => (
                <motion.div
                  key={`${sf.file.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-2 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{sf.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(sf.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  {!isProcessing && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(index); }}
                      className="h-6 w-6 relative z-10"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
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
      {selectedFiles.length > 0 && !isProcessing && (
        <div className="p-4 pt-0 flex justify-center">
          <Button 
            onClick={handleStartAnalysis}
            size="lg"
            disabled={!isFormValid}
            className="w-full sm:w-auto"
          >
            <Shield className="w-4 h-4 mr-2" />
            Analyze {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </Card>
  );
}