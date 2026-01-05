import { motion } from 'framer-motion';
import { 
  Eye, 
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForensicCase } from '@/lib/forensics/types';

interface ObservationsDisplayProps {
  caseData: ForensicCase;
}

export function ObservationsDisplay({ caseData }: ObservationsDisplayProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Observations */}
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5 text-primary" />
            Key Observations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {caseData.observations.map((observation, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground/90">{observation}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-warning" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {caseData.riskAnalysis.recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3 p-2 rounded-md hover:bg-warning/5 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-warning">{index + 1}</span>
                </div>
                <span className="text-sm text-foreground/90">{recommendation}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
