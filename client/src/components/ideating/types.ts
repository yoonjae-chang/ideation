import { IdeaSchema } from '@/actions/serverActions';

export interface PanelPosition {
  x: number;
  y: number;
}

export type PanelType = 
  | 'context-input'
  | 'schema-editing'
  | 'idea-generation'
  | 'ranking'
  | 'schema-refinement';

export interface PanelInstance {
  id: string;
  type: PanelType;
  iterationNumber: number;
  position: PanelPosition;
  isActive: boolean;
  isCompleted: boolean;
  data?: Record<string, unknown> | null; // Panel-specific data
}

export interface WorkflowIteration {
  iterationNumber: number;
  panels: PanelInstance[];
  connections: string[]; // Connection IDs
  sessionData?: {
    context: string;
    purpose: string;
    preferences: string;
  };
  schema?: IdeaSchema;
  ideas?: unknown[];
  rankings?: Record<string, number>;
  isActive: boolean;
  isCompleted: boolean;
}

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

export const PANEL_DIMENSIONS = {
  width: 400,
  height: 300,
  margin: 50
};

export const WORKFLOW_SEQUENCE: PanelType[] = [
  'context-input',
  'schema-editing', 
  'idea-generation',
  'ranking',
  'schema-refinement'
];

// Generate unique panel ID
export const generatePanelId = (type: PanelType, iteration: number): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${type}-iter-${iteration}-${timestamp}-${random}`;
};

// Generate unique connection ID
export const generateConnectionId = (fromId: string, toId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `conn-${fromId}-${toId}-${timestamp}-${random}`;
};

// Calculate horizontal stacking position for new iteration
export const calculateIterationPosition = (
  iterationNumber: number, 
  panelType: PanelType
): PanelPosition => {
  const basePositions: Record<PanelType, PanelPosition> = {
    'context-input': { x: 100, y: 100 },
    'schema-editing': { x: 100, y: 450 },
    'idea-generation': { x: 100, y: 800 },
    'ranking': { x: 100, y: 1150 },
    'schema-refinement': { x: 100, y: 1500 }
  };

  const basePos = basePositions[panelType];
  const horizontalOffset = iterationNumber * (PANEL_DIMENSIONS.width + PANEL_DIMENSIONS.margin * 2);

  return {
    x: basePos.x + horizontalOffset,
    y: basePos.y
  };
};

// Calculate position for next panel in workflow (to the right of current panel)
export const calculateNextPanelPosition = (currentPanel: PanelInstance): PanelPosition => {
  const horizontalGap = 100; // Gap between panels
  return {
    x: currentPanel.position.x + PANEL_DIMENSIONS.width + horizontalGap,
    y: currentPanel.position.y // Same vertical level
  };
};

// Calculate dynamic canvas bounds based on all panel positions
export const calculateCanvasBounds = (panels: Record<string, PanelInstance>) => {
  if (Object.keys(panels).length === 0) {
    return { minX: 0, maxX: 5000, minY: 0, maxY: 5000, width: 5000, height: 5000 };
  }

  const positions = Object.values(panels).map(p => p.position);
  const buffer = 300; // Buffer around panels
  
  const minX = Math.min(...positions.map(p => p.x)) - buffer;
  const maxX = Math.max(...positions.map(p => p.x + PANEL_DIMENSIONS.width)) + buffer;
  const minY = Math.min(...positions.map(p => p.y)) - buffer;
  const maxY = Math.max(...positions.map(p => p.y + PANEL_DIMENSIONS.height)) + buffer;
  
  return { 
    minX, 
    maxX, 
    minY, 
    maxY, 
    width: maxX - minX, 
    height: maxY - minY 
  };
};

// Check if a line segment intersects with a rectangle (panel)
export const lineIntersectsRect = (
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean => {
  // Simple line-rectangle intersection check
  const rectRight = rect.x + rect.width;
  const rectBottom = rect.y + rect.height;
  
  // Check if line endpoints are inside rectangle
  const startInside = lineStart.x >= rect.x && lineStart.x <= rectRight && 
                     lineStart.y >= rect.y && lineStart.y <= rectBottom;
  const endInside = lineEnd.x >= rect.x && lineEnd.x <= rectRight && 
                   lineEnd.y >= rect.y && lineEnd.y <= rectBottom;
  
  if (startInside || endInside) return true;
  
  // Check if line crosses rectangle boundaries
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  
  if (dx === 0 && dy === 0) return false; // No line
  
  // Check intersection with each rectangle edge
  const edges = [
    { x1: rect.x, y1: rect.y, x2: rectRight, y2: rect.y }, // top
    { x1: rectRight, y1: rect.y, x2: rectRight, y2: rectBottom }, // right
    { x1: rectRight, y1: rectBottom, x2: rect.x, y2: rectBottom }, // bottom
    { x1: rect.x, y1: rectBottom, x2: rect.x, y2: rect.y } // left
  ];
  
  for (const edge of edges) {
    if (lineSegmentsIntersect(lineStart, lineEnd, { x: edge.x1, y: edge.y1 }, { x: edge.x2, y: edge.y2 })) {
      return true;
    }
  }
  
  return false;
};

// Helper function to check if two line segments intersect
const lineSegmentsIntersect = (
  p1: { x: number; y: number }, p2: { x: number; y: number },
  p3: { x: number; y: number }, p4: { x: number; y: number }
): boolean => {
  const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denominator === 0) return false; // Lines are parallel
  
  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
  
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
};

// Get next panel type in workflow sequence
export const getNextPanelType = (currentType: PanelType): PanelType | null => {
  const currentIndex = WORKFLOW_SEQUENCE.indexOf(currentType);
  if (currentIndex === -1 || currentIndex === WORKFLOW_SEQUENCE.length - 1) {
    return null; // End of sequence or invalid type
  }
  return WORKFLOW_SEQUENCE[currentIndex + 1];
};

// Get workflow connections for an iteration
export const getWorkflowConnections = (
  iteration: WorkflowIteration,
  allPanels: Record<string, PanelInstance>
): Connection[] => {
  const connections: Connection[] = [];
  const iterationPanels = iteration.panels;

  for (let i = 0; i < iterationPanels.length - 1; i++) {
    const fromPanel = iterationPanels[i];
    const toPanel = iterationPanels[i + 1];
    
    if (fromPanel && toPanel && allPanels[fromPanel.id] && allPanels[toPanel.id]) {
      connections.push({
        id: generateConnectionId(fromPanel.id, toPanel.id),
        fromPanelId: fromPanel.id,
        toPanelId: toPanel.id,
        fromPoint: { 
          x: allPanels[fromPanel.id].position.x + PANEL_DIMENSIONS.width, 
          y: allPanels[fromPanel.id].position.y + PANEL_DIMENSIONS.height / 2 
        },
        toPoint: { 
          x: allPanels[toPanel.id].position.x, 
          y: allPanels[toPanel.id].position.y + PANEL_DIMENSIONS.height / 2 
        },
        iterationFrom: iteration.iterationNumber,
        iterationTo: iteration.iterationNumber,
        type: 'workflow'
      });
    }
  }

  return connections;
};

// Get loop connection between iterations
export const getLoopConnection = (
  fromIteration: WorkflowIteration,
  toIteration: WorkflowIteration,
  allPanels: Record<string, PanelInstance>
): Connection | null => {
  const fromPanel = fromIteration.panels.find(p => p.type === 'schema-refinement');
  const toPanel = toIteration.panels.find(p => p.type === 'schema-editing');

  if (!fromPanel || !toPanel || !allPanels[fromPanel.id] || !allPanels[toPanel.id]) {
    return null;
  }

  return {
    id: generateConnectionId(fromPanel.id, toPanel.id),
    fromPanelId: fromPanel.id,
    toPanelId: toPanel.id,
    fromPoint: { 
      x: allPanels[fromPanel.id].position.x + PANEL_DIMENSIONS.width, 
      y: allPanels[fromPanel.id].position.y + PANEL_DIMENSIONS.height / 2 
    },
    toPoint: { 
      x: allPanels[toPanel.id].position.x, 
      y: allPanels[toPanel.id].position.y + PANEL_DIMENSIONS.height / 2 
    },
    iterationFrom: fromIteration.iterationNumber,
    iterationTo: toIteration.iterationNumber,
    type: 'iteration-loop'
  };
};
