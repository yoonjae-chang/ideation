'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { initialSchemaGeneration, saveIdeationSession, IdeaSchema } from '@/actions/serverActions';

interface ContextInputPanelProps {
  onComplete: (sessionData: {
    id?: string;
    context: string;
    purpose: string;
    preferences: string;
  }, schema: IdeaSchema) => void;
  sessionData: {
    id?: string;
    context: string;
    purpose: string;
    preferences: string;
  };
}

export default function ContextInputPanel({ onComplete, sessionData }: ContextInputPanelProps) {
  const [formData, setFormData] = useState(sessionData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.context.trim()) {
      newErrors.context = 'Context is required';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    if (!formData.preferences.trim()) {
      newErrors.preferences = 'Preferences are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateSchema = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      // Save the ideation session first
      const sessionId = await saveIdeationSession(
        formData.context,
        formData.purpose,
        formData.preferences
      );

      // Generate the initial schema using AI
      const schema = await initialSchemaGeneration(
        formData.context,
        formData.purpose,
        formData.preferences
      );

      const sessionDataWithId = { ...formData, id: sessionId };
      onComplete(sessionDataWithId, schema);
    } catch (error) {
      console.error('Error generating schema:', error);
      setErrors({ general: 'Failed to generate schema. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      className="w-96 space-y-6 "
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Start Your Brainstorming</h2>
        </div>
        <p className="text-md text-gray-600">
          Provide context and goals to generate personalized ideation 
        </p>
      </div>

      <div className="space-y-4">
        {/* Context Input */}
        <div className="space-y-2">
          <Label htmlFor="context" className="text-md font-medium text-black">
            Context
          </Label>
          <Textarea
            id="context"
            placeholder="Describe the situation, problem, or domain you're working in..."
            value={formData.context}
            onChange={(e) => {
              const el = e.target as HTMLTextAreaElement;
              handleInputChange('context', el.value);
              
              // auto-grow
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            className={`min-h-[80px] border-2 border-accent placeholder:text-gray-600 text-black bg-blue-50  resize-none overflow-hidden ${errors.context ? 'border-red-300' : ''}`}
          />
          {errors.context && (
            <p className="text-sm text-red-600">{errors.context}</p>
          )}
        </div>

        {/* Purpose Input */}
        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-md font-medium text-black">
            Purpose
          </Label>
          <Textarea
            id="purpose"
            placeholder="What specific goal or outcome are you trying to achieve?"
            value={formData.purpose}
            onChange={(e) => {
              const el = e.target as HTMLTextAreaElement;
              handleInputChange('purpose', el.value);
              
              // auto-grow
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            className={`min-h-[80px] border-2 border-accent placeholder:text-gray-600 text-black bg-blue-50 resize-none overflow-hidden ${errors.purpose ? 'border-red-300' : ''}`}
          />
          {errors.purpose && (
            <p className="text-sm text-red-600">{errors.purpose}</p>
          )}
        </div>

        {/* Preferences Input */}
        <div className="space-y-2">
          <Label htmlFor="preferences" className="text-md font-medium text-black">
            Preferences & Criteria
          </Label>
          <Textarea
            id="preferences"
            placeholder="What qualities should successful ideas have? Any constraints or requirements?"
            value={formData.preferences}
            onChange={(e) => {
              const el = e.target as HTMLTextAreaElement;
              handleInputChange('preferences', el.value);
              
              // auto-grow
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            className={`min-h-[80px] border-2 border-accent placeholder:text-gray-600 text-black bg-blue-50 resize-none overflow-hidden ${errors.preferences ? 'border-red-300' : ''}`}
          />
          {errors.preferences && (
            <p className="text-sm text-red-600">{errors.preferences}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerateSchema}
        disabled={isGenerating}
        className="w-full text-[15px]"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Ideation Plan...
          </>
        ) : (
            "Generate Initial Ideation Plan..."
        )}
      </Button>

    </motion.div>
  );
}
