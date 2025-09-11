'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, X, Edit3, Check } from 'lucide-react';
import { IdeaSchema } from '@/actions/serverActions';

interface SchemaEditorPanelProps {
  schema: IdeaSchema;
  onComplete: (updatedSchema: IdeaSchema) => void;
}

export default function SchemaEditorPanel({ schema, onComplete }: SchemaEditorPanelProps) {
  const [editedSchema, setEditedSchema] = useState<IdeaSchema>(schema);
  const [newCriteriaKey, setNewCriteriaKey] = useState('');
  const [newCriteriaValue, setNewCriteriaValue] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

  const handleCriteriaChange = (key: string, value: string) => {
    setEditedSchema(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [key]: value
      }
    }));
  };

  const handleAddCriteria = () => {
    if (newCriteriaKey.trim() && newCriteriaValue.trim()) {
      setEditedSchema(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          [newCriteriaKey.trim()]: newCriteriaValue.trim()
        }
      }));
      setNewCriteriaKey('');
      setNewCriteriaValue('');
    }
  };

  const handleRemoveCriteria = (key: string) => {
    setEditedSchema(prev => {
      const newCriteria = { ...prev.criteria };
      delete newCriteria[key];
      return {
        ...prev,
        criteria: newCriteria
      };
    });
  };

  const handleAddConstraint = () => {
    if (newConstraint.trim()) {
      setEditedSchema(prev => ({
        ...prev,
        constraints: [...prev.constraints, newConstraint.trim()]
      }));
      setNewConstraint('');
    }
  };

  const handleRemoveConstraint = (index: number) => {
    setEditedSchema(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  };

  const handleConstraintChange = (index: number, value: string) => {
    setEditedSchema(prev => ({
      ...prev,
      constraints: prev.constraints.map((constraint, i) => 
        i === index ? value : constraint
      )
    }));
  };

  const handleComplete = () => {
    onComplete(editedSchema);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[500px] space-y-6"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Edit3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Refine Your Schema</h2>
        </div>
        <p className="text-sm text-gray-600">
          Edit criteria and constraints to perfect your ideation framework
        </p>
      </div>

      <div className="space-y-6">
        {/* Context & Purpose (Read-only) */}
        <Card className="p-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">Context</Label>
              <p className="text-sm text-gray-600 mt-1">{editedSchema.context}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Purpose</Label>
              <p className="text-sm text-gray-600 mt-1">{editedSchema.purpose}</p>
            </div>
          </div>
        </Card>

        {/* Criteria Section */}
        <div className="space-y-4">
          <Label className="text-base font-semibold text-gray-900">Success Criteria</Label>
          
          <div className="space-y-3">
            {Object.entries(editedSchema.criteria).map(([key, value]) => (
              <Card key={key} className="p-3">
                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newCriteria = { ...editedSchema.criteria };
                        delete newCriteria[key];
                        newCriteria[newKey] = value;
                        setEditedSchema(prev => ({ ...prev, criteria: newCriteria }));
                      }}
                      placeholder="Criteria name"
                      className="font-medium"
                    />
                    <Textarea
                      value={value}
                      onChange={(e) => handleCriteriaChange(key, e.target.value)}
                      placeholder="Describe this criteria"
                      className="min-h-[60px]"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCriteria(key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Add New Criteria */}
          <Card className="p-3 border-dashed">
            <div className="space-y-2">
              <Input
                value={newCriteriaKey}
                onChange={(e) => setNewCriteriaKey(e.target.value)}
                placeholder="New criteria name"
              />
              <Textarea
                value={newCriteriaValue}
                onChange={(e) => setNewCriteriaValue(e.target.value)}
                placeholder="Describe this criteria"
                className="min-h-[60px]"
              />
              <Button
                onClick={handleAddCriteria}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!newCriteriaKey.trim() || !newCriteriaValue.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Criteria
              </Button>
            </div>
          </Card>
        </div>

        {/* Constraints Section */}
        <div className="space-y-4">
          <Label className="text-base font-semibold text-gray-900">Constraints</Label>
          
          <div className="space-y-2">
            {editedSchema.constraints.map((constraint, index) => (
              <Card key={index} className="p-3">
                <div className="flex gap-3 items-center">
                  <Input
                    value={constraint}
                    onChange={(e) => handleConstraintChange(index, e.target.value)}
                    placeholder="Constraint description"
                    className="flex-1"
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
          <Card className="p-3 border-dashed">
            <div className="flex gap-2">
              <Input
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                placeholder="Add a new constraint"
                className="flex-1"
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
        <Check className="w-4 h-4 mr-2" />
        Finalize Schema
      </Button>

      <div className="text-xs text-gray-500 text-center">
        Your refined schema will be used to generate targeted ideas
      </div>
    </motion.div>
  );
}
