import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { getProductById } from '@/services/product.service';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const product = await getProductById(params.id);
    if (!product) return errorResponse('Product not found', 404);
    return successResponse(product);
  } catch (err) {
    console.error('[GET /api/products/[id]]', err);
    return errorResponse('Failed to fetch product', 500);
  }
}
