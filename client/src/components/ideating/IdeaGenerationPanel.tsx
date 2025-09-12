'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Lightbulb, Zap } from 'lucide-react';
import { IdeaSchema, ideaGeneration, ideaEvaluation, IdeaWithEvaluation } from '@/actions/serverActions';

interface IdeaGenerationPanelProps {
  schema: IdeaSchema;
  onComplete: (ideas: IdeaWithEvaluation[]) => void;
}

export default function IdeaGenerationPanel({ schema, onComplete }: IdeaGenerationPanelProps) {
  const [currentStep, setCurrentStep] = useState<'ready' | 'generating' | 'evaluating' | 'complete'>('ready');
  const [error, setError] = useState<string>('');

  const handleGenerateIdeas = async () => {
    setCurrentStep('generating');
    setError('');

    try {
      // Step 1: Generate ideas
      const ideas = await ideaGeneration(schema);
      
      // Step 2: Evaluate ideas
      setCurrentStep('evaluating');
      
      const evaluatedIdeas = await ideaEvaluation(schema, ideas);
      setCurrentStep('complete');
      
      onComplete(evaluatedIdeas);
    } catch (error) {
      console.error('Error generating ideas:', error);
      setError('Failed to generate ideas. Please try again.');
      setCurrentStep('ready');
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[600px] space-y-6"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Generate Ideas</h2>
        </div>
        <p className="text-md text-gray-600">
          AI will create 50 ideas and return the top 15 based on your ideation plan
        </p>
      </div>

      {/* Schema Summary */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <h3 className="font-medium text-blue-900">Using Ideation Plan:</h3>
          <div className="text-sm gap-1 text-blue-800">
            <p><strong>Purpose:</strong> {schema.purpose}</p>
            <p><strong>Context:</strong> {schema.context}</p>
              <div className="whitespace-pre-line">
                <strong>Criteria:</strong> 
                <br />{schema.criteria.map((criteria) => (`- ${criteria}`)).join('\n')}
                <br />
                <strong>Constraints:</strong> 
                <br />{schema.constraints.map((constraint) => (`- ${constraint}`)).join('\n')}
              </div>
          </div>
        </div>
      </Card>

      {/* Generation Status */}
      <AnimatePresence mode="wait">
        {currentStep === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              onClick={handleGenerateIdeas}
              className="w-full"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate & Evaluate Ideas
            </Button>
          </motion.div>
        )}

        {currentStep === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-lg text-green-900 font-medium">Generating Ideas...</span>
            </div>
            <p className="text-md text-gray-600">
              Creating 50 unique ideas based on your schema
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}

        {currentStep === 'evaluating' && (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-green-500" />
              <span className="text-lg font-medium text-green-900">Evaluating Ideas...</span>
            </div>
            <p className="text-sm text-gray-600">
              Analyzing and selecting the top 15 ideas
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: '60%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* {currentStep === 'complete' && evaluatedIdeas.length > 0 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                ✨ Top 10 Ideas Generated!
              </h3>
              <p className="text-sm text-gray-600">
                Ideas are ranked by evaluation score. Proceed to ranking to provide your feedback.
              </p>
            </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {evaluatedIdeas.map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <Badge 
                            className={`${getEvaluationColor(idea.evaluation)} flex items-center gap-1`}
                          >
                            {getEvaluationIcon(idea.evaluation)}
                            {idea.evaluation}/100
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {idea.idea}
                        </h4>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )} */}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {currentStep === 'complete' && (
        <div className="text-md text-gray-500 text-center">
          Next: Rank these ideas from 1-10 to refine your schema
        </div>
      )}
    </motion.div>
  );
}
