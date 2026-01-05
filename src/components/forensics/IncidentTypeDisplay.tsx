import { motion } from 'framer-motion';
import { 
  Target, 
  AlertOctagon, 
  Bug, 
  Wifi, 
  Key, 
  ShieldAlert,
  FileWarning,
  Activity,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentClassification, IncidentType } from '@/lib/forensics/types';
import { getIncidentTypeLabel } from '@/lib/forensics/incidentClassifier';
import { cn } from '@/lib/utils';

interface IncidentTypeDisplayProps {
  classification: IncidentClassification;
}

const incidentConfig: Record<IncidentType, { icon: React.ElementType; color: string; bgColor: string }> = {
  UNAUTHORIZED_ACCESS: { icon: Key, color: 'text-orange-400', bgColor: 'bg-orange-400/20' },
  DATA_BREACH: { icon: AlertOctagon, color: 'text-destructive', bgColor: 'bg-destructive/20' },
  MALWARE_INFECTION: { icon: Bug, color: 'text-purple-400', bgColor: 'bg-purple-400/20' },
  DENIAL_OF_SERVICE: { icon: Wifi, color: 'text-red-500', bgColor: 'bg-red-500/20' },
  PRIVILEGE_ESCALATION: { icon: ShieldAlert, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
  SUSPICIOUS_ACTIVITY: { icon: Activity, color: 'text-warning', bgColor: 'bg-warning/20' },
  POLICY_VIOLATION: { icon: FileWarning, color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
  SYSTEM_COMPROMISE: { icon: AlertOctagon, color: 'text-destructive', bgColor: 'bg-destructive/20' },
  UNKNOWN: { icon: HelpCircle, color: 'text-muted-foreground', bgColor: 'bg-muted/20' },
};

export function IncidentTypeDisplay({ classification }: IncidentTypeDisplayProps) {
  const config = incidentConfig[classification.type];
  const Icon = config.icon;
  const label = getIncidentTypeLabel(classification.type);

  return (
    <Card variant="cyber">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Incident Classification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Classification */}
        <motion.div
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border",
            config.bgColor,
            "border-current/30"
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={cn("p-3 rounded-full", config.bgColor)}>
            <Icon className={cn("w-8 h-8", config.color)} />
          </div>
          <div className="flex-1">
            <h3 className={cn("text-xl font-bold", config.color)}>
              {label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {classification.description}
            </p>
          </div>
        </motion.div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Classification Confidence</span>
            <span className={cn("font-mono font-semibold", config.color)}>
              {classification.confidence}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", 
                classification.confidence > 70 ? config.color.replace('text-', 'bg-') :
                classification.confidence > 40 ? 'bg-warning' :
                'bg-muted-foreground'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${classification.confidence}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Indicators */}
        {classification.indicators.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-foreground">Key Indicators</h4>
            <div className="flex flex-wrap gap-2">
              {classification.indicators.map((indicator, index) => (
                <motion.span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground border border-border"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {indicator}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
