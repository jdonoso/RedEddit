import { FilterSettings } from '@/types/reddit';

export type AppMode = 'serious' | 'light';

const KEY = 'rededit_mode';

export const LIGHT_MODE_SUBREDDITS = [
  'funny',
  'mildlyinteresting',
  'aww',
  'tifu',
  'talesfromtechsupport',
  'nottheonion',
  'Wellthatsucks',
  'Unexpected',
  'interestingasfuck',
  'whatcouldgowrong',
  'BrandNewSentence',
  'dadjokes',
];

export const LIGHT_MODE_FILTERS: FilterSettings = {
  filterPolitics: true,
  filterLowEffort: true,
  filterRepetitive: false, // humor mode relaxes meme filter
};

export function getMode(): AppMode {
  if (typeof window === 'undefined') return 'serious';
  return (localStorage.getItem(KEY) as AppMode) ?? 'serious';
}

export function setMode(mode: AppMode): void {
  localStorage.setItem(KEY, mode);
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('rededit-mode-change', { detail: mode }));
}
