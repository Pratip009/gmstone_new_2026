import mongoose, { Document, Schema } from 'mongoose';

export const SHAPES = [
  'round', 'oval', 'princess', 'cushion', 'emerald',
  'pear', 'marquise', 'radiant', 'asscher', 'heart', 'other',
] as const;

export const COLORS = [
  'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'fancy-yellow', 'fancy-pink', 'fancy-blue', 'fancy-green', 'fancy-red', 'other',
] as const;

export const CLARITIES = [
  'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3',
] as const;

export const CERTIFICATIONS = ['GIA', 'AGS', 'EGL', 'IGI', 'HRD', 'none'] as const;

export type Shape = (typeof SHAPES)[number];
export type Color = (typeof COLORS)[number];
export type Clarity = (typeof CLARITIES)[number];
export type Certification = (typeof CERTIFICATIONS)[number];

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  price: number;
  shape: Shape[];
  size: number;
  color: Color[];
  clarity: Clarity[];
  certification?: Certification[];
  images: string[];
  stock: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'Subcategory',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    shape: {
      type: [String],
      required: [true, 'Shape is required'],
      enum: { values: SHAPES, message: 'Invalid shape: {VALUE}' },
    },
    size: {
      type: Number,
      required: [true, 'Size (carat) is required'],
      min: [0.01, 'Size must be at least 0.01 carat'],
    },
    color: {
      type: [String],
      required: [true, 'Color is required'],
      enum: { values: COLORS, message: 'Invalid color: {VALUE}' },
    },
    clarity: {
      type: [String],
      required: [true, 'Clarity is required'],
      enum: { values: CLARITIES, message: 'Invalid clarity: {VALUE}' },
    },
    certification: {
      type: [String],
      enum: { values: CERTIFICATIONS, message: 'Invalid certification: {VALUE}' },
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.index({ shape: 1 });
ProductSchema.index({ color: 1 });
ProductSchema.index({ clarity: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ size: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ shape: 1, size: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

const Product = (() => {
  if (mongoose.models && mongoose.models.Product) {
    return mongoose.models.Product as mongoose.Model<IProduct>;
  }
  return mongoose.model<IProduct>('Product', ProductSchema);
})();

export default Product;
