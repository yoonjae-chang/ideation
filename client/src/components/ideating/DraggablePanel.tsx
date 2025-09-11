'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { PanelPosition } from './IdeationCanvas';

interface DraggablePanelProps {
  id: string;
  position: PanelPosition;
  isActive: boolean;
  children: React.ReactNode;
}

export default function DraggablePanel({ 
  id, 
  position, 
  isActive, 
  children 
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
      className={`z-10 ${isDragging ? 'z-50' : ''}`}
      // Remove drag attributes from the main container
    >
      <Card className={`
        bg-white border-2 transition-all duration-200
        ${isActive 
          ? 'border-blue-200 shadow-lg' 
          : 'border-gray-200 shadow-md opacity-75'
        }
        ${isDragging ? 'shadow-2xl scale-105' : ''}
      `}>
        {/* Drag Handle */}
        <div 
          {...listeners}
          className={`
            h-6 w-full bg-gray-50 border-b border-gray-200 rounded-t-lg
            cursor-grab active:cursor-grabbing
            flex items-center justify-center
            ${isActive ? 'bg-blue-50' : ''}
          `}
        >
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
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
