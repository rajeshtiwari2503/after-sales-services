export type TicketStatus = 
  | 'open' 
  | 'in_progress' 
  | 'pending_parts' 
  | 'pending_customer' 
  | 'resolved' 
  | 'closed' 
  | 'cancelled';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketCategory = 
  | 'hardware' 
  | 'software' 
  | 'installation' 
  | 'maintenance' 
  | 'warranty' 
  | 'consultation' 
  | 'other';

export interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  customerId: string;
  technicianId?: string;
  serviceCenterId?: string;
  tenantId: string;
  attachments: Attachment[];
  notes: Note[];
  timeline: TimelineEvent[];
  sla: SLAInfo;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  _id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Note {
  _id: string;
  content: string;
  authorId: string;
  authorName: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface TimelineEvent {
  _id: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface SLAInfo {
  responseDeadline: Date;
  resolutionDeadline: Date;
  responseTime?: number;
  resolutionTime?: number;
  isResponseBreached: boolean;
  isResolutionBreached: boolean;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  customerId: string;
  serviceCenterId?: string;
}
