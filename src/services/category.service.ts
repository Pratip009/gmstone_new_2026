import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createCategory(name: string, description?: string) {
  const slug = slugify(name);
  const existing = await Category.findOne({ slug }).lean();
  if (existing) throw new Error('Category with this name already exists');

  const category = new Category({ name, slug, description });
  await category.save();
  return category.toObject();
}

export async function listCategories() {
  return Category.find({ isActive: true }).sort({ name: 1 }).lean();
}

export async function createSubcategory(
  name: string,
  categoryId: string,
  description?: string
) {
  const category = await Category.findById(categoryId);
  if (!category) throw new Error('Category not found');

  const slug = slugify(name);
  const existing = await Subcategory.findOne({ slug, category: categoryId }).lean();
  if (existing) throw new Error('Subcategory already exists in this category');

  const sub = new Subcategory({ name, slug, category: categoryId, description });
  await sub.save();
  return sub.toObject();
}

export async function listSubcategories(categoryId?: string) {
  const filter: Record<string, unknown> = { isActive: true };
  if (categoryId) filter.category = categoryId;
  return Subcategory.find(filter).populate('category', 'name slug').sort({ name: 1 }).lean();
}
