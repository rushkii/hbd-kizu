<script>
  import '../app.css';

  const META_TITLE = 'Happy Birthday, Kiizuha!';
  const META_DESC = 'A birthday wishes website made for Kiizuha Kanazawa';
  const META_IMG = '/favicon.png';
</script>

<svelte:head>
  <title>{META_TITLE}</title>
  <meta name="description" content={META_DESC} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={META_TITLE} />
  <meta property="og:description" content={META_DESC} />
  <meta property="og:image" content={META_IMG} />
  <meta property="og:image:alt" content={META_IMG} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={META_TITLE} />
  <meta name="twitter:description" content={META_DESC} />
  <meta name="twitter:image" content={META_IMG} />
  <meta name="twitter:image:alt" content={META_IMG} />
</svelte:head>

<main class="relative flex min-h-screen w-screen select-none font-sans">
  <slot />
</main>
