'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { IdeaSchema } from '@/actions/serverActions';

interface SchemaEditorPanelProps {
  schema: IdeaSchema;
  onComplete: (updatedSchema: IdeaSchema) => void;
}

export default function SchemaEditorPanel({ schema, onComplete }: SchemaEditorPanelProps) {
  // Normalize constraints to always be an array
  const normalizeConstraints = (constraints: string[] | Record<string, string>): string[] => {
    if (Array.isArray(constraints)) {
      return constraints;
    }
    if (typeof constraints === 'object' && constraints !== null) {
      return Object.values(constraints);
    }
    return [];
  };

  const normalizedSchema = {
    ...schema,
    constraints: normalizeConstraints(schema.constraints)
  };

  const [editedSchema, setEditedSchema] = useState<IdeaSchema>({
    ...normalizedSchema,
    constraints: normalizeConstraints(normalizedSchema.constraints)
  });
  const [newCriteria, setNewCriteria] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

  const handleCriteriaChange = (index: number, value: string) => {
    setEditedSchema(prev => ({
      ...prev,
      criteria: prev.criteria.map((criteria, i) => 
        i === index ? value : criteria
      )
    }));
  };

  const handleAddCriteria = () => {
    if (newCriteria.trim()) {
      setEditedSchema(prev => ({
        ...prev,
        criteria: [...prev.criteria, newCriteria.trim()]
      }));
      setNewCriteria('');
    }
  };

  const handleRemoveCriteria = (index: number) => {
    setEditedSchema(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index)
    }));
  };

  const handleAddConstraint = () => {
    if (newConstraint.trim()) {
      setEditedSchema(prev => {
        const currentConstraints = normalizeConstraints(prev.constraints);
        return {
          ...prev,
          constraints: [...currentConstraints, newConstraint.trim()]
        };
      });
      setNewConstraint('');
    }
  };

  const handleRemoveConstraint = (index: number) => {
    setEditedSchema(prev => {
      const currentConstraints = normalizeConstraints(prev.constraints);
      return {
        ...prev,
        constraints: currentConstraints.filter((_, i) => i !== index)
      };
    });
  };

  const handleConstraintChange = (index: number, value: string) => {
    setEditedSchema(prev => {
      const currentConstraints = normalizeConstraints(prev.constraints);
      return {
        ...prev,
        constraints: currentConstraints.map((constraint, i) => 
          i === index ? value : constraint
        )
      };
    });
  };

  const handleComplete = () => {
    onComplete(editedSchema);
  };

  const inputClass = "bg-blue-50 placeholder:text-gray-600 text-gray-900";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[500px] space-y-6"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Edit Your Ideation Plan</h2>
        </div>
        <p className="text-md text-gray-600">
          Edit criteria and constraints to perfect your ideation framework
        </p>
      </div>

      <div className="space-y-6">
        {/* Context & Purpose */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-900">Context</Label>
            <Textarea
              value={editedSchema.context}
              onChange={(e) => {
                const el = e.target as HTMLTextAreaElement;
                setEditedSchema(prev => ({ ...prev, context: el.value }));

                // auto-grow
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
              className="bg-blue-50"
              placeholder="Describe the context of your goal for idea generation and rapid prototyping"
            />

          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-900">Purpose</Label>
            <Textarea
              value={editedSchema.purpose}
              onChange={(e) => {
                const el = e.target as HTMLTextAreaElement;
                setEditedSchema(prev => ({ ...prev, purpose: el.value }));

                // auto-grow
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
              className="bg-blue-50"
              placeholder="Describe the purpose of your idea generation and rapid prototyping"
              />
          </div>
        </div>

        {/* Criteria Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-900">Success Criteria (Edit by clicking on the criteria)</Label>
          
          <div className="space-y-2">
            {editedSchema.criteria.map((criteria, index) => (
              <Card key={index} className="bg-blue-50">
                <div className="flex gap-2 items-center">
                  <Input
                    value={criteria}
                    onChange={(e) => handleCriteriaChange(index, e.target.value)}
                    placeholder="Criteria description"
                    className={inputClass}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCriteria(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Add New Criteria */}
          <Card className="bg-blue-50 border-dashed">
            <div className="flex gap-2">
              <Input
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="Click to add a new criteria"
                className={inputClass}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCriteria()}
              />
              <Button
                onClick={handleAddCriteria}
                variant="outline"
                size="sm"
                disabled={!newCriteria.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Constraints Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-900">Constraints (Edit by clicking on the constraints)</Label>
          
          <div className="space-y-2">
            {normalizeConstraints(editedSchema.constraints).map((constraint, index) => (
              <Card key={index} className="bg-blue-50">
                <div className="flex gap-3 items-center">
                  <Input
                    value={constraint}
                    onChange={(e) => handleConstraintChange(index, e.target.value)}
                    placeholder="Constraint description"
                    className={inputClass}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveConstraint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Add New Constraint */}
          <Card className="bg-blue-50 border-dashed">
            <div className="flex gap-2">
              <Input
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                placeholder="Click to add a new constraint"
                className={inputClass}
                onKeyPress={(e) => e.key === 'Enter' && handleAddConstraint()}
              />
              <Button
                onClick={handleAddConstraint}
                variant="outline"
                size="sm"
                disabled={!newConstraint.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        className="w-full"
        size="lg"
      >
        Finalize Ideation Plan
      </Button>
    </motion.div>
  );
}
