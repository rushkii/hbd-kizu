export interface Asset {
  type: 'video-intro' | 'video-loop' | 'bgm' | 'dialogue';
  src: string;
  filename?: string;
}

export interface Progress {
  filename?: string;
  size?: number;
}
