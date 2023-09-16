<script lang="ts">
	export let description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit.';
	export let endDate: Date = new Date();
	import { IconTriangleFilled } from '@tabler/icons-svelte';
	import { IconTriangleInvertedFilled } from '@tabler/icons-svelte';
</script>

<div
	class="flex flex-col justify-between border-2 p-3 text-gray-300 bg-black font-thin rounded-xl text-lg h-full border-neutral-700"
>
	<div class="grid grid-cols-2 w-fit gap-x-2">
		<p class="italic">Believe:</p>
		<div class="flex items-center justify-center gap-2 text-green-500 font-light">
			<IconTriangleFilled class="w-4 h-4" />
			<p>9.09</p>
		</div>
		<p class="italic">Cope:</p>
		<div class="flex items-center justify-center gap-2 text-red-500 font-light">
			<IconTriangleInvertedFilled class="w-4 h-4" />
			<p>8.05</p>
		</div>
	</div>
	<p class="text-white font-light overflow-y-auto">{description}</p>
	<p>end date: {endDate.toLocaleDateString()}</p>
</div>
