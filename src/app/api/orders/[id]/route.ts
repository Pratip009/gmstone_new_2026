import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { getOrderById } from '@/services/order.service';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/api-response';

export const GET = withAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    await connectDB();
    // Non-admin users can only see their own orders
    const userId = req.user.role === 'admin' ? undefined : req.user.userId;
    const order = await getOrderById(params.id, userId);
    if (!order) return errorResponse('Order not found', 404);
    return successResponse(order);
  } catch {
    return errorResponse('Failed to fetch order', 500);
  }
});
