import { Types } from 'mongoose';

export class MongoUtils {
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  static toObjectId(id: string): Types.ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new Error(`Invalid ObjectId: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  static createSearchQuery(searchTerm: string, fields: string[]) {
    if (!searchTerm) return {};
    
    return {
      $or: fields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }))
    };
  }

  static createDateRangeQuery(startDate?: string, endDate?: string) {
    const query: any = {};
    
    if (startDate) {
      query.$gte = new Date(startDate);
    }
    
    if (endDate) {
      query.$lte = new Date(endDate);
    }
    
    return Object.keys(query).length > 0 ? query : undefined;
  }
}