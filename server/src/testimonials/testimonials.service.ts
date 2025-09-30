import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Testimonial } from './schemas/testimonial.schema';

@Injectable()
export class TestimonialsService {
  constructor(@InjectModel(Testimonial.name) private model: Model<Testimonial>) {}

  async create(data: Partial<Testimonial>) {
    const doc = new this.model(data);
    return doc.save();
  }

  async findPublished() {
    return this.model.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).exec();
  }

  async findAll() {
    return this.model.find().sort({ order: 1, createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Testimonial not found');
    return doc;
  }

  async update(id: string, data: Partial<Testimonial>) {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundException('Testimonial not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Testimonial not found');
    return { success: true };
  }
}
