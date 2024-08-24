import type { Asset } from '$types';

// dialogue assets data.
export const DIALOGUES = [
  {
    text: 'Kiizuha-sensei! bukankah hari ini adalah hari ulang tahunmu?',
    audio: '/audio/1.wav',
    playAfter: 0,
    choices: [
      {
        text: 'Ya...',
        selected: false
      }
    ]
  },
  {
    text: 'Kenapa kamu terlihat murung, Kiizuha-sensei?',
    audio: '/audio/2.wav',
    playAfter: 300,
    choices: [
      {
        text: 'Tidak apa-apa, Alice.',
        selected: false
      }
    ]
  },
  {
    text: 'Dimana teman-teman kamu? apakah mereka semua sibuk di hari ulang tahun kamu?',
    audio: '/audio/3.wav',
    playAfter: 500,
    choices: [
      {
        text: 'Ku pikir begitu...',
        selected: false
      },
      {
        text: 'Tidak juga.'
      }
    ]
  },
  {
    text: 'Tidak apa-apa, aku akan menemani kamu hari ini, Kiizuha-sensei!',
    audio: '/audio/4.wav',
    playAfter: 300,
    choices: []
  },
  {
    text: 'Ah! aku hampir lupa!',
    audio: '/audio/5.wav',
    playAfter: 600,
    choices: []
  },
  {
    text: 'Kiizuha-sensei! selamat ulang tahun yang ke-23!',
    audio: '/audio/6.wav',
    playAfter: 500,
    choices: []
  },
  {
    text: 'Semoga sensei makin sehat, sukses dalam berkarir, dan cepat tercapai apa yang sensei capai, seperti mempunyai PC gaming!',
    audio: '/audio/7.wav',
    playAfter: 500,
    choices: []
  },
  {
    text: 'Dan tentu! semoga kamu makin ganteng ya ☺️',
    audio: '/audio/8.wav',
    playAfter: 500,
    choices: []
  },
  {
    text: 'Itu saja, sensei! Maaf, aku tidak tahu apa yang harus diucapkan lagi...',
    audio: '/audio/9.wav',
    playAfter: 500,
    choices: [
      {
        text: 'Wahh! terima kasih sudah mengucapkan selamat ulang tahun untukku!',
        selected: false
      }
    ]
  },
  {
    text: 'Baik! ayo kita bermain bersama sepanjang hari!',
    audio: '/audio/10.wav',
    playAfter: 500,
    choices: []
  }
];

// define all assets.
export const ASSETS: Asset[] = [
  {
    type: 'video-intro',
    src: '/video/Tendou Arisu Maid Live2D - Intro.webm'
  },
  {
    type: 'video-loop',
    src: '/video/Tendou Arisu Maid Live2D - Loop.webm'
  },
  {
    type: 'bgm',
    src: '/audio/Koi is Love BGM - Compressed.flac'
  },
  // merge dialogue audio assets.
  ...DIALOGUES.flatMap((e): Asset => ({ type: 'dialogue', src: e.audio }))
];
