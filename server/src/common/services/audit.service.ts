import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

@Injectable()
export class AuditService {
  private logs: AuditLog[] = []; // In-memory storage for demo

  async log(auditData: Omit<AuditLog, 'timestamp'>): Promise<void> {
    const log: AuditLog = {
      ...auditData,
      timestamp: new Date(),
    };

    this.logs.push(log);
    
    // In a real implementation, you would save to database
    console.log('Audit Log:', log);
  }

  async getUserLogs(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.logs
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getResourceLogs(resource: string, resourceId: string, limit = 50): Promise<AuditLog[]> {
    return this.logs
      .filter(log => log.resource === resource && log.resourceId === resourceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getAllLogs(limit = 100): Promise<AuditLog[]> {
    return this.logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async logUserAction(userId: string, action: string, details?: any): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'user',
      details,
    });
  }

  async logBookingAction(userId: string, action: string, bookingId: string, details?: any): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'booking',
      resourceId: bookingId,
      details,
    });
  }

  async logPaymentAction(userId: string, action: string, paymentId: string, details?: any): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'payment',
      resourceId: paymentId,
      details,
    });
  }
}