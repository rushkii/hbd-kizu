<script lang="ts">
  import { browser } from '$app/environment';
  import CloudIcons from '$components/CloudIcons.svelte';
  import { data } from '$lib';
  import { onDestroy, onMount } from 'svelte';

  let video: HTMLVideoElement;
  let audio: HTMLAudioElement;
  let bgm: HTMLAudioElement;
  let isPlaying = false;
  let currentIndex = 0;
  let autoplay = false;
  let ended = false;
  let canPlay = false;
  let showContinueBtn = false;

  const play = () => {
    showContinueBtn = true;
    bgm.loop = true;
    bgm.play();
    video.play();
  };

  const checkLoad = () => {
    console.log('video loaded');
  };

  const easing = (duration: number) => {
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
    if (!autoplay || data[currentIndex].choices.length) return;
    if (currentIndex === data.length - 1) {
      isPlaying = false;
      fade({ audio: bgm, to: 1, duration: 2000 });
      destroyEvents();
      return;
    }

    currentIndex++;
    audio.src = data[currentIndex].audio;

    setTimeout(() => {
      audio.play();
    }, data[currentIndex].playAfter);
  };

  const autoDialogue = () => {
    autoplay = !autoplay;

    if (data[currentIndex].choices.length) return;

    if (autoplay) {
      if (!audio?.ended) return;

      currentIndex++;
      audio!.src = data[currentIndex].audio;
      ended = false;
      audio?.play();
      audio.onended = autoplayDialogueAudio;
    } else {
      audio.onended = setEnded;
    }
  };

  const dialoguePlay = () => {
    if (isPlaying || !canPlay) return;

    currentIndex = 0;
    audio = new Audio(data[currentIndex].audio);
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
    if (currentIndex === data.length - 1) {
      isPlaying = false;
      fade({ audio: bgm, to: 1, duration: 2000 });
      return;
    }

    currentIndex++;
    audio.src = data[currentIndex].audio;
    audio.play();
    ended = false;
  };

  const nextDialogue = () => {
    if (!audio.ended || data[currentIndex].choices.length) return;
    next();
  };

  const destroyEvents = () => {
    audio.removeEventListener('ended', autoplayDialogueAudio);
    audio.removeEventListener('ended', setEnded);
  };

  onMount(() => {
    bgm = new Audio('/audio/Koi is Love BGM.wav');
    video.onloadeddata = checkLoad;
    video.onended = () => {
      video.src = '/video/Tendou Arisu Maid Live2D - Loop.webm';
      video.loop = true;
      canPlay = true;
      video.play();
    };

    video.oncanplay = () => {
      showContinueBtn = true;
    };
  });

  onDestroy(() => {
    if (!browser || !audio) return;
    destroyEvents();
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div class="relative left-0 top-0 h-screen w-screen">
  <div
    on:click={play}
    class="absolute left-0 top-0 h-screen w-screen bg-sky-500
      transition duration-1000 {showContinueBtn ? 'z-0 opacity-0' : 'z-40 opacity-100'}"
  >
    <div class="relative flex min-h-screen justify-center p-[1vw]">
      <div class="flex w-screen items-end justify-center">
        <div
          class="fade-show btn-interaction w-[calc(100%-30vw)] px-[.5vw]
          text-center text-[2vw] font-semibold uppercase text-[#7887AE]"
        >
          Continue
        </div>
      </div>
    </div>
  </div>

  <div class="transition duration-1000 {showContinueBtn ? 'z-40 opacity-100' : 'z-0 opacity-0'}">
    <video
      bind:this={video}
      preload="auto"
      class="absolute left-0 top-0 h-screen w-screen object-cover
          brightness-[80%]"
    >
      <track kind="captions" />
      <source src="/video/Tendou Arisu Maid Live2D - Intro.webm" type="video/webm" />
    </video>

    <div class="absolute right-0 top-0 z-50 w-screen px-[1.5vw] pt-[1vw]">
      <div class="flex justify-end">
        <button
          on:click={autoDialogue}
          class="{autoplay ? 'bg-yellow-400' : 'bg-white'} {canPlay ? 'fade-show' : 'hidden'}
              skew-x-[-8deg] rounded-[.5vw] p-[.5vw] text-[1.1vw]
              font-extrabold uppercase text-[#2d354b]"
        >
          <div class="px-[1vw]">Auto</div>
        </button>
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

    <div class="absolute left-0 top-0 h-screen w-screen">
      <div class="flex min-h-screen items-center justify-center">
        {#if isPlaying && currentIndex !== data.length}
          <div class="chat flex w-full max-w-[30vw] justify-center">
            <div on:click={nextDialogue} class="chat-bubble shader flex flex-col">
              <div class="font-semibold">
                {data[currentIndex].text}
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
      class="absolute left-0 top-0 h-screen w-screen transition-all duration-200
      {isPlaying && data[currentIndex].choices.length && ended ? 'fade-show' : 'hidden'}"
    >
      <div class="flex min-h-screen items-end justify-center pb-[1.5vw]">
        <div class="flex flex-col gap-[.5vw]">
          {#each data[currentIndex].choices as choice}
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
</style>
