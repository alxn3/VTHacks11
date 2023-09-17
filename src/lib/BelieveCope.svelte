<script lang="ts">
	import { IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-svelte';
	export let cope: number;
	export let believe: number;
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 w-fit gap-x-2 text-gray-300">
	<p class="italic">Believe:</p>
	<div class="flex items-center justify-center gap-2 text-green-500 font-light">
		<IconTriangleFilled class="w-4 h-4" />
		<p>{believe}</p>
	</div>
	<p class="italic">Cope:</p>
	<div class="flex items-center justify-center gap-2 text-red-500 font-light">
		<IconTriangleInvertedFilled class="w-4 h-4" />
		<p>{cope}</p>
	</div>
</div>
