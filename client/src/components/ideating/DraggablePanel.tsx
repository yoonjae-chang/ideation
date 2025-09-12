'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { PanelPosition, PanelType } from './types';

interface DraggablePanelProps {
  id: string;
  position: PanelPosition;
  isActive: boolean;
  isCompleted: boolean;
  iterationNumber: number;
  panelType: PanelType;
  children: React.ReactNode;
  onPositionChange?: (id: string, position: PanelPosition) => void;
}

export default function DraggablePanel({ 
  id, 
  position, 
  isActive,
  isCompleted,
  iterationNumber,
  panelType,
  children,
  onPositionChange
}: DraggablePanelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id,
    disabled: false,
  });

  // Prevent drag events from propagating from form elements
  const handleContentMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      e.stopPropagation();
    }
  };

  // Get status-based styling
  const getStatusStyling = () => {
    if (isActive) {
      return 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200/50';
    } else if (isCompleted) {
      return 'border-green-500 bg-green-50 shadow-md shadow-green-200/50';
    } else {
      return 'border-gray-300 bg-gray-50 shadow-sm';
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: isActive 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`z-10 ${isDragging ? 'z-50' : ''} relative`}
    >
      {/* Connection Points */}
      {/* <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-20">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" 
             title="Input Connection Point" />
      </div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-20">
        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md" 
             title="Output Connection Point" />
      </div> */}

      <Card className={`
        transition-all duration-200 border-2 relative
        ${getStatusStyling()}
        ${isDragging ? 'scale-105' : ''}
      `}>
        {/* Drag Handle with Iteration Info */}
        <div 
          {...listeners}
          className={`
            h-8 w-full rounded-t-lg
            cursor-grab active:cursor-grabbing
            flex items-center justify-between px-3
            ${isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'}
          `}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <span className="text-xs font-medium text-gray-600">
              Iteration {iterationNumber}
            </span>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-1">
            {isCompleted && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Completed" />
            )}
            {isActive && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Active" />
            )}
            <span className="text-xs text-gray-500 capitalize">
              {panelType.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        {/* Panel Content - NOT draggable */}
        <div 
          className="p-6" 
          style={{ pointerEvents: 'auto' }}
          onMouseDown={handleContentMouseDown}
        >
          {children}
        </div>
      </Card>
    </motion.div>
  );
}
