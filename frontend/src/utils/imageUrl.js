export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://8a49cf3c307c57.lhr.life${url}`;
};
