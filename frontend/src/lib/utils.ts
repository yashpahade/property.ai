export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatNumber = (n: number): string => {
  return n.toLocaleString('en-IN');
};

export const getInvestmentColor = (score: number): string => {
  if (score >= 75) return 'var(--accent-emerald)';
  if (score >= 50) return 'var(--accent-blue)';
  if (score >= 25) return 'var(--accent-amber)';
  return 'var(--accent-red)';
};

export const getInvestmentRating = (score: number): string => {
  if (score >= 75) return 'STRONG BUY';
  if (score >= 50) return 'BUY';
  if (score >= 25) return 'HOLD';
  return 'OVERPRICED';
};

export const truncate = (str: string, len: number): string => {
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
};
