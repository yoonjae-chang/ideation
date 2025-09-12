'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import panel components
import ContextInputPanel from '@/components/ideating/ContextInputPanel';
import SchemaEditorPanel from '@/components/ideating/SchemaEditorPanel';
import IdeaGenerationPanel from '@/components/ideating/IdeaGenerationPanel';
import RankingPanel from '@/components/ideating/RankingPanel';
import SchemaRefinementPanel from '@/components/ideating/SchemaRefinementPanel';

import { PanelInstance, WorkflowIteration } from '@/components/ideating/types';
import { IdeaSchema } from '@/actions/serverActions';

// Define the data type for custom nodes
interface CustomNodeData {
  panel: PanelInstance;
  onContextComplete: (data: { context: string; purpose: string; preferences: string; id?: string }, generatedSchema: IdeaSchema) => void;
  onSchemaComplete: (updatedSchema: IdeaSchema) => void;
  onIdeasGenerated: (generatedIdeas: { idea: string; description: string; evaluation: string }[]) => void;
  onRankingComplete: (ideaRankings: Record<string, number>) => void;
  onSchemaRefined: (refinedSchema: IdeaSchema) => void;
  iterations: WorkflowIteration[];
}

// Custom node component wrapper
const CustomNodeWrapper = ({ data }: { data: CustomNodeData }) => {
  const { panel, onContextComplete, onSchemaComplete, onIdeasGenerated, onRankingComplete, onSchemaRefined, iterations } = data;
  
  const renderPanelContent = () => {
    switch (panel.type) {
      case 'context-input':
        return (
          <ContextInputPanel
            onComplete={onContextComplete}
            sessionData={(panel.data?.sessionData as { context: string; purpose: string; preferences: string }) || { context: '', purpose: '', preferences: '' }}
          />
        );
      
      case 'schema-editing':
        return (
          <SchemaEditorPanel
            schema={panel.data?.schema as IdeaSchema}
            onComplete={onSchemaComplete}
          />
        );
      
      case 'idea-generation':
        return (
          <IdeaGenerationPanel
            schema={panel.data?.schema as IdeaSchema}
            onComplete={onIdeasGenerated}
          />
        );
      
      case 'ranking':
        return (
          <RankingPanel
            ideas={(panel.data?.ideas as { idea: string; description: string; evaluation: string }[]) || []}
            rankings={(panel.data?.rankings as Record<string, number>) || {}}
            onComplete={onRankingComplete}
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
            onComplete={onSchemaRefined}
          />
        );
      
      default:
        return <div>Unknown panel type</div>;
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-lg border-2 min-w-[400px] min-h-[300px]
        ${panel.isActive ? 'border-blue-500 shadow-blue-200' : 'border-gray-300'}
        ${panel.isCompleted ? 'opacity-75' : ''}
      `}
    >
      {/* Panel Header */}
      <div className={`
        px-4 py-2 rounded-t-lg text-sm font-medium
        ${panel.isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}
      `}>
        <div className="flex items-center justify-between">
          <span className="capitalize">{panel.type.replace('-', ' ')}</span>
          <span className="text-xs opacity-75">
            Iteration {panel.iterationNumber + 1}
          </span>
        </div>
      </div>
      
      {/* Panel Content */}
      <div className="p-4">
        {renderPanelContent()}
      </div>
    </div>
  );
};


interface XyFlowCanvasProps {
  panels: Record<string, PanelInstance>;
  connections: Array<{
    id: string;
    fromPanelId: string;
    toPanelId: string;
    type: 'workflow' | 'iteration-loop';
    iterationFrom: number;
    iterationTo: number;
  }>;
  iterations: WorkflowIteration[];
  onContextComplete: (data: { context: string; purpose: string; preferences: string; id?: string }, generatedSchema: IdeaSchema) => void;
  onSchemaComplete: (updatedSchema: IdeaSchema) => void;
  onIdeasGenerated: (generatedIdeas: { idea: string; description: string; evaluation: string }[]) => void;
  onRankingComplete: (ideaRankings: Record<string, number>) => void;
  onSchemaRefined: (refinedSchema: IdeaSchema) => void;
}

export default function XyFlowCanvas({
  panels,
  connections,
  iterations,
  onContextComplete,
  onSchemaComplete,
  onIdeasGenerated,
  onRankingComplete,
  onSchemaRefined,
}: XyFlowCanvasProps) {
  
  // Convert panels to xyflow nodes
  const initialNodes: Node[] = useMemo(() => {
    return Object.values(panels).map((panel) => ({
      id: panel.id,
      type: 'default',
      position: { x: panel.position.x, y: panel.position.y },
      data: {
        panel,
        onContextComplete,
        onSchemaComplete,
        onIdeasGenerated,
        onRankingComplete,
        onSchemaRefined,
        iterations,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));
  }, [panels, onContextComplete, onSchemaComplete, onIdeasGenerated, onRankingComplete, onSchemaRefined, iterations]);

  // Convert connections to xyflow edges
  const initialEdges: Edge[] = useMemo(() => {
    return connections.map((connection) => ({
      id: connection.id,
      source: connection.fromPanelId,
      target: connection.toPanelId,
      type: connection.type === 'iteration-loop' ? 'smoothstep' : 'default',
      animated: connection.type === 'iteration-loop',
      style: {
        stroke: connection.type === 'iteration-loop' ? '#10b981' : '#3b82f6',
        strokeWidth: connection.type === 'iteration-loop' ? 3 : 2,
        strokeDasharray: connection.type === 'iteration-loop' ? '5,5' : 'none',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: connection.type === 'iteration-loop' ? '#10b981' : '#3b82f6',
      },
      label: connection.type === 'iteration-loop' 
        ? `Loop: ${connection.iterationFrom + 1} → ${connection.iterationTo + 1}`
        : `Step ${connection.iterationFrom + 1}`,
      labelStyle: {
        fontSize: 12,
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: 'white',
        fillOpacity: 0.8,
      },
    }));
  }, [connections]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when panels change
  React.useEffect(() => {
    const updatedNodes = Object.values(panels).map((panel) => ({
      id: panel.id,
      type: 'default',
      position: { x: panel.position.x, y: panel.position.y },
      data: {
        panel,
        onContextComplete,
        onSchemaComplete,
        onIdeasGenerated,
        onRankingComplete,
        onSchemaRefined,
        iterations,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));
    setNodes(updatedNodes);
  }, [panels, setNodes, onContextComplete, onSchemaComplete, onIdeasGenerated, onRankingComplete, onSchemaRefined, iterations]);

  // Update edges when connections change
  React.useEffect(() => {
    const updatedEdges = connections.map((connection) => ({
      id: connection.id,
      source: connection.fromPanelId,
      target: connection.toPanelId,
      type: connection.type === 'iteration-loop' ? 'smoothstep' : 'default',
      animated: connection.type === 'iteration-loop',
      style: {
        stroke: connection.type === 'iteration-loop' ? '#10b981' : '#3b82f6',
        strokeWidth: connection.type === 'iteration-loop' ? 3 : 2,
        strokeDasharray: connection.type === 'iteration-loop' ? '5,5' : 'none',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: connection.type === 'iteration-loop' ? '#10b981' : '#3b82f6',
      },
      label: connection.type === 'iteration-loop' 
        ? `Loop: ${connection.iterationFrom + 1} → ${connection.iterationTo + 1}`
        : `Step ${connection.iterationFrom + 1}`,
      labelStyle: {
        fontSize: 12,
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: 'white',
        fillOpacity: 0.8,
      },
    }));
    setEdges(updatedEdges);
  }, [connections, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Custom node types
  const nodeTypes = useMemo(() => ({
    default: CustomNodeWrapper,
  }), []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls />
        <MiniMap 
          nodeColor="#3b82f6"
          maskColor="rgba(255, 255, 255, 0.2)"
          position="top-right"
        />
      </ReactFlow>
    </div>
  );
}
