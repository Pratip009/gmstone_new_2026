import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { withAdmin } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/api-response';

export const PUT = withAdmin(async (req: NextRequest, { params }) => {
  try {
    await connectDB();
    const { status } = await req.json();

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { $set: { status } },
      { new: true }
    ).lean();

    if (!order) return errorResponse('Order not found', 404);
    return successResponse(order);
  } catch {
    return errorResponse('Failed to update order', 500);
  }
});
