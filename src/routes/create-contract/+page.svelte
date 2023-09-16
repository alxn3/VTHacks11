<script>
	import Button from '$lib/Button.svelte';
</script>

<div class="space-y-4">
	<h1>Create a Contract</h1>
	<form class="flex flex-col gap-2" method="POST">
		<label for="title">Title</label>
		<input type="text" name="title" id="title" placeholder="Title" />
		<label for="description">Background and Due Diligence</label>
		<textarea name="description" id="description" placeholder="Desciption" cols="30" rows="10"  />
		<label for="starting-price">Starting Price (min 10)</label>
		<input type="number" name="starting-price" id="starting-price" min="10" placeholder="10" />
		<label for="volume">Volume (min 100)</label>
		<input type="number" name="volume" id="volume" min="100" placeholder="100" />
		<Button class="w-fit p-2 text-2xl" type="submit">Create Contract</Button>
	</form>
</div>

<style>
	input,
	textarea {
		@apply bg-black rounded-md p-2 mb-4;
	}
	h1 {
		@apply text-white font-light text-3xl;
	}
	label {
		@apply text-white font-light text-xl;
	}
</style>
