<script lang="ts">
	export let data = [
		{
			type: 'buy',
			amount: 10,
			price: 100
		},
		{
			type: 'sell',
			amount: 10,
			price: 100
		}
	];
</script>

<div class="border-[1px] border-neutral-700 rounded-xl bg-neutral-950 text-neutral-200 w-full">
	{#if data.length === 0}
		<p class="p-2">No data</p>
	{:else}
		<table class="table-fixed border-2 border-neutral-700 rounded-2xl overflow-hidden w-full">
			<thead>
				<tr>
					{#each Object.keys(data[0]) as key}
						<th>{key}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data as row}
					<tr>
						{#each Object.values(row) as value}
							<td>{value}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	th,
	td {
		@apply border-[1px] border-neutral-700 px-2 py-1;
	}

	td {
		@apply text-right font-light;
	}
</style>
