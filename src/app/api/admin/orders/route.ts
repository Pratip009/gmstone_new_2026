import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAllOrders } from '@/services/order.service';
import { withAdmin } from '@/middleware/auth.middleware';
import { errorResponse } from '@/lib/api-response';

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const page = Number(sp.get('page') || 1);
    const limit = Number(sp.get('limit') || 20);
    const status = sp.get('status') || undefined;

    const { orders, total } = await getAllOrders(page, limit, status);
    const totalPages = Math.ceil(total / limit);

    return Response.json({
      success: true,
      data: orders,
      pagination: { total, page, limit, totalPages },
    });
  } catch {
    return errorResponse('Failed to fetch orders', 500);
  }
});
