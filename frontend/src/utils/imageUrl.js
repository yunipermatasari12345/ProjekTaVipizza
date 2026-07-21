export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://optimum-setting-incidence-barn.trycloudflare.com${url}`;
};
