'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { IdeaSchema } from '@/actions/serverActions';

// Import panel components
import ContextInputPanel from '@/components/ideating/ContextInputPanel';
import SchemaEditorPanel from '@/components/ideating/SchemaEditorPanel';
import IdeaGenerationPanel from '@/components/ideating/IdeaGenerationPanel';
import RankingPanel from '@/components/ideating/RankingPanel';
import SchemaRefinementPanel from '@/components/ideating/SchemaRefinementPanel';
import DraggablePanel from '@/components/ideating/DraggablePanel';
import ConnectionLines from '@/components/ideating/ConnectionLines';

// Import types and utilities
import { 
  PanelPosition, 
  PanelType, 
  PanelInstance, 
  WorkflowIteration, 
  Connection,
  generatePanelId,
  generateConnectionId,
  calculateIterationPosition,
  calculateNextPanelPosition
} from '@/components/ideating/types';

interface IdeationCanvasProps {
  sessionId?: string;
  selectedTemplate?: {
    id: string;
    title: string;
    description: string;
    purpose: string;
    schema: {
      audience: string;
      domain: string;
      tone: string;
      constraints: string;
    };
  } | null;
}

export default function IdeationCanvas({ selectedTemplate }: IdeationCanvasProps) {
  // Client-side hydration state
  const [isMounted, setIsMounted] = useState(false);

  // New iteration-based state management
  const [iterations, setIterations] = useState<WorkflowIteration[]>([]);
  const [allPanels, setAllPanels] = useState<Record<string, PanelInstance>>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);

  // Initialize the first iteration with context input panel
  const initializeFirstIteration = useCallback(() => {
    const contextPanelId = generatePanelId('context-input', 0);
    const contextPosition = calculateIterationPosition(0, 'context-input');
    
    const contextPanel: PanelInstance = {
      id: contextPanelId,
      type: 'context-input',
      iterationNumber: 0,
      position: contextPosition,
      isActive: true,
      isCompleted: false,
      data: null
    };

    const firstIteration: WorkflowIteration = {
      iterationNumber: 0,
      panels: [contextPanel],
      connections: [],
      isActive: true,
      isCompleted: false
    };

    setIterations([firstIteration]);
    setAllPanels({ [contextPanelId]: contextPanel });
    setActivePanel(contextPanelId);
  }, []);

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setIsMounted(true);
    // Initialize first iteration
    initializeFirstIteration();
  }, [initializeFirstIteration]);

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

  // Update connections when a panel is moved
  const updateConnectionsForPanel = useCallback((panelId: string, newPosition: PanelPosition) => {
    setConnections(prev => prev.map(conn => {
      if (conn.fromPanelId === panelId) {
        return {
          ...conn,
          fromPoint: {
            x: newPosition.x + 400, // Panel width
            y: newPosition.y + 150  // Panel height / 2
          }
        };
      } else if (conn.toPanelId === panelId) {
        return {
          ...conn,
          toPoint: {
            x: newPosition.x,
            y: newPosition.y + 150
          }
        };
      }
      return conn;
    }));
  }, []);

  // Handle panel drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true);
    const panelId = event.active.id as string;
    // Store the initial position when drag starts
    setInitialDragPositions(prev => ({
      ...prev,
      [panelId]: allPanels[panelId]?.position || { x: 0, y: 0 }
    }));
  }, [allPanels]);

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
      
      const newPosition = {
        x: initialPos.x + scaledDelta.x,
        y: initialPos.y + scaledDelta.y
      };

      // Update panel position
      setAllPanels(prev => ({
        ...prev,
        [panelId]: {
          ...prev[panelId],
          position: newPosition
        }
      }));

      // Update connections in real-time
      updateConnectionsForPanel(panelId, newPosition);
    }
  }, [initialDragPositions, currentScale, updateConnectionsForPanel]);

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

  // Create next panel in workflow
  const createNextPanel = useCallback((currentPanelId: string, nextType: PanelType, data?: Record<string, unknown>) => {
    const currentPanel = allPanels[currentPanelId];
    if (!currentPanel) return;

    const nextPanelId = generatePanelId(nextType, currentPanel.iterationNumber);
    // Use calculateNextPanelPosition to place new panels to the right of current panel
    const nextPosition = calculateNextPanelPosition(currentPanel);

    const nextPanel: PanelInstance = {
      id: nextPanelId,
      type: nextType,
      iterationNumber: currentPanel.iterationNumber,
      position: nextPosition,
      isActive: true,
      isCompleted: false,
      data
    };

    // Mark current panel as completed
    setAllPanels(prev => ({
      ...prev,
      [currentPanelId]: { ...prev[currentPanelId], isActive: false, isCompleted: true },
      [nextPanelId]: nextPanel
    }));

    // Update iteration
    setIterations(prev => prev.map(iter => {
      if (iter.iterationNumber === currentPanel.iterationNumber) {
        return {
          ...iter,
          panels: [...iter.panels, nextPanel]
        };
      }
      return iter;
    }));

    // Create connection between panels
    const connection: Connection = {
      id: generateConnectionId(currentPanelId, nextPanelId),
      fromPanelId: currentPanelId,
      toPanelId: nextPanelId,
      fromPoint: {
        x: currentPanel.position.x + 400,
        y: currentPanel.position.y + 150
      },
      toPoint: {
        x: nextPosition.x,
        y: nextPosition.y + 150
      },
      iterationFrom: currentPanel.iterationNumber,
      iterationTo: currentPanel.iterationNumber,
      type: 'workflow'
    };

    setConnections(prev => [...prev, connection]);
    setActivePanel(nextPanelId);
  }, [allPanels]);

  // Create new iteration (loop back)
  const createNewIteration = useCallback((refinedSchema: IdeaSchema, previousIterationData: WorkflowIteration) => {
    const newIterationNumber = currentIteration + 1;
    
    // Create schema editing panel for new iteration
    const schemaEditPanelId = generatePanelId('schema-editing', newIterationNumber);
    const schemaEditPosition = calculateIterationPosition(newIterationNumber, 'schema-editing', allPanels);

    const schemaEditPanel: PanelInstance = {
      id: schemaEditPanelId,
      type: 'schema-editing',
      iterationNumber: newIterationNumber,
      position: schemaEditPosition,
      isActive: true,
      isCompleted: false,
      data: { schema: refinedSchema, previousData: previousIterationData }
    };

    const newIteration: WorkflowIteration = {
      iterationNumber: newIterationNumber,
      panels: [schemaEditPanel],
      connections: [],
      schema: refinedSchema,
      isActive: true,
      isCompleted: false
    };

    // Add new iteration and panel
    setIterations(prev => [...prev, newIteration]);
    setAllPanels(prev => ({
      ...prev,
      [schemaEditPanelId]: schemaEditPanel
    }));

    // Create loop connection from previous iteration's schema refinement to new schema editing
    const previousIteration = iterations[currentIteration];
    const refinementPanel = previousIteration?.panels.find(p => p.type === 'schema-refinement');
    
    if (refinementPanel) {
      const loopConnection: Connection = {
        id: generateConnectionId(refinementPanel.id, schemaEditPanelId),
        fromPanelId: refinementPanel.id,
        toPanelId: schemaEditPanelId,
        fromPoint: {
          x: refinementPanel.position.x + 400,
          y: refinementPanel.position.y + 150
        },
        toPoint: {
          x: schemaEditPosition.x,
          y: schemaEditPosition.y + 150
        },
        iterationFrom: currentIteration,
        iterationTo: newIterationNumber,
        type: 'iteration-loop'
      };

      setConnections(prev => [...prev, loopConnection]);
    }

    setCurrentIteration(newIterationNumber);
    setActivePanel(schemaEditPanelId);
  }, [currentIteration, iterations]);

  // Step progression handlers
  const handleContextComplete = useCallback((data: { context: string; purpose: string; preferences: string; id?: string }, generatedSchema: IdeaSchema) => {
    if (!activePanel) return;
    
    // Update current iteration with session data and schema
    setIterations(prev => prev.map(iter => {
      if (iter.iterationNumber === 0) {
        return { ...iter, sessionData: data, schema: generatedSchema };
      }
      return iter;
    }));

    createNextPanel(activePanel, 'schema-editing', { schema: generatedSchema, sessionData: data });
  }, [activePanel, createNextPanel]);

  const handleSchemaComplete = useCallback((updatedSchema: IdeaSchema) => {
    if (!activePanel) return;
    createNextPanel(activePanel, 'idea-generation', { schema: updatedSchema });
  }, [activePanel, createNextPanel]);

  const handleIdeasGenerated = useCallback((generatedIdeas: { idea: string; description: string; evaluation: string }[]) => {
    if (!activePanel) return;
    createNextPanel(activePanel, 'ranking', { ideas: generatedIdeas });
  }, [activePanel, createNextPanel]);

  const handleRankingComplete = useCallback((ideaRankings: Record<string, number>) => {
    if (!activePanel) return;
    
    // Get the current iteration's schema and ideas for schema refinement
    const currentPanel = allPanels[activePanel];
    const currentIterationData = iterations[currentPanel.iterationNumber];
    
    createNextPanel(activePanel, 'schema-refinement', { 
      rankings: ideaRankings,
      schema: currentIterationData?.schema,
      ideas: currentPanel.data?.ideas || []
    });
  }, [activePanel, createNextPanel, allPanels, iterations]);

  const handleSchemaRefined = useCallback((refinedSchema: IdeaSchema) => {
    if (!activePanel) return;
    
    // Mark current panel as completed
    setAllPanels(prev => ({
      ...prev,
      [activePanel]: { ...prev[activePanel], isActive: false, isCompleted: true }
    }));

    // Create new iteration automatically
    const currentIterationData = iterations[currentIteration];
    createNewIteration(refinedSchema, currentIterationData);
  }, [activePanel, currentIteration, iterations, createNewIteration]);

  // Canvas controls
  // const handleSaveSession = useCallback(async () => {
  //   // TODO: Implement save functionality
  //   console.log('Saving session...');
  // }, []);

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
      {/* <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button variant="outline" size="lg" onClick={handleSaveSession}>
          <Save className="" />
          Save
        </Button>
      </div> */}

      {/* Flow Guide */}
      {/* <FlowGuide currentStep={currentStep} /> */}

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
                {/* Canvas Content Area - Infinitely Large */}
                <div className="relative w-full h-full min-w-[500vw] min-h-[500vh]">
                  
                  {/* Connection Lines */}
                  <ConnectionLines 
                    connections={connections}
                    panelPositions={Object.fromEntries(
                      Object.entries(allPanels).map(([id, panel]) => [id, panel.position])
                    )}
                    scale={currentScale}
                  />

                  {/* Render All Panels from All Iterations */}
                  <AnimatePresence>
                    {Object.values(allPanels).map((panel) => {
                      const renderPanelContent = () => {
                        switch (panel.type) {
                          case 'context-input':
                            return (
                              <ContextInputPanel
                                onComplete={handleContextComplete}
                                sessionData={(panel.data?.sessionData as { context: string; purpose: string; preferences: string }) || { context: '', purpose: '', preferences: '' }}
                                selectedTemplate={panel.iterationNumber === 0 ? selectedTemplate : null}
                              />
                            );
                          
                          case 'schema-editing':
                            return (
                              <SchemaEditorPanel
                                schema={panel.data?.schema as IdeaSchema}
                                onComplete={handleSchemaComplete}
                              />
                            );
                          
                          case 'idea-generation':
                            return (
                              <IdeaGenerationPanel
                                schema={panel.data?.schema as IdeaSchema}
                                onComplete={handleIdeasGenerated}
                              />
                            );
                          
                          case 'ranking':
                            return (
                              <RankingPanel
                                ideas={(panel.data?.ideas as { idea: string; description: string; evaluation: string }[]) || []}
                                rankings={(panel.data?.rankings as Record<string, number>) || {}}
                                onComplete={handleRankingComplete}
                              />
                            );
                          
                          case 'schema-refinement':
                            // Get schema from current iteration if not in panel data
                            const currentIteration = iterations[panel.iterationNumber];
                            const schemaToUse = (panel.data?.schema as IdeaSchema) || currentIteration?.schema;
                            
                            return (
                              <SchemaRefinementPanel
                                schema={schemaToUse as IdeaSchema}
                                rankings={(panel.data?.rankings as Record<string, number>) || {}}
                                ideas={(panel.data?.ideas as { idea: string; description: string; evaluation: string }[]) || []}
                                onComplete={handleSchemaRefined}
                              />
                            );
                          
                          default:
                            return <div>Unknown panel type</div>;
                        }
                      };

                      return (
                        <DraggablePanel
                          key={panel.id}
                          id={panel.id}
                          position={panel.position}
                          isActive={panel.isActive}
                          isCompleted={panel.isCompleted}
                          iterationNumber={panel.iterationNumber}
                          panelType={panel.type}
                        >
                          {renderPanelContent()}
                        </DraggablePanel>
                      );
                    })}
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
