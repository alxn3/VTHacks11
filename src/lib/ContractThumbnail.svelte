<script lang="ts">
	export let title = 'Lorem ipsum dolor sit amet consectetur adipisicing elit.';
	export let endDate: Date = new Date();
	import BelieveCope from './BelieveCope.svelte';
	export let href: string = '#';
</script>

<a
	class="text-left flex flex-col justify-between border-2 p-3 text-gray-300 bg-black font-thin rounded-xl text-lg h-full border-neutral-700 shadow-xl hover:shadow-2xl transition-shadow"
	{href}
	on:click
>
	<BelieveCope />
	<p class="text-white font-light overflow-y-auto">{title}</p>
	<p>end date: {endDate.toLocaleDateString()}</p>
</a>
