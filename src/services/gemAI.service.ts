import dbConnect from "@/lib/db";
import Product from "@/models/Product";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export interface ProductCard {
  _id: string;
  name: string;
  category: string;
  shape: string;
  size: number;
  color: string;
  clarity: string;
  certification: string;
  price: number;
  images: string[];
  stock: number;
  description: string;
  score?: number;
}

interface SearchArgs {
  shape?: string;
  color?: string;
  clarity?: string;
  certification?: string;
  priceMin?: number;
  priceMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  categoryName?: string;
  limit?: number;
}

interface RecommendArgs {
  maxPrice?: number;
  minPrice?: number;
  categoryName?: string;
  shape?: string;
  minSize?: number;
  certification?: string;
  purpose?: string;
}

/* ─────────────────────────────────────────────
   Clarity rank helper (FL best → SI2 worst)
───────────────────────────────────────────── */
const CLARITY_RANK: Record<string, number> = {
  FL: 8, IF: 7, VVS1: 6, VVS2: 5, VS1: 4, VS2: 3, SI1: 2, SI2: 1,
};

/* ─────────────────────────────────────────────
   Score helper (0-100)
   – price efficiency vs budget
   – clarity rank
   – stock availability
───────────────────────────────────────────── */
export function computeScore(
  product: { price: number; clarity: string; stock: number },
  opts: { budgetMax?: number } = {}
): number {
  let score = 50;

  // Clarity component (up to 30 pts)
  const clarityScore = (CLARITY_RANK[product.clarity] ?? 0) * (30 / 8);
  score += clarityScore;

  // Price-efficiency vs budget (up to 20 pts)
  if (opts.budgetMax && opts.budgetMax > 0) {
    const ratio = product.price / opts.budgetMax;
    // closer to budget = better value utilisation, but not over budget
    if (ratio <= 1) score += Math.round(20 * ratio);
  }

  // Stock bonus (up to 10 pts)
  score += Math.min(product.stock, 10);

  return Math.min(Math.round(score), 100);
}

/* ─────────────────────────────────────────────
   lean helper – serialises ObjectId / Date
───────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialise(doc: any): any {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

/* ─────────────────────────────────────────────
   1. searchProducts
───────────────────────────────────────────── */
export async function searchProducts(args: SearchArgs): Promise<ProductCard[]> {
  await dbConnect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { isActive: true };

  if (args.shape) filter.shape = args.shape;
  if (args.color) filter.color = args.color;
  if (args.clarity) filter.clarity = args.clarity;
  if (args.certification) filter.certification = args.certification;

  if (args.priceMin !== undefined || args.priceMax !== undefined) {
    filter.price = {};
    if (args.priceMin !== undefined) filter.price.$gte = args.priceMin;
    if (args.priceMax !== undefined) filter.price.$lte = args.priceMax;
  }

  if (args.sizeMin !== undefined || args.sizeMax !== undefined) {
    filter.size = {};
    if (args.sizeMin !== undefined) filter.size.$gte = args.sizeMin;
    if (args.sizeMax !== undefined) filter.size.$lte = args.sizeMax;
  }

  const limit = args.limit ?? 6;

  let query = Product.find(filter)
    .populate("category", "name slug")
    .limit(limit)
    .lean();

  if (args.categoryName) {
    // After populate we'll filter in memory; alternatively, pre-lookup category _id
    // For simplicity use regex on populated result post-query
    const results = await query;
    const filtered = results.filter((p) => {
      const cat = p.category as { name?: string } | null;
      return cat?.name?.match(new RegExp(args.categoryName!, "i"));
    });
    return filtered.slice(0, limit).map((p) => {
      const s = serialise(p);
      return {
        ...s,
        category: (s.category as { name?: string })?.name ?? "",
        score: computeScore(s),
      };
    });
  }

  const results = await query;
  return results.map((p) => {
    const s = serialise(p);
    return {
      ...s,
      category: (s.category as { name?: string })?.name ?? "",
      score: computeScore(s),
    };
  });
}

/* ─────────────────────────────────────────────
   2. getProduct
───────────────────────────────────────────── */
export async function getProduct(id: string): Promise<ProductCard | null> {
  await dbConnect();
  const p = await Product.findById(id)
    .populate("category", "name slug")
    .lean();
  if (!p) return null;
  const s = serialise(p);
  return {
    ...s,
    category: (s.category as { name?: string })?.name ?? "",
    score: computeScore(s),
  };
}

/* ─────────────────────────────────────────────
   3. compareProducts
───────────────────────────────────────────── */
export interface ComparisonResult {
  productA: ProductCard;
  productB: ProductCard;
  winner: "A" | "B" | "tie";
  reasoning: string;
  table: Array<{ attribute: string; valueA: string | number; valueB: string | number; winner: "A" | "B" | "tie" }>;
}

