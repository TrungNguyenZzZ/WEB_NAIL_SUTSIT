import { prisma } from "../config/prisma.js";

export const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ensureUniqueSlug = async (modelName, value, currentId = null) => {
  const baseSlug = slugify(value);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma[modelName].findUnique({
      where: { slug: candidate }
    });
    if (!existing || existing.id === currentId) {
      return candidate;
    }
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
};

