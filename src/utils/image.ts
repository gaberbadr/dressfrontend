export const getImageUrl = (fileName: string | null | undefined): string => {
  if (!fileName) return '/basantlogo.jpg';
  if (fileName.startsWith('http') || fileName.startsWith('/')) return fileName;
  return `https://localhost:7237/files/products/${fileName}`;
};
