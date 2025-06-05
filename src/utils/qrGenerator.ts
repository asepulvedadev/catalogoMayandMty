export const generateProductQRUrl = (id: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/product/${id}`;
}; 