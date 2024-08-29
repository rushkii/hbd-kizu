import type { Asset } from '$types';
import type { SingleOrMultiple, RecursivePartial, IOptions } from '@tsparticles/engine';

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

export const PARTICLES_CONFIG = {
  particles: {
    number: {
      value: 29,
      density: {
        enable: true,
        value_area: 6573.989449548644
      }
    },
    color: {
      value: '#ffffff'
    },
    shape: {
      type: 'circle',
      stroke: {
        width: 0,
        color: '#000000'
      },
      polygon: {
        nb_sides: 3
      },
      image: {
        src: '',
        width: 0,
        height: 0
      }
    },
    opacity: {
      value: 1,
      random: true,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 1,
      random: true,
      anim: {
        enable: false,
        speed: 1,
        size_min: 4.87246327380807,
        sync: false
      }
    },
    line_linked: {
      enable: false,
      distance: 0,
      color: '#ffffff',
      opacity: 0,
      width: 0
    },
    move: {
      enable: true,
      speed: 6,
      direction: 'none',
      random: false,
      straight: false,
      out_mode: 'out',
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: true,
        mode: 'repulse'
      },
      onclick: {
        enable: true,
        mode: 'push'
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 1
        }
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3
      },
      repulse: {
        distance: 200,
        duration: 0.4
      },
      push: {
        particles_nb: 4
      },
      remove: {
        particles_nb: 2
      }
    }
  },
  retina_detect: true
} as unknown as SingleOrMultiple<RecursivePartial<IOptions>>;
