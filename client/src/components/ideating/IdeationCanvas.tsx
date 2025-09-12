'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Save } from 'lucide-react';
import { IdeaSchema } from '@/actions/serverActions';

// Import panel components (we'll create these next)
import ContextInputPanel from '@/components/ideating/ContextInputPanel';
import SchemaEditorPanel from '@/components/ideating/SchemaEditorPanel';
import IdeaGenerationPanel from '@/components/ideating/IdeaGenerationPanel';
import RankingPanel from '@/components/ideating/RankingPanel';
import SchemaRefinementPanel from '@/components/ideating/SchemaRefinementPanel';
import FlowGuide from '@/components/ideating/FlowGuide';
import DraggablePanel from '@/components/ideating/DraggablePanel';

export type PanelPosition = {
  x: number;
  y: number;
};

export type IdeationStep = 
  | 'context-input'
  | 'schema-editing'
  | 'idea-generation'
  | 'ranking'
  | 'schema-refinement';

interface IdeationCanvasProps {
  sessionId?: string;
}

export default function IdeationCanvas({ sessionId }: IdeationCanvasProps) {
  // Client-side hydration state
  const [isMounted, setIsMounted] = useState(false);

  // State management
  const [currentStep, setCurrentStep] = useState<IdeationStep>('context-input');
  const [sessionData, setSessionData] = useState<{
    id?: string;
    context: string;
    purpose: string;
    preferences: string;
  }>({
    context: '',
    purpose: '',
    preferences: ''
  });
  
  const [schema, setSchema] = useState<IdeaSchema | null>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [rankings, setRankings] = useState<Record<string, number>>({});
  const [schemaVersions, setSchemaVersions] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsets, setDragOffsets] = useState<Record<string, PanelPosition>>({});
  const [currentScale, setCurrentScale] = useState(1);

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Panel positions - arranged in a guided flow
  const [panelPositions, setPanelPositions] = useState<Record<string, PanelPosition>>({
    'context-input': { x: 100, y: 100 },
    'schema-editing': { x: 600, y: 100 },
    'idea-generation': { x: 1100, y: 100 },
    'ranking': { x: 100, y: 500 },
    'schema-refinement': { x: 600, y: 500 }
  });

  // Drag and drop sensors with improved settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Reduced distance for more responsive dragging
        delay: 50,   // Reduced delay
        tolerance: 3, // Reduced tolerance
      },
    })
  );

  // Store initial position when drag starts
  const [initialDragPositions, setInitialDragPositions] = useState<Record<string, PanelPosition>>({});

  // Handle panel drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true);
    const panelId = event.active.id as string;
    // Store the initial position when drag starts
    setInitialDragPositions(prev => ({
      ...prev,
      [panelId]: panelPositions[panelId]
    }));
  }, [panelPositions]);

  // Handle panel drag move (real-time updates)
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, delta } = event;
    const panelId = active.id as string;
    const initialPos = initialDragPositions[panelId];
    
    if (initialPos) {
      // Scale the delta by the inverse of current scale to maintain consistent drag speed
      const scaledDelta = {
        x: delta.x / currentScale,
        y: delta.y / currentScale
      };
      
      setPanelPositions(prev => ({
        ...prev,
        [panelId]: {
          x: initialPos.x + scaledDelta.x,
          y: initialPos.y + scaledDelta.y
        }
      }));
    }
  }, [initialDragPositions, currentScale]);

  // Handle panel drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const panelId = event.active.id as string;
    
    // Clear initial position
    setInitialDragPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[panelId];
      return newPositions;
    });
    
    setIsDragging(false);
  }, []);

  // Step progression handlers
  const handleContextComplete = useCallback((data: typeof sessionData, generatedSchema: IdeaSchema) => {
    setSessionData(data);
    setSchema(generatedSchema);
    setCurrentStep('schema-editing');
  }, []);

  const handleSchemaComplete = useCallback((updatedSchema: IdeaSchema) => {
    setSchema(updatedSchema);
    setCurrentStep('idea-generation');
  }, []);

  const handleIdeasGenerated = useCallback((generatedIdeas: any[]) => {
    setIdeas(generatedIdeas);
    setCurrentStep('ranking');
  }, []);

  const handleRankingComplete = useCallback((ideaRankings: Record<string, number>) => {
    setRankings(ideaRankings);
    setCurrentStep('schema-refinement');
  }, []);

  const handleSchemaRefined = useCallback((refinedSchema: IdeaSchema) => {
    setSchema(refinedSchema);
    setSchemaVersions(prev => [...prev, refinedSchema]);
    setCurrentStep('idea-generation'); // Loop back to generate new ideas
  }, []);

  // Canvas controls
  const handleSaveSession = useCallback(async () => {
    // TODO: Implement save functionality
    console.log('Saving session...');
  }, []);

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="h-screen w-full bg-gray-900 overflow-hidden relative flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-sub-foreground">Loading ideation canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white overflow-hidden relative">
      {/* Canvas Background Grid - Fixed positioning */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(white, 1px, transparent 1px),
            linear-gradient(90deg, white, 1px, transparent 1px)
          `,
          backgroundSize: '27px 27px'
        }}
      />


      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button variant="outline" size="lg" onClick={handleSaveSession}>
          <Save className="" />
          Save
        </Button>
      </div>

      {/* Flow Guide */}
      <FlowGuide currentStep={currentStep} />

      {/* Main Canvas */}
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={2}
        limitToBounds={false}
        centerOnInit={false}
        wheel={{ step: 0.1 }}
        panning={{ 
          velocityDisabled: true,
          disabled: isDragging // Disable panning when dragging panels
        }}
        doubleClick={{ disabled: true }} // Prevent accidental double-click zoom
        onTransformed={(ref, state) => {
          // Update current scale for drag sensitivity adjustment
          setCurrentScale(state.scale);
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom Controls - Moved outside to be fixed on screen */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
              <Button variant="outline" size="lg" onClick={() => zoomIn()}>
                <ZoomIn className="w-10 h-10" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => zoomOut()}>
                <ZoomOut className="w-10 h-10" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => resetTransform()}>
                <RotateCcw className="w-10 h-10" />
              </Button>
            </div>

            <TransformComponent
              wrapperClass="w-full h-full"
              contentClass="w-full h-full relative"
            >
              <DndContext 
                sensors={sensors} 
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              >
                {/* Canvas Content Area */}
                <div className="relative w-full h-full min-w-[200vw] min-h-[200vh]">

                {/* Panels */}
                <AnimatePresence mode="wait">
                  {/* Context Input Panel */}
                  <DraggablePanel
                    key="context-input-panel"
                    id="context-input"
                    position={panelPositions['context-input']}
                    isActive={currentStep === 'context-input'}
                  >
                    <ContextInputPanel
                      onComplete={handleContextComplete}
                      sessionData={sessionData}
                    />
                  </DraggablePanel>

                  {/* Schema Editor Panel */}
                  {schema && (
                    <DraggablePanel
                      key="schema-editing-panel"
                      id="schema-editing"
                      position={panelPositions['schema-editing']}
                      isActive={currentStep === 'schema-editing'}
                    >
                      <SchemaEditorPanel
                        schema={schema}
                        onComplete={handleSchemaComplete}
                      />
                    </DraggablePanel>
                  )}

                  {/* Idea Generation Panel */}
                  {currentStep === 'idea-generation' && schema && (
                    <DraggablePanel
                      key="idea-generation-panel"
                      id="idea-generation"
                      position={panelPositions['idea-generation']}
                      isActive={currentStep === 'idea-generation'}
                    >
                      <IdeaGenerationPanel
                        schema={schema}
                        onComplete={handleIdeasGenerated}
                      />
                    </DraggablePanel>
                  )}

                  {/* Ranking Panel */}
                  {ideas.length > 0 && (
                    <DraggablePanel
                      key="ranking-panel"
                      id="ranking"
                      position={panelPositions['ranking']}
                      isActive={currentStep === 'ranking'}
                    >
                      <RankingPanel
                        ideas={ideas}
                        rankings={rankings}
                        onComplete={handleRankingComplete}
                      />
                    </DraggablePanel>
                  )}

                  {/* Schema Refinement Panel */}
                  {currentStep === 'schema-refinement' && schema && Object.keys(rankings).length > 0 && (
                    <DraggablePanel
                      key="schema-refinement-panel"
                      id="schema-refinement"
                      position={panelPositions['schema-refinement']}
                      isActive={currentStep === 'schema-refinement'}
                    >
                      <SchemaRefinementPanel
                        schema={schema}
                        rankings={rankings}
                        ideas={ideas}
                        onComplete={handleSchemaRefined}
                      />
                    </DraggablePanel>
                  )}
                </AnimatePresence>
                </div>
              </DndContext>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
