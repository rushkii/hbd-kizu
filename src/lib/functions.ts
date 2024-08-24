import { page } from '$app/stores';
import type { Asset, Progress } from '$types';
import { get } from 'svelte/store';
import { assetsStore } from './stores';

type XHRRequest = ((this: XMLHttpRequest, e: ProgressEvent | Event) => unknown) | null;

export const preloadAssets = ({ assets }: { assets: Asset[] }) => {
  // preloading assets.

  for (const asset of assets) {
    // get assets info for file size.
    request({
      method: 'HEAD',
      url: asset.src,
      type: 'arraybuffer',
      onReady() {
        if (this.readyState !== this.DONE) return;
        assetsStore.update((e) => {
          e.totalSize += parseInt(this.getResponseHeader('Content-Length')!);
          return e;
        });
      }
    });

    // preload assets.
    request({
      method: 'GET',
      url: asset.src,
      type: 'arraybuffer',

      // save event.
      onLoad(e) {
        const target = e.target! as XMLHttpRequest;
        const blob = new Blob([target.response]);

        const obj: Asset = {
          ...asset,
          filename: asset.src.split('/').at(-1),
          src: URL.createObjectURL(blob)
        };

        // save the preloaded assets to the store/assets.
        assetsStore.update((e) => {
          e.assets.push(obj);
          return e;
        });
      },

      // progress event.
      onProgress(e) {
        const ev = e as ProgressEvent;
        if (ev.lengthComputable) {
          // get filename through the response url.
          const filename = decodeURIComponent((ev.currentTarget as XMLHttpRequest).responseURL)
            .replace(get(page).url.origin, '')
            .split('/')
            .at(-1);

          // save the progress value to the store/state.
          assetsStore.update((e) => {
            e.progress = upsertItem(e.progress, { name: filename, downloaded: ev.loaded });
            return e;
          });
        }
      }
    });
  }
};

const request = ({
  method,
  url,
  type,
  onLoad,
  onProgress,
  onReady
}: {
  method: 'GET' | 'POST' | 'HEAD';
  url: string;
  type: XMLHttpRequestResponseType;
  onLoad?: XHRRequest;
  onProgress?: XHRRequest;
  onReady?: XHRRequest;
}) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.responseType = type;
  if (onLoad) xhr.onload = onLoad;
  if (onProgress) xhr.onprogress = onProgress;
  if (onReady) xhr.onreadystatechange = onReady;
  xhr.send();
};

const upsertItem = (array: Progress[], newItem: Progress) => {
  // updating the progress object like a MongoDB upsert.

  const newArray: Progress[] = [...array];
  const index = newArray.findIndex((item) => item.name === newItem.name);

  if (index === -1) {
    newArray.push(newItem);
  } else {
    newArray[index] = { ...newArray[index], ...newItem };
  }

  return newArray;
};
