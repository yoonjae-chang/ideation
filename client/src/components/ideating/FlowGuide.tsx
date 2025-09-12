'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { PanelType } from './types';

interface FlowGuideProps {
  currentStep: PanelType;
}

const steps = [
  { id: 'context-input', label: 'Context & Purpose', description: 'Define your ideation goals' },
  { id: 'schema-editing', label: 'Schema Design', description: 'Refine criteria & constraints' },
  { id: 'idea-generation', label: 'Generate Ideas', description: 'AI creates & evaluates ideas' },
  { id: 'ranking', label: 'Rank Ideas', description: 'Rate ideas 1-10' },
  { id: 'schema-refinement', label: 'Refine & Iterate', description: 'Improve schema based on rankings' }
] as const;

export default function FlowGuide({ currentStep }: FlowGuideProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="absolute top-4 left-4 z-40">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-4 shadow-lg"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ideation Flow</h3>
        
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Icon */}
                <motion.div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    transition-all duration-200
                    ${index < currentStepIndex 
                      ? 'bg-green-100 text-green-700' 
                      : index === currentStepIndex
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                      : 'bg-gray-100 text-gray-400'
                    }
                  `}
                  animate={{
                    scale: index === currentStepIndex ? 1.1 : 1,
                  }}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div className={`
                    text-xs font-medium
                    ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                    {step.label}
                  </div>
                  <div className={`
                    text-xs mt-1 max-w-20
                    ${index === currentStepIndex ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {step.description}
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              {index < steps.length - 1 && (
                <ArrowRight className={`
                  w-4 h-4 mx-2 mt-[-20px]
                  ${index < currentStepIndex ? 'text-green-400' : 'text-gray-300'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <motion.div
            className="bg-blue-500 h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentStepIndex + 1) / steps.length) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
