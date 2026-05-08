import { connectDB } from "@/lib/db";
import { listProducts } from "@/services/product.service";
import { errorResponse } from "@/lib/api-response";

export const GET = async (req: Request) => {
  try {
    await connectDB();
    const sp       = new URL(req.url).searchParams;
    const page     = Number(sp.get("page")  || 1);
    const limit    = Number(sp.get("limit") || 60);
    const category = sp.get("category") ?? undefined; // category slug

    const { products, total } = await listProducts({ page, limit, category });

    // Only return active products to the public
    const active = (products as Array<{ isActive: boolean }>).filter((p) => p.isActive);

    return Response.json({ success: true, data: active, total: active.length, page, limit });
  } catch (err) {
    return errorResponse("Failed to fetch products", 500);
  }
};