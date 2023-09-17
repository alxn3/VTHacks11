<script lang="ts">
	import BelieveCope from './BelieveCope.svelte';

    export let title: string;
    export let endDate: Date | null;
    export let href: string = '#';
	export let believe: number;
	export let cope: number;
</script>

<a
	class="text-left flex flex-col justify-between border-2 p-3 text-gray-300 bg-black font-thin rounded-xl text-lg h-full border-neutral-700"
	{href}
	on:click
>
	<BelieveCope {believe} {cope} />
	<p class="text-white font-light overflow-y-auto">Name: {title}</p>
	<p>end date: {endDate ? endDate.toLocaleDateString() : 'N/A'}</p>
</a>
