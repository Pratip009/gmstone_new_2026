import { FilterQuery } from 'mongoose';
import { IProduct } from '@/models/Product';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';

// ─── Filter Query Params ──────────────────────────────────────────────────────
export interface ProductFilterParams {
  // Category
  category?: string;
  subcategory?: string;

  // Multi-select filters (comma-separated or array)
  shape?: string | string[];
  color?: string | string[];
  clarity?: string | string[];
  certification?: string | string[];

  // Range filters
  priceMin?: string | number;
  priceMax?: string | number;
  sizeMin?: string | number;
  sizeMax?: string | number;

  // Pagination
  page?: string | number;
  limit?: string | number;

  // Sorting
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'size_asc' | 'size_desc';

  // Search
  q?: string;

  // Stock
  inStock?: string | boolean;
}

export interface ParsedFilters {
  query: FilterQuery<IProduct>;
  sort: Record<string, 1 | -1>;
  page: number;
  limit: number;
  skip: number;
}

// ─── Helper: normalize to array ──────────────────────────────────────────────
function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return val.split(',').map((s) => s.trim()).filter(Boolean);
}

// ─── Helper: parse numeric safely ────────────────────────────────────────────
function toNumber(val: string | number | undefined): number | undefined {
  if (val === undefined || val === '') return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

// ─── Slug resolver ────────────────────────────────────────────────────────────
/**
 * Detects whether a string is already a valid ObjectId or a slug,
 * then resolves slugs to their ObjectId strings.
 *
 * Call this ONCE at the top of any service function that receives
 * params from URL query strings (e.g. ?category=diamonds&subcategory=loose-diamonds).
 *
 * Returns a new params object with category/subcategory replaced by ObjectId strings.
 * If a slug is not found in the DB, the filter is set to a value that matches nothing
 * so the query safely returns 0 results rather than throwing a cast error.
 */
export async function resolveSlugFilters(
  params: ProductFilterParams
): Promise<ProductFilterParams> {
  const resolved = { ...params };

  const isObjectId = (val: string) => /^[a-f\d]{24}$/i.test(val);

  // ── Resolve category slug ──────────────────────────────────────────────────
  if (resolved.category && !isObjectId(resolved.category)) {
    const cat = await Category.findOne({ slug: resolved.category, isActive: true })
      .select('_id')
      .lean();

    // If not found, use impossible ObjectId so query returns 0 results cleanly
    resolved.category = cat ? cat._id.toString() : '000000000000000000000000';
  }

  // ── Resolve subcategory slug ───────────────────────────────────────────────
  if (resolved.subcategory && !isObjectId(resolved.subcategory)) {
    const sub = await Subcategory.findOne({ slug: resolved.subcategory, isActive: true })
      .select('_id')
      .lean();

    resolved.subcategory = sub ? sub._id.toString() : '000000000000000000000000';
  }

  return resolved;
}

// ─── Core Filter Builder ──────────────────────────────────────────────────────
/**
 * Builds a MongoDB FilterQuery from URL query params.
 * Expects category/subcategory to already be ObjectId strings.
 * Call resolveSlugFilters() before this if params come from URL slugs.
 */
export function buildProductFilterQuery(params: ProductFilterParams): ParsedFilters {
  const filter: FilterQuery<IProduct> = {};

  filter.isActive = true;

  // ── Category ───────────────────────────────────────────────────────────────
  if (params.category) {
    filter.category = params.category;
  }

  if (params.subcategory) {
    filter.subcategory = params.subcategory;
  }

  // ── Multi-select filters using $in ─────────────────────────────────────────
  const shapes = toArray(params.shape);
  if (shapes.length > 0) filter.shape = { $in: shapes };

  const colors = toArray(params.color);
  if (colors.length > 0) filter.color = { $in: colors };

  const clarities = toArray(params.clarity);
  if (clarities.length > 0) filter.clarity = { $in: clarities };

  const certifications = toArray(params.certification);
  if (certifications.length > 0) filter.certification = { $in: certifications };

  // ── Range filters ──────────────────────────────────────────────────────────
  const priceMin = toNumber(params.priceMin);
  const priceMax = toNumber(params.priceMax);
  if (priceMin !== undefined || priceMax !== undefined) {
    filter.price = {};
    if (priceMin !== undefined) filter.price.$gte = priceMin;
    if (priceMax !== undefined) filter.price.$lte = priceMax;
  }

  const sizeMin = toNumber(params.sizeMin);
  const sizeMax = toNumber(params.sizeMax);
  if (sizeMin !== undefined || sizeMax !== undefined) {
    filter.size = {};
    if (sizeMin !== undefined) filter.size.$gte = sizeMin;
    if (sizeMax !== undefined) filter.size.$lte = sizeMax;
  }

  // ── Stock filter ───────────────────────────────────────────────────────────
  if (params.inStock === 'true' || params.inStock === true) {
    filter.stock = { $gt: 0 };
  }

  // ── Full-text search ───────────────────────────────────────────────────────
  if (params.q && params.q.trim()) {
    filter.$text = { $search: params.q.trim() };
  }

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    newest:     { createdAt: -1 },
    oldest:     { createdAt: 1 },
    size_asc:   { size: 1 },
    size_desc:  { size: -1 },
  };

  const sort = sortMap[params.sortBy || 'newest'] || { createdAt: -1 };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const page  = Math.max(1, toNumber(params.page) || 1);
  const limit = Math.min(100, Math.max(1, toNumber(params.limit) || 20));
  const skip  = (page - 1) * limit;

  return { query: filter, sort, page, limit, skip };
}

// ─── Facets pipeline ──────────────────────────────────────────────────────────
export function buildFacetsPipeline(baseFilter: FilterQuery<IProduct>) {
  return [
    { $match: baseFilter },
    {
      $facet: {
        shapes: [
          { $group: { _id: '$shape', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        colors: [
          { $group: { _id: '$color', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        clarities: [
          { $group: { _id: '$clarity', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        certifications: [
          { $group: { _id: '$certification', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        priceRange: [
          { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
        ],
        sizeRange: [
          { $group: { _id: null, min: { $min: '$size' }, max: { $max: '$size' } } },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];
}