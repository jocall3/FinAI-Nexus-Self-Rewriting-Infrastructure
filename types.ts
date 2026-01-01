
export type GoalStatus = 'PENDING' | 'PASSING' | 'FAILING' | 'BLOCKED' | 'IN_PROGRESS' | 'REVIEW_NEEDED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Category = 'FEATURE' | 'PERFORMANCE' | 'SECURITY' | 'MAINTENANCE' | 'BUGFIX' | 'GOVERNANCE' | 'COST';

export interface Goal {
  id: string;
  text: string;
  status: GoalStatus;
  priority: Priority;
  dependencies: string[];
  category: Category;
  assignedAgent?: string;
  progressPercentage?: number;
  lastUpdated?: string;
  eta?: string;
}

export interface AIProcessTask {
  id: string;
  goalId: string;
  description: string;
  type: 'CODE_GEN' | 'CODE_REF_FACTOR' | 'TEST_GEN' | 'TEST_EXEC' | 'DEPLOY' | 'MONITOR' | 'SECURITY_SCAN' | 'SETTLEMENT' | 'POLICY_ENFORCE';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  startedAt?: string;
  completedAt?: string;
  logs: LogEntry[];
  output?: string;
  agentId?: string;
}

export interface CodeFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language: string;
  version: number;
  lastModified: string;
}

export interface CodeChange {
  id: string;
  taskId: string;
  fileId: string;
  filePath: string;
  diff: string;
  newContent: string;
  timestamp: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'APPLIED';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';
  message: string;
  source: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: Category;
  isAlert?: boolean;
  timestamp: string;
}

export interface TokenAsset {
  id: string;
  symbol: string;
  name: string;
  totalSupply: number;
}

export interface TokenAccount {
  id: string;
  ownerId: string;
  assetId: string;
  balance: number;
}

export interface DigitalIdentity {
  id: string;
  name: string;
  type: 'PERSON' | 'SERVICE' | 'AI_AGENT';
  status: 'ACTIVE' | 'REVOKED';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  details: any;
  originatorId: string;
  integrityHash: string;
}

export interface AgentEntity {
  id: string;
  name: string;
  role: string;
  status: 'IDLE' | 'ACTIVE' | 'ERROR';
  healthScore: number;
}
