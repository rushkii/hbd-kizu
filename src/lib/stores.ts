import type { Asset, Progress } from '$types';
import { writable } from 'svelte/store';

// store or global state management to save the assets.
export const assetsStore = writable<{
  assets: Asset[];
  progress: Progress[];
  totalSize: number;
  state?: string;
}>({
  assets: [],
  progress: [],
  totalSize: 0,
  state: 'FILE_INFO_CHECK'
});
