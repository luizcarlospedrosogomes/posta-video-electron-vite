// utils.ts
export const generateSlug = (filename: string) =>
  filename
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
