'use client';

import React, { useMemo } from 'react';
import { calculateCanvasBounds, lineIntersectsRect, PANEL_DIMENSIONS, PanelType } from './types';

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
  
  // Calculate dynamic canvas bounds based on panel positions
  const canvasBounds = useMemo(() => {
    const panels = Object.entries(panelPositions).map(([id, pos]) => ({
      id,
      type: 'context-input' as PanelType,
      iterationNumber: 0,
      position: pos,
      isActive: false,
      isCompleted: false
    }));
    
    const panelsRecord = Object.fromEntries(panels.map(p => [p.id, p]));
    return calculateCanvasBounds(panelsRecord);
  }, [panelPositions]);

  // Create panel rectangles for collision detection (adjusted to canvas bounds)
  const panelRects = useMemo(() => {
    return Object.entries(panelPositions).map(([id, pos]) => ({
      id,
      x: pos.x - canvasBounds.minX,
      y: pos.y - canvasBounds.minY,
      width: PANEL_DIMENSIONS.width,
      height: PANEL_DIMENSIONS.height
    }));
  }, [panelPositions, canvasBounds]);

  // Smart path calculation with collision avoidance
  const calculateSmartPath = (from: { x: number; y: number }, to: { x: number; y: number }, excludePanelIds: string[] = []) => {
    // Filter out the panels we're connecting from/to
    const obstacles = panelRects.filter(rect => !excludePanelIds.includes(rect.id));
    
    // Check if direct path is clear
    const directPathClear = !obstacles.some(rect => 
      lineIntersectsRect(from, to, rect)
    );
    
    if (directPathClear) {
      // Simple 90-degree angle path
      const midX = from.x + (to.x - from.x) * 0.5;
      return `M ${from.x} ${from.y} 
              L ${midX} ${from.y} 
              L ${midX} ${to.y} 
              L ${to.x} ${to.y}`;
    }
    
    // Path is blocked, route around obstacles
    const buffer = 20; // Distance to stay away from panels
    
    // Determine if we should route above or below
    const routeAbove = from.y > to.y;
    const routeY = routeAbove 
      ? Math.min(...obstacles.map(r => r.y)) - buffer
      : Math.max(...obstacles.map(r => r.y + r.height)) + buffer;
    
    // Create routed path
    return `M ${from.x} ${from.y} 
            L ${from.x + 50} ${from.y}
            L ${from.x + 50} ${routeY}
            L ${to.x - 50} ${routeY}
            L ${to.x - 50} ${to.y}
            L ${to.x} ${to.y}`;
  };

  // Get connection points for panels
  const getConnectionPoints = (fromPanelId: string, toPanelId: string) => {
    const fromPanel = panelPositions[fromPanelId];
    const toPanel = panelPositions[toPanelId];
    
    if (!fromPanel || !toPanel) return null;

    // Calculate connection points (right side of from panel, left side of to panel)
    const fromPoint = {
      x: fromPanel.x + PANEL_DIMENSIONS.width, // Panel width
      y: fromPanel.y + PANEL_DIMENSIONS.height / 2  // Panel height / 2
    };
    
    const toPoint = {
      x: toPanel.x,
      y: toPanel.y + PANEL_DIMENSIONS.height / 2
    };

    return { fromPoint, toPoint };
  };

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        width: canvasBounds.width,
        height: canvasBounds.height,
        left: canvasBounds.minX,
        top: canvasBounds.minY,
        zIndex: 1,
      }}
      viewBox={`0 0 ${canvasBounds.width} ${canvasBounds.height}`}
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
        // Adjust coordinates relative to canvas bounds
        const adjustedFromPoint = {
          x: fromPoint.x - canvasBounds.minX,
          y: fromPoint.y - canvasBounds.minY
        };
        const adjustedToPoint = {
          x: toPoint.x - canvasBounds.minX,
          y: toPoint.y - canvasBounds.minY
        };
        
        const path = calculateSmartPath(adjustedFromPoint, adjustedToPoint, [connection.fromPanelId, connection.toPanelId]);

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
          </g>
        );
      })}
    </svg>
  );
}
