import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskAnalysis } from '@/lib/forensics/types';
import { cn } from '@/lib/utils';

interface RiskScoreDisplayProps {
  risk: RiskAnalysis;
}

export function RiskScoreDisplay({ risk }: RiskScoreDisplayProps) {
  const getSeverityConfig = (severity: RiskAnalysis['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          icon: AlertTriangle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/20',
          borderColor: 'border-destructive/50',
          glowColor: 'shadow-[0_0_30px_hsl(var(--destructive)/0.4)]',
          label: 'Critical Risk',
        };
      case 'HIGH':
        return {
          icon: AlertTriangle,
          color: 'text-warning',
          bgColor: 'bg-warning/20',
          borderColor: 'border-warning/50',
          glowColor: 'shadow-[0_0_30px_hsl(var(--warning)/0.4)]',
          label: 'High Risk',
        };
      case 'MEDIUM':
        return {
          icon: TrendingUp,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          borderColor: 'border-yellow-400/50',
          glowColor: 'shadow-[0_0_30px_hsl(48_96%_53%/0.3)]',
          label: 'Medium Risk',
        };
      case 'LOW':
        return {
          icon: CheckCircle2,
          color: 'text-accent',
          bgColor: 'bg-accent/20',
          borderColor: 'border-accent/50',
          glowColor: 'shadow-[0_0_30px_hsl(var(--accent)/0.4)]',
          label: 'Low Risk',
        };
    }
  };

  const config = getSeverityConfig(risk.severity);
  const Icon = config.icon;

  // Calculate the stroke dash for the circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (risk.overallScore / 100) * circumference;

  return (
    <Card variant="cyber" className={cn("overflow-hidden", config.glowColor)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-primary" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Circular Score Display */}
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={config.color}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  strokeDasharray: circumference,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={cn("text-3xl font-bold font-mono", config.color)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {risk.overallScore}
              </motion.span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>

          {/* Severity Badge & Info */}
          <div className="flex-1 space-y-4">
            <motion.div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border",
                config.bgColor,
                config.borderColor
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Icon className={cn("w-5 h-5", config.color)} />
              <span className={cn("font-semibold", config.color)}>
                {config.label}
              </span>
            </motion.div>

            {/* Risk Factors */}
            <div className="space-y-2">
              {risk.factors.slice(0, 3).map((factor, index) => (
                <motion.div
                  key={factor.name}
                  className="space-y-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {factor.name}
                    </span>
                    <span className="font-mono text-foreground">{factor.score}/100</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", 
                        factor.score > 70 ? "bg-destructive" :
                        factor.score > 40 ? "bg-warning" :
                        "bg-accent"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
