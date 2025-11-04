const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const PLACEHOLDER_IMAGE = 'https://placehold.co/300x200/FFF/64748B?text=N/A';

export const getImageUrl = (relativePath) => {
  if (!relativePath) {
    return PLACEHOLDER_IMAGE;
  }

  return `${API_BASE_URL}/images/${relativePath}`;
};