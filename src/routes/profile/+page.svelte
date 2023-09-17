<script lang="ts">
	import Table from '$lib/Table.svelte';
	import { accountData } from '$lib/accountUtils';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="text-5xl font-light">Profile </h1>
<h2 class="text-3xl font-thin mt-2">{data.wallet_id}</h2>
<div class="h-10" />
<div class="w-fit">
	<h1>Account Info</h1>
	<Table
		data={[
			{ key: 'UUID', value: data.uuid },
			{ key: 'Created Contracts', value: data.created_contracts?.length },
			{ key: 'Active Contracts', value: data.active_contracts?.length },
			{ key: 'Trade History', value: data.trade_history?.length }
		]}
	/>
</div>
<div class="space-y-4">
	<div>
		<h1>Active Contracts</h1>
		<Table
			data={data.active_contracts?.map((h) => {
				if (h.date) h.date = new Date(h.date.seconds).toUTCString();
				return h;
			})}
		/>
	</div>
	<div>
		<h1>Created Contracts</h1>
		<Table
			data={data.created_contracts?.map((h) => {
				h.date = new Date(h.date.seconds).toUTCString();
				return h;
			})}
		/>
	</div>
	<div>
		<h1>History</h1>
		<Table
			data={data.trade_history?.map((h) => {
				h.date = new Date(h.date.seconds).toUTCString();
				return h;
			})}
		/>
	</div>
</div>
