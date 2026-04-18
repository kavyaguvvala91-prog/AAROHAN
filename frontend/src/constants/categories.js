export const CATEGORY_OPTIONS = [
  { value: 'OC', label: 'OC (Open Category)' },
  { value: 'BC', label: 'BC' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'EWS', label: 'EWS' },
];

export const DEFAULT_CATEGORY = 'OC';

export const isValidCategory = (value = '') =>
  CATEGORY_OPTIONS.some((option) => option.value === value);
