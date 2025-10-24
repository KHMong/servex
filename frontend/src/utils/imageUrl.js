const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x200';

export const getImageUrl = (relativePath) => {
  if (!relativePath) {
    return PLACEHOLDER_IMAGE;
  }

  return `${API_BASE_URL}/images/${relativePath}`;
};