export async function compareProducts(
  idA: string,
  idB: string
): Promise<ComparisonResult | null> {
  await dbConnect();
  const [pA, pB] = await Promise.all([getProduct(idA), getProduct(idB)]);
  if (!pA || !pB) return null;

  const scoreA = computeScore(pA);
  const scoreB = computeScore(pB);

  const winner: "A" | "B" | "tie" =
    scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "tie";

  const table = [
    {
      attribute: "Price (USD)",
      valueA: pA.price,
      valueB: pB.price,
      winner: (pA.price <= pB.price ? "A" : "B") as "A" | "B" | "tie",
    },
    {
      attribute: "Carat",
      valueA: pA.size,
      valueB: pB.size,
      winner: (pA.size >= pB.size ? "A" : "B") as "A" | "B" | "tie",
    },
    {
      attribute: "Clarity",
      valueA: pA.clarity,
      valueB: pB.clarity,
      winner: ((CLARITY_RANK[pA.clarity] ?? 0) >= (CLARITY_RANK[pB.clarity] ?? 0) ? "A" : "B") as "A" | "B" | "tie",
    },
    {
      attribute: "Color",
      valueA: pA.color,
      valueB: pB.color,
      winner: (pA.color <= pB.color ? "A" : "B") as "A" | "B" | "tie", // D < E < F … alphabetically better = lower
    },
    {
      attribute: "Shape",
      valueA: pA.shape,
      valueB: pB.shape,
      winner: "tie" as "A" | "B" | "tie",
    },
    {
      attribute: "Certification",
      valueA: pA.certification,
      valueB: pB.certification,
      winner: "tie" as "A" | "B" | "tie",
    },
    {
      attribute: "Match Score",
      valueA: scoreA,
      valueB: scoreB,
      winner: winner,
    },
  ];

  const reasoning =
    winner === "tie"
      ? `Both stones are exceptionally matched with a score of ${scoreA}/100. Your choice may come down to personal shape preference.`
      : winner === "A"
      ? `${pA.name} scores higher (${scoreA} vs ${scoreB}) — offering superior clarity and value relative to budget.`
      : `${pB.name} scores higher (${scoreB} vs ${scoreA}) — offering superior clarity and value relative to budget.`;

  return { productA: pA, productB: pB, winner, reasoning, table };
}

/* ─────────────────────────────────────────────
   4. findSimilar
───────────────────────────────────────────── */
export async function findSimilar(
  id: string,
  budgetVariance = 0.2
): Promise<ProductCard[]> {
  await dbConnect();
  const ref = await getProduct(id);
  if (!ref) return [];

  const priceMin = ref.price * (1 - budgetVariance);
  const priceMax = ref.price * (1 + budgetVariance);

  const results = await searchProducts({
    shape: ref.shape,
    priceMin,
    priceMax,
    limit: 7,
  });

  // Exclude the reference product itself
  return results.filter((p) => p._id.toString() !== id.toString()).slice(0, 6);
}

/* ─────────────────────────────────────────────
   5. recommendProducts
───────────────────────────────────────────── */
export async function recommendProducts(
  args: RecommendArgs
): Promise<ProductCard[]> {
  await dbConnect();

  const searchArgs: SearchArgs = {
    priceMin: args.minPrice,
    priceMax: args.maxPrice,
    shape: args.shape,
    sizeMin: args.minSize,
    certification: args.certification,
    categoryName: args.categoryName,
    limit: 20,
  };

  const products = await searchProducts(searchArgs);

  // Re-score with budget context
  const scored = products.map((p) => ({
    ...p,
    score: computeScore(p, { budgetMax: args.maxPrice }),
  }));

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scored.slice(0, 6);
}

/* ─────────────────────────────────────────────
   6. getInventorySummary
───────────────────────────────────────────── */
export interface InventorySummary {
  category: string;
  count: number;
  minPrice: number;
  maxPrice: number;
}

export async function getInventorySummary(): Promise<InventorySummary[]> {
  await dbConnect();

  const results = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryData",
      },
    },
    { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$categoryData.name",
        count: { $sum: 1 },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return results.map((r) => ({
    category: r._id ?? "Uncategorised",
    count: r.count,
    minPrice: r.minPrice,
    maxPrice: r.maxPrice,
  }));
}

/* ─────────────────────────────────────────────
   Tool dispatcher
───────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dispatchTool(name: string, args: any): Promise<unknown> {
  switch (name) {
    case "search_products":
      return await searchProducts(args as SearchArgs);
    case "get_product":
      return await getProduct(args.id as string);
    case "compare_products":
      return await compareProducts(args.idA as string, args.idB as string);
    case "find_similar":
      return await findSimilar(args.id as string, args.budgetVariance as number | undefined);
    case "recommend_products":
      return await recommendProducts(args as RecommendArgs);
    case "get_inventory_summary":
      return await getInventorySummary();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}