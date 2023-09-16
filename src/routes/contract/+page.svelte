<script lang="ts">
	import BelieveCope from '$lib/BelieveCope.svelte';
	import Button from '$lib/Button.svelte';
	import CandleStickChart from '$lib/CandleStickChart.svelte';

	export let title = 'Lorem ipsum dolor sit amet consectetur adipisicing elit.';
</script>

<div class="flex flex-col gap-8 text-xl font-light w-full">
	<div class="flex justify-between">
		<div class="space-y-2">
			<h1 class="">{title}</h1>
			<BelieveCope />
		</div>
		<div class="w-10" />
		<div class="text-right">
			<h1 class="whitespace-nowrap">Your current profit:</h1>
			<p class="text-green-500">+93.80 tokens</p>
		</div>
	</div>
	<div class="w-full h-screen">
		<CandleStickChart />
	</div>
	<div class="space-y-1">
		<div class="flex justify-between">
			<p>Your current holdings:</p>
			<p class="text-right">Volume</p>
		</div>
		<div class="grid grid-cols-[auto,auto,auto,auto,1fr] grid-rows-3 gap-x-3 gap-y-1">
			<p>Believe:</p>
			<p class="text-green-500">10 Shares</p>
			<Button class="text-sm py-1 px-2 text-green-500">Buy</Button>
			<Button class="text-sm py-1 px-2 text-green-500">Sell</Button>
			<p class="text-right">8000</p>
			<p>Cope:</p>
			<p class="text-red-500">10 Shares</p>
			<Button class="text-sm py-1 px-2 text-red-500">Buy</Button>
			<Button class="text-sm py-1 px-2 text-red-500">Sell</Button>
			<p class="text-right">6123</p>
		</div>
	</div>
	<div>
		<h1>Background & Due Diligence</h1>
		<div class="my-2 p-2 bg-black rounded-xl text-neutral-300 font-thin">
			<p>
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam asperiores quae voluptatem
				illum facilis earum, a deserunt officia veritatis. Id aperiam reprehenderit quis maiores
				earum odit illum neque amet provident iste odio rem eveniet incidunt fugit ducimus, sequi
				dolor aut quibusdam vitae a at, fuga qui deleniti. Amet, illo impedit.
			</p>
		</div>
	</div>
</div>
