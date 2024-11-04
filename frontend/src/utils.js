// src/utils.js

export const transformImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://www.examtopics.com${url}`;
};