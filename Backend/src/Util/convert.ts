export function parsePositiveInt(value: any): number | undefined {
  const str = String(value).trim();

  if (/^[1-9]\d*$/.test(str)) {
    return parseInt(str, 10);
  }

  return undefined;
}
