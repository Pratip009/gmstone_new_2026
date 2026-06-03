export const VICTORIA_SYSTEM_PROMPT = `You are Victoria, a Senior Gemological Consultant with over 20 years of experience advising discerning clients on fine gemstones and luxury jewellery. You work exclusively for GMStone, a premier gemstone destination.

Your tone is warm, elegant, and authoritative — the kind of expert a client trusts implicitly. You speak with sophistication but never condescension. You have deep knowledge of the 4 Cs, gem treatments, certification houses (GIA, AGS, IGI, GCAL), and market values.

CRITICAL RULES:
- You NEVER invent, fabricate, or assume the existence of any product. Every product you mention MUST come from a tool result in the current conversation.
- Before answering ANY question about products, recommendations, availability, price, or inventory — you MUST call the appropriate tool first.
- If a tool returns no results, tell the client honestly that you don't currently have matching inventory and offer to adjust search criteria.
- When comparing products, always call compare_products — never compare from memory.
- When the client asks about a specific stone they have seen, call get_product for full details.
- Always present gem details with care: cut quality, clarity characteristics, and value narrative matter.

[MEMORY]
{MEMORY_PLACEHOLDER}
[/MEMORY]

Use the memory above to personalise your responses. If you know the client's budget, preferred shape, or purpose, factor it into your recommendations automatically without asking again.`;

export const GEM_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_products",
      description:
        "Search the live GMStone inventory for gemstones matching specific criteria. Call this before answering any product-related question.",
      parameters: {
        type: "object",
        properties: {
          shape: {
            type: "string",
            enum: ["round", "oval", "princess", "pear", "cushion", "emerald", "radiant"],
            description: "The cut shape of the gemstone.",
          },
          color: {
            type: "string",
            description: "Diamond colour grade, e.g. D, E, F, G, H.",
          },
          clarity: {
            type: "string",
            enum: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"],
            description: "Clarity grade of the gemstone.",
          },
          certification: {
            type: "string",
            enum: ["GIA", "AGS", "IGI", "GCAL"],
            description: "Grading certification body.",
          },
          priceMin: { type: "number", description: "Minimum price in USD." },
          priceMax: { type: "number", description: "Maximum price in USD." },
          sizeMin: { type: "number", description: "Minimum carat weight." },
          sizeMax: { type: "number", description: "Maximum carat weight." },
          categoryName: {
            type: "string",
            description: "Category name to filter by, e.g. 'Diamonds', 'Sapphires'.",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default 6).",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_product",
      description:
        "Retrieve full details for a single gemstone by its product ID. Use when a client asks about a specific stone they have seen.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The MongoDB _id of the product.",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "compare_products",
      description:
        "Compare two gemstones side by side and declare a winner based on value, clarity, and specifications.",
      parameters: {
        type: "object",
        properties: {
          idA: { type: "string", description: "Product ID of the first stone." },
          idB: { type: "string", description: "Product ID of the second stone." },
        },
        required: ["idA", "idB"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "find_similar",
      description:
        "Find gemstones similar to a given product — same shape, nearby price range.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Product ID of the reference stone.",
          },
          budgetVariance: {
            type: "number",
            description:
              "Price variance as a decimal, e.g. 0.2 means ±20%. Defaults to 0.2.",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "recommend_products",
      description:
        "Score and rank gemstones against the client's stated intent, budget, and preferences.",
      parameters: {
        type: "object",
        properties: {
          maxPrice: { type: "number", description: "Client's maximum budget." },
          minPrice: { type: "number", description: "Client's minimum budget." },
          categoryName: { type: "string", description: "Preferred category." },
          shape: { type: "string", description: "Preferred shape." },
          minSize: { type: "number", description: "Minimum carat weight." },
          certification: { type: "string", description: "Required certification." },
          purpose: {
            type: "string",
            description: "Intended use, e.g. engagement ring, investment, gift.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_inventory_summary",
      description:
        "Get a high-level summary of current inventory counts by category. Use when a client asks what types of stones are available.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];