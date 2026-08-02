import { UPLOAD_BASE_URL } from '../config/api';

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${UPLOAD_BASE_URL}${url}`;
};
