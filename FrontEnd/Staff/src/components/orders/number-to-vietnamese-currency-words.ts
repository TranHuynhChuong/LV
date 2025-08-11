export function numberToVietnameseCurrencyWords(number: number): string {
  const units = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  const tens = (n: number): string => {
    const chuc = Math.floor(n / 10);
    const donvi = n % 10;
    let result = '';

    if (chuc > 1) {
      result += `${units[chuc]} mươi`;
      if (donvi === 1) result += ' mốt';
      else if (donvi !== 0) result += ` ${units[donvi]}`;
    } else if (chuc === 1) {
      result += 'mười';
      if (donvi !== 0) result += ` ${units[donvi]}`;
    } else {
      if (donvi !== 0) result += `lẻ ${units[donvi]}`;
    }

    return result;
  };

  const hundreds = (n: number): string => {
    const tram = Math.floor(n / 100);
    const du = n % 100;
    let result = '';

    if (tram > 0) {
      result += `${units[tram]} trăm`;
      if (du !== 0) result += ` ${tens(du)}`;
    } else {
      result += tens(du);
    }

    return result;
  };

  const sections = (n: number): string => {
    const nghin = Math.floor(n / 1000);
    const tram = n % 1000;
    let result = '';

    if (nghin > 0) {
      result += `${hundreds(nghin)} nghìn`;
      if (tram !== 0) result += ` ${hundreds(tram)}`;
    } else {
      result += hundreds(tram);
    }

    return result;
  };

  if (number === 0) return 'Không đồng';

  let result = '';
  const ty = Math.floor(number / 1_000_000_000);
  const trieu = Math.floor((number % 1_000_000_000) / 1_000_000);
  const nghin = Math.floor((number % 1_000_000) / 1000);
  const donvi = number % 1000;

  if (ty > 0) {
    result += `${sections(ty)} tỷ`;
  }
  if (trieu > 0) {
    result += ` ${sections(trieu)} triệu`;
  }
  if (nghin > 0) {
    result += ` ${sections(nghin)} nghìn`;
  }
  if (donvi > 0) {
    result += ` ${hundreds(donvi)}`;
  }

  const final = result.trim().replace(/\s+/g, ' ') + ' đồng';

  return final.charAt(0).toUpperCase() + final.slice(1);
}
