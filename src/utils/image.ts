export const getImageUrl = (fileName: string | null | undefined): string => {
  if (!fileName) return '/basantlogo.jpg';
  if (fileName.startsWith('http') || fileName.startsWith('/')) return fileName;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://dress.runasp.net';
  return `${baseUrl}/files/products/${fileName}`;
};
