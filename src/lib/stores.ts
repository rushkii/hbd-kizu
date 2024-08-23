import { writable } from 'svelte/store';

interface AssetStore {
  video: string[];
  audio: string;
}

export const assetsStore = writable<AssetStore>({
  video: [],
  audio: ''
});
