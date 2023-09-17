<script lang="ts">
	import Table from '$lib/Table.svelte';
	import { accountData } from '$lib/accountUtils';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div>
	{JSON.stringify(data)}

	<h1>Active Contracts</h1>
	<Table
		data={data.active_contracts.map((h) => {
			if (h.date) h.date = new Date(h.date.seconds).toUTCString();
			return h;
		})}
	/>

	<h1>Created Contracts</h1>
	<Table
		data={data.created_contracts.map((h) => {
			h.date = new Date(h.date.seconds).toUTCString();
			return h;
		})}
	/>

	<h1>History</h1>
	<Table
		data={data.trade_history.map((h) => {
			h.date = new Date(h.date.seconds).toUTCString();
			return h;
		})}
	/>
</div>
