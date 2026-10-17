export const STORAGE_KEYS = {
  PRODUCTS: 'vyapari_products',
  SALES: 'vyapari_sales',
  CUSTOMERS: 'vyapari_customers',
  EXPENSES: 'vyapari_expenses',
} as const;

export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to persist ${key} to localStorage:`, err);
  }
}