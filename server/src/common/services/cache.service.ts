import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttlSeconds: number = 300): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return false;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  keys(): string[] {
    const validKeys: string[] = [];
    const now = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (now <= value.expiry) {
        validKeys.push(key);
      } else {
        this.cache.delete(key);
      }
    }

    return validKeys;
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
      }
    }
  }
}