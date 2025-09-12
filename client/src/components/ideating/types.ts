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
  data?: any; // Panel-specific data
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
  ideas?: any[];
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
