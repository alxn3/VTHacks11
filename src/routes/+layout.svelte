<script lang="ts">
	import '../app.css';
	import NavBar from '../lib/NavBar.svelte';
</script>
<NavBar />
<slot />
<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>

	<title>VTHacks - Trade on your friends!</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus, voluptatum."
	/>
	<meta
		name="keywords"
		content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus excepturi, blanditiis nihil voluptatum reprehenderit nulla reiciendis unde illo dicta sapiente."
	/>
</svelte:head>
