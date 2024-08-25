export interface Asset {
  type: 'video-intro' | 'video-loop' | 'bgm' | 'dialogue';
  src: string;
  filename?: string;
}

export interface Progress {
  name?: string;
  downloaded?: number;
}
