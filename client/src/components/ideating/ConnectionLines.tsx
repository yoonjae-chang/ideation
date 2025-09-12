'use client';

import React from 'react';

export interface Connection {
  id: string;
  fromPanelId: string;
  toPanelId: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  iterationFrom: number;
  iterationTo: number;
  type: 'workflow' | 'iteration-loop';
}

export interface ConnectionPoint {
  x: number;
  y: number;
  type: 'output' | 'input';
}

interface ConnectionLinesProps {
  connections: Connection[];
  panelPositions: Record<string, { x: number; y: number }>;
  scale: number;
}

export default function ConnectionLines({ 
  connections, 
  panelPositions, 
  scale 
}: ConnectionLinesProps) {
  
  // Calculate 90-degree angle path between two points
  const calculatePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const midX = from.x + (to.x - from.x) * 0.5;
    
    // Create 90-degree angle path
    return `M ${from.x} ${from.y} 
            L ${midX} ${from.y} 
            L ${midX} ${to.y} 
            L ${to.x} ${to.y}`;
  };

  // Calculate arrow marker position and rotation
  const calculateArrowTransform = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const midX = from.x + (to.x - from.x) * 0.5;
    
    // Place arrow at the final segment
    const arrowX = midX + (to.x - midX) * 0.7;
    const arrowY = to.y;
    
    // Determine rotation based on direction
    const rotation = to.x > midX ? 0 : 180;
    
    return `translate(${arrowX}, ${arrowY}) rotate(${rotation})`;
  };

  // Get connection points for panels
  const getConnectionPoints = (fromPanelId: string, toPanelId: string) => {
    const fromPanel = panelPositions[fromPanelId];
    const toPanel = panelPositions[toPanelId];
    
    if (!fromPanel || !toPanel) return null;

    // Calculate connection points (right side of from panel, left side of to panel)
    const fromPoint = {
      x: fromPanel.x + 400, // Panel width
      y: fromPanel.y + 150  // Panel height / 2
    };
    
    const toPoint = {
      x: toPanel.x,
      y: toPanel.y + 150
    };

    return { fromPoint, toPoint };
  };

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        width: '500vw',
        height: '500vh',
        left: 0,
        top: 0,
        zIndex: 1,
      }}
    >
      <defs>
        {/* Arrow marker definition */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#3b82f6"
            stroke="#3b82f6"
            strokeWidth="1"
          />
        </marker>
        
        {/* Glow effect for active connections */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {connections.map((connection) => {
        const connectionPoints = getConnectionPoints(connection.fromPanelId, connection.toPanelId);
        
        if (!connectionPoints) return null;

        const { fromPoint, toPoint } = connectionPoints;
        const path = calculatePath(fromPoint, toPoint);

        // Style based on connection type
        const isLoopConnection = connection.type === 'iteration-loop';
        const strokeColor = isLoopConnection ? '#10b981' : '#3b82f6'; // Green for loop, blue for workflow
        const strokeWidth = (isLoopConnection ? 3 : 2) / scale;

        return (
          <g key={connection.id}>
            {/* Connection line */}
            <path
              d={path}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="none"
              markerEnd="url(#arrowhead)"
              className="transition-all duration-200"
              style={{
                filter: isLoopConnection ? 'url(#glow)' : 'none',
                strokeDasharray: isLoopConnection ? '5,5' : 'none'
              }}
            />
            
            {/* Connection label */}
            <text
              x={fromPoint.x + (toPoint.x - fromPoint.x) * 0.5}
              y={fromPoint.y - 10}
              fill="#6b7280"
              fontSize={12 / scale}
              textAnchor="middle"
              className="pointer-events-none select-none"
            >
              {isLoopConnection 
                ? `Loop: ${connection.iterationFrom} → ${connection.iterationTo}`
                : `Step ${connection.iterationFrom}`
              }
            </text>
          </g>
        );
      })}
    </svg>
  );
}
