'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, CheckCircle, Star } from 'lucide-react';
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

  const handleRankingChange = (ideaIndex: number, rating: number) => {
    const ideaKey = `idea-${ideaIndex}`;
    setCurrentRankings(prev => ({
      ...prev,
      [ideaKey]: rating
    }));
  };

  const handleComplete = () => {
    onComplete(currentRankings);
  };

  const getRankingColor = (ranking: number) => {
    if (ranking >= 5) return 'text-green-600';
    if (ranking >= 4) return 'text-blue-600';
    if (ranking >= 3) return 'text-yellow-600';
    if (ranking >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRankingLabel = (ranking: number) => {
    if (ranking === 5) return 'Excellent';
    if (ranking === 4) return 'Very Good';
    if (ranking === 3) return 'Good';
    if (ranking === 2) return 'Fair';
    if (ranking === 1) return 'Poor';
    return 'Unrated';
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
      <div className="text-center px-4">
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Rank Your Ideas</h2>
        </div>
        <p className="text-md text-gray-600">
          Rate each idea from 1-5 stars based on your personal preferences and judgment and the AI will learn from your rankings and become better at generating ideas that you will like.
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="p-4 bg-blue-50 border-accent border-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
              <Card className={`p-4 transition-all duration-200 bg-blue-50 border-accent border-2`}>
                <div className="space-y-2">
                  {/* Idea Header */}
                  <div className="flex items-start flex-row justify-between gap-3">
                      <div className="font-semibold text-lg text-gray-900">
                        Idea {index + 1}: {idea.idea}
                      </div>
                    <div className={`text-lg font-medium ${getRankingColor(currentRanking)}`}>
                      {currentRanking > 0 ? getRankingLabel(currentRanking) : 'Unrated'}
                    </div>
                  </div>

                  {/* Idea Description */}
                  <div className="text-md text-gray-600">
                    {idea.description}
                  </div>

                  {/* Star Rating */}
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRankingChange(index, star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= currentRanking
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          />
                        </button>
                      ))}

                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Complete Button */}
      <div className="space-y-3">        
        <Button
          onClick={handleComplete}
          disabled={!allIdeasRanked}
          className="w-full"
          size="lg"
        >
          Complete Ranking
        </Button>
      </div>

    </motion.div>
  );
}
