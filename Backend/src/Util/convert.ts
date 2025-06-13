export function parsePositiveInt(value: any): number | undefined {
  const num = parseInt(String(value).trim(), 10);

  return Number.isInteger(num) && num >= 0 ? num : undefined;
}
