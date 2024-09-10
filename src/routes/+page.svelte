<script lang="ts">
  import { browser } from '$app/environment';
  import { goto, invalidateAll } from '$app/navigation';
  import CloudIcons from '$components/CloudIcons.svelte';
  import { ASSETS, DIALOGUES } from '$lib';
  import { loadParticles, preloadAssets } from '$lib/functions';
  import { assetsStore } from '$lib/stores';
  import { onDestroy, onMount } from 'svelte';
  import { fade as fadeTransition } from 'svelte/transition';

  let videoIntro: HTMLVideoElement;
  let videoLoop: HTMLVideoElement;
  let audio: HTMLAudioElement;
  let bgm: HTMLAudioElement;
  let loadingElement: HTMLDivElement;

  let isPlaying: boolean = false;
  let autoplay: boolean = false;
  let ended: boolean = false;
  let canPlay: boolean = false;
  let showContinueBtn: boolean = false;
  let removeLoadingScreen: boolean = false;
  let particlesLoaded: boolean = false;
  let showParticles: boolean = false;

  let currentIndex: number = 0;
  let progress: number = 0;
  let totalSize: number = 0;
  let dialogues: string[];

  $: allowPlay = false;
  $: dialogues = [];

  const DEFAULT_BGM_VOLUME = 0.2;

  const play = () => {
    // play button after the loading assets is finished.
    if (!showContinueBtn || !allowPlay) return;

    removeLoadingScreen = true;
    showContinueBtn = false;

    bgm.loop = true;
    bgm.play();

    videoIntro.play();

    // play & pause to prevent error:
    // `NotAllowedError: play() can only be initiated
    // by a user gesture.`
    videoLoop.play();
    videoLoop.pause();
    videoLoop.currentTime = 0;
  };

  const easing = (duration: number) => {
    // easing calculation.
    return 0.5 - Math.cos(duration * Math.PI) / 2;
  };

  const fade = ({
    audio,
    to,
    duration
  }: {
    audio: HTMLAudioElement;
    to: number;
    duration: number;
  }): Promise<void> => {
    // audio fade volume.
    // ref: https://stackoverflow.com/a/13149848

    const volume = audio.volume;
    const delta = to - volume;
    const interval = 13;

    const ticks = Math.floor(duration / interval);
    let tick = 1;

    return new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        audio.volume = volume + easing(tick / ticks) * delta;

        if (++tick === ticks + 1) {
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  };

  const autoplayDialogueAudio = () => {
    // event function to run autoplay.

    if (!autoplay || DIALOGUES[currentIndex].choices.length) return;
    if (currentIndex === DIALOGUES.length - 1) {
      isPlaying = false;
      fade({ audio: bgm, to: DEFAULT_BGM_VOLUME, duration: 2000 });
      destroyEvents();
      return;
    }

    currentIndex++;
    audio.src = dialogues[currentIndex];

    setTimeout(() => {
      audio.play();
    }, DIALOGUES[currentIndex].playAfter);
  };

  const autoDialogue = () => {
    // auto dialogue triggerer.
    autoplay = !autoplay;

    if (DIALOGUES[currentIndex].choices.length) return;

    if (autoplay) {
      if (!audio?.ended) return;

      currentIndex++;
      audio!.src = dialogues[currentIndex];
      ended = false;
      audio?.play();
      audio.onended = autoplayDialogueAudio;
    } else {
      audio.onended = setEnded;
    }
  };

  const dialoguePlay = () => {
    // button to play at start point.

    if (isPlaying || !canPlay) return;

    currentIndex = 0;
    audio = new Audio(dialogues[currentIndex]);
    isPlaying = true;
    ended = false;

    audio.addEventListener('ended', autoplayDialogueAudio);
    audio.addEventListener('ended', setEnded);
    audio.oncanplaythrough = () => {
      ended = false;
    };

    fade({ audio: bgm, to: 0.02, duration: 2000 });

    setTimeout(() => {
      audio.play();
    }, 1000);
  };

  const setEnded = () => {
    ended = true;
  };

  const next = () => {
    // logic to play next dialogue.

    if (currentIndex === DIALOGUES.length - 1) {
      isPlaying = false;
      fade({ audio: bgm, to: DEFAULT_BGM_VOLUME, duration: 2000 });
      return;
    }

    currentIndex++;
    audio.src = dialogues[currentIndex];
    audio.play();
    ended = false;
  };

  const nextDialogue = () => {
    // button to play next dialogue manually.

    if (!audio.ended || DIALOGUES[currentIndex].choices.length) return;
    next();
  };

  const calculatePercent = (current: number, total: number) => {
    // assets progress percent calculator.
    const percent = (current / total) * 100;
    if (isNaN(percent)) return 0;
    return percent;
  };

  const animateLoading = (iterationDuration: number = 200) => {
    // loading animation UI logic.
    // ref: https://stackoverflow.com/a/57548666

    if (!browser) return;

    window.requestAnimationFrame(function () {
      const percent = calculatePercent(progress, totalSize);

      loadingElement.style.width = `${percent}%`;
      loadingElement.style.transitionDuration = `${iterationDuration}ms`;

      const next = (percent === undefined ? 0 : percent) + 1;
      if (next <= 100) {
        setTimeout(animateLoading, iterationDuration, loadingElement, iterationDuration);
      }
    });
  };

  const formatBytes = (bytes: number, decimals: number = 2) => {
    // convert Bytes to specific sizes format.
    // ref: https://stackoverflow.com/a/18650828

    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const startLoadAssets = () => {
    if (!screen.orientation.type.includes('landscape')) return;
    preloadAssets({ assets: ASSETS });
  };

  const reload = () => {
    window.location.href = '/';
    startLoadAssets();
  };

  const destroyEvents = () => {
    audio.removeEventListener('ended', autoplayDialogueAudio);
    audio.removeEventListener('ended', setEnded);
    window.removeEventListener('orientationchange', reload);
  };

  onMount(() => {
    if (!browser) return;

    window.addEventListener('orientationchange', reload);
    startLoadAssets();

    videoIntro.onended = () => {
      videoIntro.oncanplay = null;
      videoIntro.classList.remove('z-[1]');

      videoLoop.classList.remove('z-[-1]');
      videoLoop.classList.add('z-[1]');
      videoLoop.play();

      setTimeout(() => {
        // use timeout for letting the looped video play first.
        videoIntro.remove();
      }, 1000);

      canPlay = true;
    };
  });

  onDestroy(() => {
    if (!browser || !audio) return;
    destroyEvents();
  });

  $: {
    // reactive ($:) state area to watch assets state progress.

    progress = $assetsStore.progress.reduce(
      (accumulator, current) => accumulator + (current.size ?? 0),
      0
    );

    totalSize = $assetsStore.totalSize;

    if (totalSize > 0 && !particlesLoaded) {
      loadParticles({ id: 'particles' });
      particlesLoaded = true;
      showParticles = true;
    }

    animateLoading();

    if ($assetsStore.assets.length === ASSETS.length) {
      // if preloaded assets completely loaded then run the logic.
      bgm = new Audio($assetsStore.assets.find((e) => e.type === 'bgm')?.src);
      bgm.volume = DEFAULT_BGM_VOLUME;

      videoIntro.src = $assetsStore.assets.find((e) => e.type === 'video-intro')?.src!;

      videoLoop.src = $assetsStore.assets.find((e) => e.type === 'video-loop')?.src!;
      videoLoop.loop = true;

      const arr = $assetsStore.assets.filter((e) => e.type === 'dialogue');

      arr.sort((a, b) => {
        const numA = parseInt(a.filename?.split('.')[0]!, 10);
        const numB = parseInt(b.filename?.split('.')[0]!, 10);
        return numA - numB;
      });
      arr.forEach((item, index) => {
        item.filename = `${index + 1}.wav`;
      });

      dialogues = arr.flatMap((e) => e.src);
      showParticles = false;

      setTimeout(() => {
        document.querySelector('#particles')?.remove();
      }, 1000);
    }

    calculatePercent(progress, totalSize);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div class="relative left-0 top-0 h-screen w-screen">
  <div
    class="absolute left-0 top-0 z-[999] flex h-screen w-screen flex-col items-center justify-center
          text-balance bg-neutral-800 text-center uppercase text-white landscape:hidden"
  >
    <div class="text-3xl font-bold md:text-4xl">Rotate your screen!</div>
    <div class="mt-1 text-xs font-medium sm:text-sm">
      Sorry, this site only works on landscape screen
    </div>
  </div>
  <div
    on:click={play}
    class="absolute left-0 top-0 h-screen w-screen
      bg-neutral-800 transition duration-1000
      {removeLoadingScreen ? 'z-0 opacity-0' : ' z-40 opacity-100'}"
  >
    <div
      id="particles"
      class="{showParticles ? 'opacity-100' : 'opacity-0'} transition-opacity duration-[2000ms]"
    />
    <div class="relative flex min-h-screen justify-center p-[1vw]">
      <div
        class="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center text-white
        {removeLoadingScreen ? 'z-0 opacity-0' : ' z-40 opacity-100'}"
      >
        {#if $assetsStore.assets.length !== ASSETS.length}
          <div
            transition:fadeTransition={{ duration: 200 }}
            on:outroend={() => (showContinueBtn = true)}
            class="space-y-[.5vw]"
          >
            <div class="flex w-screen justify-center">
              <div class="flex flex-col">
                <div class="relative w-[40vw] text-[1vw] font-semibold">
                  <div
                    class="mb-[.3vw] flex animate-pulse items-center justify-center text-[1.2vw]"
                  >
                    {$assetsStore.state}
                  </div>
                  <div class="h-[1.5vw] overflow-hidden rounded-md border border-neutral-600">
                    <div
                      bind:this={loadingElement}
                      class="transition-loading z-10 flex h-full w-0 items-center justify-end bg-white"
                    >
                      <span class="mr-1 text-[1vw] font-bold text-black">
                        {calculatePercent(progress, totalSize).toFixed(0)}%
                      </span>
                    </div>
                    <div class="-z-10 w-full" />
                  </div>
                  <div class="mt-[.3vw] flex items-end justify-between">
                    <div>{formatBytes(progress)} / {formatBytes($assetsStore.totalSize)}</div>
                    <div>({$assetsStore.assets.length + 1}/{ASSETS.length})</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div
        class="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center text-white
        {removeLoadingScreen ? 'z-0 opacity-0' : ' z-40 opacity-100'}"
      >
        {#if showContinueBtn}
          <div
            transition:fadeTransition={{ duration: 500, delay: 100 }}
            on:introend={() => (allowPlay = true)}
            class="animate-pulse text-center text-[2vw] font-semibold uppercase"
          >
            click anywhere to continue
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="transition duration-1000 {showContinueBtn ? 'z-0 opacity-0' : 'z-40 opacity-100'}">
    <video
      bind:this={videoIntro}
      preload="auto"
      class="absolute left-0 top-0 z-[1] h-screen
          w-screen object-cover brightness-[80%]"
    >
      <track kind="captions" />
      <source type="video/webm" />
    </video>

    <video
      bind:this={videoLoop}
      preload="auto"
      class="absolute left-0 top-0 z-[-1] h-screen
          w-screen object-cover brightness-[80%]"
    >
      <track kind="captions" />
      <source type="video/webm" />
    </video>

    <div class="absolute right-0 top-0 z-50 w-screen px-[1.5vw] pt-[1vw]">
      <div class="flex justify-end">
        <div
          class="relative skew-x-[-8deg] overflow-hidden rounded-[.5vw]
            p-[.15vw] before:absolute before:left-1/2 before:top-1/2
            before:-z-50 before:aspect-square before:w-full
            {autoplay ? 'border-animate' : ''}"
        >
          <button
            on:click={autoDialogue}
            class="overflow-hidden rounded-[.5vw] px-[.8vw] py-[.5vw]
              text-[1.1vw] font-extrabold uppercase text-[#2d354b]
              drop-shadow-lg {canPlay ? 'fade-show' : 'hidden'} duration-500
              {autoplay ? 'bg-yellow-400' : 'bg-white'} transition"
          >
            Auto
          </button>
        </div>
      </div>
    </div>

    <div
      on:click={dialoguePlay}
      class="fade-show absolute left-0 top-0 h-screen w-screen
            {!isPlaying ? 'z-20' : 'z-0'}"
    >
      <div class="relative flex min-h-screen justify-center p-[1vw]">
        <div class="flex w-screen items-end justify-center">
          <div
            class="btn-interaction w-[calc(100%-30vw)] px-[.5vw] text-center
                  text-[2vw] font-semibold uppercase text-[#7887AE]
                  transition-all duration-200
                  {canPlay ? 'fade-show' : 'hidden'}
                  {isPlaying ? 'opacity-0' : 'opacity-100'}"
          >
            Click on the screen to play.
          </div>
        </div>
      </div>
    </div>

    <div class="absolute left-0 top-0 z-[2] h-screen w-screen">
      <div class="flex min-h-screen items-center justify-center">
        {#if isPlaying && currentIndex !== DIALOGUES.length}
          <div class="chat flex w-full max-w-[30vw] justify-center">
            <div on:click={nextDialogue} class="chat-bubble shader flex flex-col">
              <div class="font-semibold">
                {DIALOGUES[currentIndex].text}
              </div>
              {#if ended}
                <div class="mt-[1vw] flex justify-end">
                  <div class="bottom-arrow mb-[.5vw] mr-[.5vw] animate-bounce" />
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div
      class="absolute left-0 top-0 z-[2] h-screen w-screen transition-all duration-200
      {isPlaying && DIALOGUES[currentIndex].choices.length && ended ? 'fade-show' : 'hidden'}"
    >
      <div class="flex min-h-screen items-end justify-center pb-[1.5vw]">
        <div class="flex flex-col gap-[.5vw]">
          {#each DIALOGUES[currentIndex].choices as choice}
            <button
              on:click={next}
              class="shader flex items-center gap-[.5vw] rounded-[2vw] border-[.1vw]
                  border-neutral-800/50 bg-white/70 px-[1vw] py-[.5vw]
                  text-[1.2vw] font-semibold text-neutral-800"
            >
              <div class="h-[2vw] w-[2vw] -scale-x-100 text-neutral-800">
                <CloudIcons />
              </div>
              <div>
                {choice.text}
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .transition-loading {
    transition: width linear;
  }

  .border-animate::before {
    background: conic-gradient(transparent, #fff 270deg, transparent);
    animation: rotate 4s linear infinite;
  }

  .fade-show {
    animation-name: animate-show;
    animation-duration: 1s;
    -o-animation-name: animate-show;
    -o-animation-duration: 1s;
    -moz-animation-name: animate-show;
    -moz-animation-duration: 1s;
    -webkit-animation-name: animate-show;
    -webkit-animation-duration: 1s;
    -ms-zoom-animation: animate-show 1s;
  }

  :global(.fade-gone) {
    animation-name: animate-gone;
    animation-duration: 200ms;
    animation-fill-mode: forwards;
    -o-animation-name: animate-gone;
    -o-animation-duration: 200ms;
    -o-animation-fill-mode: forwards;
    -moz-animation-name: animate-gone;
    -moz-animation-duration: 200ms;
    -webkit-animation-name: animate-gone;
    -webkit-animation-duration: 200ms;
    -webkit-animation-fill-mode: forwards;
    -ms-zoom-animation: animate-gone 200ms forwards;
  }

  :global(.btn-interaction) {
    background-image: linear-gradient(
      90deg,
      #ffffff00 0%,
      #ffffffe2 30%,
      #ffffffe2 70%,
      #ffffff00 100%
    );
  }

  .bottom-arrow {
    @apply h-0 w-0;
    border-left: 0.5vw solid transparent;
    border-right: 0.5vw solid transparent;
    border-top: 0.7vw solid rgb(56 189 248);
  }

  .shader {
    filter: drop-shadow(0 0.3vw 0.2vw rgb(0 0 0 / 0.07))
      drop-shadow(0 0.1vw 0.1vw rgb(0 0 0 / 0.06));
  }

  .chat {
    @apply fixed left-[calc(40%)] top-[50vh] grid gap-x-[.6vw] py-[.5vw];
  }

  .chat-bubble {
    @apply relative block min-h-[1vh] min-w-[1vw] max-w-[calc(30vw)] rounded-[1vw] bg-white/70 px-[1vw] py-[.5vw] text-[1.2vw] text-neutral-800;
  }

  .chat-bubble::before {
    @apply absolute top-0 h-[1vh] w-[1vw] bg-inherit content-[""];
  }

  .chat .chat-bubble::before,
  .chat .chat-bubble::before {
    @apply left-[50%] top-[-.8933vw] h-0 w-0 rotate-90 bg-transparent content-[""];
    border-top: 0.6vw solid transparent;
    border-bottom: 0.6vw solid transparent;
    border-right: 0.7vw solid rgb(255 255 255 / 0.7);
  }

  @keyframes animate-show {
    0% {
      @apply hidden opacity-0;
    }
    100% {
      @apply opacity-100;
    }
  }

  @keyframes animate-gone {
    0% {
      @apply opacity-100;
    }
    100% {
      @apply z-0 hidden opacity-0;
    }
  }

  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) scale(1.4) rotate(0);
    }
    100% {
      transform: translate(-50%, -50%) scale(1.4) rotate(1turn);
    }
  }
</style>
