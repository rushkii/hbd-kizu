import { assetsStore } from './stores';

export const loadVideo = ({ videos, audio }: { videos: string[]; audio: string }) => {
  for (const vid of videos) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', vid, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = (e: ProgressEvent<EventTarget>) => {
      const target = e.target! as XMLHttpRequest;
      const blob = new Blob([target.response], { type: 'video/mp4' });
      assetsStore.update((e) => {
        e.video.push(URL.createObjectURL(blob));
        return e;
      });
    };

    xhr.onprogress = function (e) {
      if (e.lengthComputable) {
        const percentComplete = e.loaded / e.total;
        console.log(percentComplete);
        // do something with this
      }
    };

    xhr.send();
  }

  const xhr = new XMLHttpRequest();
  xhr.open('GET', audio, true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = (e: ProgressEvent<EventTarget>) => {
    const target = e.target! as XMLHttpRequest;
    const blob = new Blob([target.response], { type: 'audio/wav' });
    assetsStore.update((e) => {
      e.audio = URL.createObjectURL(blob);
      return e;
    });
  };

  xhr.onprogress = function (e) {
    if (e.lengthComputable) {
      const percentComplete = e.loaded / e.total;
      console.log(percentComplete);
      // do something with this
    }
  };

  xhr.send();
};
