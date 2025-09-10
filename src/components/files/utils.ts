export const generateSlug = (input: string): string => {
  // normaliza barras e pega o último segmento (basename)
  const fileName = input.replace(/\\/g, "/").split("/").pop() || input;

  // remove a extensão (a parte após o último ponto)
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

  // remove acentos, lower case, troca qualquer sequência de não-alfa-num por '-',
  // colapsa múltiplos '-' e trim nas bordas
  const slug = nameWithoutExt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // qualquer coisa não alfanum -> '-'
    .replace(/-+/g, "-") // colapsa hífens repetidos
    .replace(/^-+|-+$/g, ""); // remove hífens nas extremidades

  return slug;
};