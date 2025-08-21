export function isValidEmail(email) {
  return typeof email === 'string' && /.+@.+\..+/.test(email);
}

export function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

export function toNumber(value, fallback = undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function paginate(items, page = 1, pageSize = 12) {
  const currentPage = Math.max(1, page);
  const size = Math.max(1, pageSize);
  const start = (currentPage - 1) * size;
  const end = start + size;
  const paged = items.slice(start, end);
  return { items: paged, total: items.length, page: currentPage, pageSize: size };
}
