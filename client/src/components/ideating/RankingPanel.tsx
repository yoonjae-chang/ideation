'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { IdeaWithEvaluation } from '@/actions/serverActions';

interface RankingPanelProps {
  ideas: IdeaWithEvaluation[];
  rankings: Record<string, number>;
  onComplete: (rankings: Record<string, number>) => void;
}

export default function RankingPanel({ ideas, rankings, onComplete }: RankingPanelProps) {
  const [currentRankings, setCurrentRankings] = useState<Record<string, number>>(rankings);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const completed = Object.keys(currentRankings).filter(key => currentRankings[key] > 0).length;
    setCompletedCount(completed);
  }, [currentRankings]);

  const handleRankingChange = (ideaIndex: number, value: number[]) => {
    const ideaKey = `idea-${ideaIndex}`;
    setCurrentRankings(prev => ({
      ...prev,
      [ideaKey]: value[0]
    }));
  };

  const handleComplete = () => {
    onComplete(currentRankings);
  };

  const getRankingColor = (ranking: number) => {
    if (ranking >= 8) return 'text-green-600';
    if (ranking >= 6) return 'text-blue-600';
    if (ranking >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankingLabel = (ranking: number) => {
    if (ranking >= 9) return 'Excellent';
    if (ranking >= 7) return 'Very Good';
    if (ranking >= 5) return 'Good';
    if (ranking >= 3) return 'Fair';
    return 'Poor';
  };

  const allIdeasRanked = ideas.every((_, index) => {
    const ideaKey = `idea-${index}`;
    return currentRankings[ideaKey] && currentRankings[ideaKey] > 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[700px] space-y-6"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Rank Your Ideas</h2>
        </div>
        <p className="text-sm text-gray-600">
          Rate each idea from 1-10 based on your personal preferences and judgment
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Progress: {completedCount}/{ideas.length} ideas ranked
            </span>
          </div>
          <div className="text-sm text-blue-700">
            {Math.round((completedCount / ideas.length) * 100)}% complete
          </div>
        </div>
        <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / ideas.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Card>

      {/* Ideas Ranking */}
      <div className="space-y-4">
        {ideas.map((idea, index) => {
          console.log(idea);
          const ideaKey = `idea-${index}`;
          const currentRanking = currentRankings[ideaKey] || 0;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 transition-all duration-200 ${
                currentRanking > 0 ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
              }`}>
                <div className="space-y-4">
                  {/* Idea Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          AI Score: {idea.evaluation}/100
                        </Badge>
                        {currentRanking > 0 && (
                          <Badge className={`text-xs ${getRankingColor(currentRanking)}`}>
                            Your Rating: {currentRanking}/10 ({getRankingLabel(currentRanking)})
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {idea.idea}
                      </h4>
                    </div>
                  </div>

                  {/* Ranking Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Your Rating (1-10)
                      </Label>
                      <span className={`text-lg font-bold ${getRankingColor(currentRanking)}`}>
                        {currentRanking > 0 ? currentRanking : '—'}
                      </span>
                    </div>
                    
                    <div className="px-2">
                      <Slider
                        value={[currentRanking]}
                        onValueChange={(value) => handleRankingChange(index, value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 (Poor)</span>
                        <span>5 (Average)</span>
                        <span>10 (Excellent)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Complete Button */}
      <div className="space-y-3">
        {!allIdeasRanked && (
          <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            Please rank all ideas before proceeding
          </div>
        )}
        
        <Button
          onClick={handleComplete}
          disabled={!allIdeasRanked}
          className="w-full"
          size="lg"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Ranking
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Your rankings will be used to refine the schema for better future ideas
      </div>
    </motion.div>
  );
}
