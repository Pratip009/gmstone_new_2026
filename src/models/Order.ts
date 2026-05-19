import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// ─── NEW: FedEx shipment data ─────────────────────────────────────────────────
export interface IFedExShipment {
  trackingNumber: string;
  labelBase64: string;   // base64-encoded PDF label
  labelFormat: string;
  shipmentId: string;
  serviceType: string;
  estimatedDelivery?: string;
  createdAt: Date;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: 'paypal' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paypalOrderId?: string;
  paypalPaymentId?: string;
  paypalPayerId?: string;
  notes?: string;
  // ─── NEW ───────────────────────────────────────────────────────────────────
  fedex?: IFedExShipment;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: String,
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
  },
  { _id: false }
);

// ─── NEW: FedEx sub-schema ────────────────────────────────────────────────────
const FedExShipmentSchema = new Schema<IFedExShipment>(
  {
    trackingNumber: { type: String, required: true },
    labelBase64: { type: String, required: true },
    labelFormat: { type: String, default: 'PDF' },
    shipmentId: { type: String, required: true },
    serviceType: { type: String, required: true },
    estimatedDelivery: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['paypal', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paypalOrderId: String,
    paypalPaymentId: String,
    paypalPayerId: String,
    notes: String,
    // ─── NEW ─────────────────────────────────────────────────────────────────
    fedex: { type: FedExShipmentSchema, default: undefined },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paypalOrderId: 1 });
OrderSchema.index({ createdAt: -1 });
// ─── NEW index for tracking lookups ──────────────────────────────────────────
OrderSchema.index({ 'fedex.trackingNumber': 1 });

const Order = (() => {
  if (mongoose.models && mongoose.models.Order) {
    return mongoose.models.Order as mongoose.Model<IOrder>;
  }
  return mongoose.model<IOrder>('Order', OrderSchema);
})();

export default Order;