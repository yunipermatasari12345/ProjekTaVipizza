export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://power-payee-annex.ngrok-free.dev${url}`;
};
