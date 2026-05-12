/**
 * Get initials from a name
 * @param {string} name - The full name
 * @returns {string} - The initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};
