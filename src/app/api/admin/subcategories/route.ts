import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { createSubcategory, listSubcategories } from '@/services/category.service';
import { withAdmin } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/api-response';

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const { name, categoryId, description } = await req.json();
    if (!name || !categoryId) return errorResponse('name and categoryId are required', 400);
    const sub = await createSubcategory(name, categoryId, description);
    return successResponse(sub, 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Failed', 400);
  }
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const categoryId = req.nextUrl.searchParams.get('category') || undefined;
    const subs = await listSubcategories(categoryId);
    return successResponse(subs);
  } catch {
    return errorResponse('Failed to fetch subcategories', 500);
  }
}
