'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ArrowRight, TrendingUp } from 'lucide-react';
import { IdeaSchema, IdeaWithEvaluation, refineSchemaBasedOnIdeaPreferences, IdeaRanking } from '@/actions/serverActions';

interface SchemaRefinementPanelProps {
  schema: IdeaSchema;
  rankings: Record<string, number>;
  ideas: IdeaWithEvaluation[];
  onComplete: (refinedSchema: IdeaSchema) => void;
}

export default function SchemaRefinementPanel({ 
  schema, 
  rankings, 
  ideas, 
  onComplete 
}: SchemaRefinementPanelProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [refinedSchema, setRefinedSchema] = useState<IdeaSchema | null>(null);
  const [error, setError] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);

  // Convert rankings and ideas to the format expected by the server action
  const prepareRankingsData = (): IdeaRanking[] => {
    return ideas.map((idea, index) => {
      const ideaKey = `idea-${index}`;
      const ranking = rankings[ideaKey] || 0;
      
      return {
        idea: idea.idea,
        description: '', // We don't have descriptions in IdeaWithEvaluation
        ranking: ranking.toString()
      };
    });
  };

  const handleRefineSchema = async () => {
    setIsRefining(true);
    setError('');

    try {
      const rankingsData = prepareRankingsData();
      const refined = await refineSchemaBasedOnIdeaPreferences(schema, rankingsData);
      setRefinedSchema(refined);
      setShowComparison(true);
    } catch (error) {
      console.error('Error refining schema:', error);
      setError('Failed to refine schema. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleAcceptRefinement = () => {
    if (refinedSchema) {
      onComplete(refinedSchema);
    }
  };

  const handleRejectRefinement = () => {
    setRefinedSchema(null);
    setShowComparison(false);
  };

  // Calculate ranking insights
  const rankingInsights = () => {
    const rankingValues = Object.values(rankings).filter(r => r > 0);
    const avgRanking = rankingValues.reduce((sum, r) => sum + r, 0) / rankingValues.length;
    const highRanked = rankingValues.filter(r => r >= 5).length;

    return { avgRanking, highRanked, total: rankingValues.length };
  };

  const insights = rankingInsights();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[600px] space-y-6"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Refine Schema</h2>
        </div>
        <p className="text-md text-gray-600">
          Use your idea rankings to improve the schema for better future results
        </p>
      </div>

      {/* Ranking Insights */}
      <Card className="p-4 bg-blue-50 border-accent border-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-blue-900">Your Ranking Insights</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {insights.avgRanking.toFixed(1)}
              </div>
              <div className="text-sm text-blue-700">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {insights.highRanked}
              </div>
              <div className="text-sm text-green-700">High Rated (5 stars)</div>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            <div className="text-sm font-medium text-gray-700">All Ranked Ideas:</div>
            <div className="flex flex-wrap gap-2">
              {ideas.map((idea, index) => {
                const ideaKey = `idea-${index}`;
                const ranking = rankings[ideaKey] || 0;
                
                if (ranking > 0) {
                  const getBadgeColor = (rank: number) => {
                    if (rank >= 5) return "bg-green-100 text-green-800";
                    if (rank >= 4) return "bg-blue-100 text-blue-800";
                    if (rank >= 2) return "bg-yellow-100 text-yellow-800";
                    return "bg-gray-100 text-gray-800";
                  };

                  return (
                    <Badge key={index} className={`${getBadgeColor(ranking)} text-xs`}>
                      {idea.idea.slice(0, 30)}... ({ranking}/5)
                    </Badge>
                  );
                }
                return null;
              })}
            </div>
            
            {/* Show high-rated ideas separately */}
            <div className="text-sm font-medium text-green-700 mt-4">Top Rated Ideas (5 stars):</div>
            <div className="flex flex-wrap gap-2">
              {ideas.map((idea, index) => {
                const ideaKey = `idea-${index}`;
                const ranking = rankings[ideaKey] || 0;
                
                if (ranking >= 5) {
                  return (
                    <Badge key={index} className="bg-green-100 text-green-800 text-xs font-medium">
                      ⭐ {idea.idea.slice(0, 35)}... ({ranking}/5)
                    </Badge>
                  );
                }
                return null;
              })}
              {ideas.filter((_, index) => {
                const ideaKey = `idea-${index}`;
                return rankings[ideaKey] >= 5;
              }).length === 0 && (
                <div className="text-sm text-gray-500 italic">No ideas rated 5 or higher</div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {!showComparison ? (
        /* Refine Button */
        <div className="space-y-4">
          <Button
            onClick={handleRefineSchema}
            disabled={isRefining}
            className="w-full"
            size="lg"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Rankings & Refining Schema...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refine Schema Based on Rankings
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      ) : (
        /* Schema Comparison */
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-green-700">
              ✨ Schema Refined!
            </h3>
            <p className="text-md text-gray-600">
              Compare the original and refined schemas below
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Schema */}
            <Card className="p-4 bg-red-50 border-red-400">
              <h4 className="font-semibold text-lg text-red-700 mb-3 flex items-center gap-2">
                Original Schema
              </h4>
              <div className="space-y-3 text-md">
                <div>
                  <div className="font-medium text-lg text-red-600">Criteria:</div>
                  <div className="space-y-1 mt-1 ">
                    {schema.criteria.map((criteria, index) => (
                      <div key={index} className="text-red-400">
                        • {criteria}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-lg text-red-600">Constraints:</div>
                  <div className="space-y-1 mt-1">
                    {
                      schema.constraints.map((constraint, index) => (
                        <div key={index} className="text-red-400">
                          • {constraint}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </Card>

            {/* Refined Schema */}
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-lg text-green-700 flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4" />
                Refined Schema
              </h4>
              <div className="space-y-3 text-md">
                <div>
                  <div className="font-medium text-lg text-green-600">Criteria:</div>
                  <div className="space-y-1 mt-1">
                    {refinedSchema && refinedSchema.criteria.map((criteria, index) => (
                      <div key={index} className="text-green-700">
                        • {criteria}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-lg text-green-600">Constraints:</div>
                  <div className="space-y-1 mt-1">
                    {refinedSchema && (
                      refinedSchema.constraints.map((constraint, index) => (
                        <div key={index} className="text-green-700">
                          • {constraint}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleRejectRefinement}
              className="bg-red-700 hover:bg-red-800 flex-1"
              size="lg"
            >
              Keep Original
            </Button>
            <Button
              onClick={handleAcceptRefinement}
              className="bg-green-700 hover:bg-green-800 flex-1"
              size="lg"
            >
              Use Refined Schema
            </Button>

          </div>
        </div>
      )}
    </motion.div>
  );
}
