import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import { withAdmin } from "@/middleware/auth.middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";
import { SHAPES, COLORS, CLARITIES, CERTIFICATIONS } from "@/models/Product";

const productSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.string().min(1),
  subcategory: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  price: z.number().positive(),
  shape: z.array(z.enum(SHAPES)).min(1),
  size: z.number().positive(),
  color: z.array(z.enum(COLORS)).min(1),
  clarity: z.array(z.enum(CLARITIES)).min(1),
  certification: z.array(z.enum(CERTIFICATIONS)).optional().default([]),
  images: z.array(z.string().min(1)).default([]),
  stock: z.number().int().min(0),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

export const POST = withAdmin(async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    console.log("ROUTE.TS VERSION: ARRAYS ONLY");
    console.log("BODY:", JSON.stringify(body, null, 2));

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      console.error("ZOD ERRORS:", JSON.stringify(parsed.error.flatten(), null, 2));
      return errorResponse("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const product = await createProduct(parsed.data as never);
    return successResponse(product, 201);
  } catch (err) {
    console.error("[POST /api/admin/products]", err);
    return errorResponse(
      err instanceof Error ? err.message : "Failed to create product",
      500,
    );
  }
});

export const GET = withAdmin(async (req) => {
  try {
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const page = Number(sp.get("page") || 1);
    const limit = Number(sp.get("limit") || 20);

    const { products, total } = await listProducts({ page, limit });
    return Response.json({ success: true, data: products, total, page, limit });
  } catch (err) {
    return errorResponse("Failed to fetch products", 500);
  }
});