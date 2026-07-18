import React from "react";
import { PIPELINE_STAGES } from "../../hooks/useAnalysis";
import { motion, AnimatePresence } from "framer-motion";

interface PipelineVisualizerProps {
  stageIndex: number;
  status: string;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ stageIndex, status }) => {
  if (status !== "running") return null;

  return (
    <div className="cb-msg-bubble assistant">
      <div className="cb-pipeline">
        <AnimatePresence>
          {PIPELINE_STAGES.map((s, i) => {
            const isActive = stageIndex === i;
            const isDone = stageIndex > i;
            if (!isActive && !isDone) return null;

            return (
              <motion.div 
                key={s.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`cb-stage ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              >
                <span className="cb-stage-icon">
                  {isDone ? "✓" : isActive ? s.icon : "•"}
                </span>
                <span>{s.title}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
