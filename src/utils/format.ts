export const formatAmount = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toFixed(2);

  if (amount < 0) {
    return `(${formatted})`;
  }

  return formatted;
};
