import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100; // requests per window

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.getKey(req);
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup(now);
    
    const record = this.store[key];
    
    if (!record || now > record.resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.setHeaders(res, 1, now + this.windowMs);
      return next();
    }
    
    if (record.count >= this.maxRequests) {
      this.setHeaders(res, record.count, record.resetTime);
      return res.status(429).json({
        statusCode: 429,
        message: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }
    
    record.count++;
    this.setHeaders(res, record.count, record.resetTime);
    next();
  }

  private getKey(req: Request): string {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private setHeaders(res: Response, count: number, resetTime: number) {
    res.set({
      'X-RateLimit-Limit': this.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, this.maxRequests - count).toString(),
      'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    });
  }

  private cleanup(now: number) {
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}