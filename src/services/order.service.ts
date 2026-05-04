import Order, { IOrder, IShippingAddress } from '@/models/Order';
import Cart, { ICart } from '@/models/Cart';
import Product, { IProduct } from '@/models/Product';
import { clearCart, calculateCartTotals } from './cart.service';
import { capturePayPalOrder, createPayPalOrder } from './paypal.service';

export async function createOrderFromCart(
  userId: string,
  shippingAddress: IShippingAddress,
  paymentMethod: 'paypal' | 'cod'
) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product').lean() as ICart | null;
  if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

  const items = [];
  for (const item of cart.items) {
    const productDoc = item.product as unknown as IProduct;
    const product = await Product.findOne({ _id: productDoc._id, isActive: true }) as IProduct | null;
    if (!product) throw new Error(`Product is no longer available`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0],
    });
  }

  const { subtotal, tax, shippingCost, total } = calculateCartTotals(items);

  const order = new Order({
    user: userId,
    items,
    shippingAddress,
    subtotal,
    tax,
    shippingCost,
    totalAmount: total,
    paymentMethod,
    status: 'pending',
    paymentStatus: 'pending',
  });

  await order.save();
  return order;
}

export async function initiatePayPalPayment(orderId: string) {
  const order = await Order.findById(orderId) as IOrder | null;
  if (!order) throw new Error('Order not found');

  const paypalOrder = await createPayPalOrder(order.totalAmount);
  order.paypalOrderId = paypalOrder.id;
  await order.save();

  const approvalUrl = (paypalOrder.links as Array<{ rel: string; href: string }>)?.find(
    (l) => l.rel === 'approve'
  )?.href;

  return { paypalOrderId: paypalOrder.id, approvalUrl };
}

export async function capturePayment(paypalOrderId: string) {
  const captureData = await capturePayPalOrder(paypalOrderId);

  if (captureData.status !== 'COMPLETED') {
    throw new Error('Payment not completed');
  }

  const order = await Order.findOne({ paypalOrderId }) as IOrder | null;
  if (!order) throw new Error('Order not found');

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  order.status = 'paid';
  order.paymentStatus = 'completed';
  order.paypalPaymentId =
    captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  await order.save();

  await clearCart(order.user.toString());
  return order;
}

export async function getUserOrders(userId: string) {
  return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

export async function getOrderById(orderId: string, userId?: string) {
  const query: Record<string, unknown> = { _id: orderId };
  if (userId) query.user = userId;
  return Order.findOne(query).populate('items.product', 'name images').lean();
}

export async function getAllOrders(page = 1, limit = 20, status?: string) {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, total };
}
