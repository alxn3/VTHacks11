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

{#if data.length === 0}
	<p class="p-2 text-center">No data</p>
{:else}
	<table class="table-auto border-2 border-neutral-700 rounded-xl overflow-hidden w-full">
		<thead>
			<tr>
				{#each Object.keys(data[0]).sort() as key}
					<th>{key}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data as row}
				<tr>
					{#each Object.keys(row).sort() as value}
						<td>{row[value]}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	th,
	td {
		@apply border-[1px] border-neutral-700 px-2 py-1 overflow-x-auto min-w-[4rem];
	}

	td {
		@apply text-right font-light;
	}
</style>
