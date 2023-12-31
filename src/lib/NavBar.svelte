<script lang="ts">
	import { onMount } from 'svelte';

	import Icon from '@iconify/svelte';
	import { get, writable } from 'svelte/store';
	import { currentAccountStore } from './store';
	import { ethers } from 'ethers';

	import {
		updateUserData,
		addTokensToAccount,
		subtractTokensFromAccount,
		connectMeta,
		accountData
	} from './accountUtils';

	export let loggedIn = false;
	let addTokens = false;
	let newTokens = 0;

	onMount(() => {
		if (window.sessionStorage.getItem('loggedIn') === 'true') {
			loggedIn = true;
			if (window.sessionStorage.getItem('currentAccount') !== null)
				currentAccountStore.set(window.sessionStorage.getItem('currentAccount'));
			if (window.sessionStorage.getItem('accountData') !== null)
				accountData.set(JSON.parse(window.sessionStorage.getItem('accountData')));
		}
		updateUserData();
	});
	let flowBalance = 0;
	const getFlowBalance = async () => {
		const flowAPI =
			'https://docs-demo.flow-mainnet.quiknode.pro/v1/accounts/0x1e3c78c6d580273b?expand=keys,contracts';
		await fetch(flowAPI)
			.then((response) => response.json())
			.then((data) => {
				flowBalance = data.balance;
				return data.balance;
			})
			.catch((err) => console.error(err));
	};

    // circle transfer to liquidity pool code
    let usdcBalance = '0';
    let transferAmount = '0';
    let receiverAddress = '';
    let provider: ethers.providers.Web3Provider | null = null;
    let signer: ethers.Signer | null = null;
    async function transferUSDC() {
    try {
      if (!provider || !signer || !receiverAddress || !transferAmount) return;

      const usdcContractAddress = 'USDC_CONTRACT_ADDRESS'; // Replace with the actual USDC contract address
      const usdcContractABI = ['function transfer(address, uint256) returns (bool)'];
      const usdcContract = new ethers.Contract(usdcContractAddress, usdcContractABI, signer);

      const tx = await usdcContract.transfer(receiverAddress, ethers.utils.parseUnits(transferAmount, 6));
      await tx.wait();

      usdcBalance = (await usdcContract.balanceOf(await signer.getAddress())).toString();
    } catch (error) {
      console.error('Error transferring USDC:', error);
    }
  }
</script>

<nav class="w-full bg-neutral-900 text-white">
	<div class="w-full bg-primary-900 bg-opacity-20 pt-2">
		<div class=" mx-auto flex h-[3.5rem] w-full items-center justify-between">
			<div class="mx-4">
				<h1><a href="/">WeXchange</a></h1>
			</div>
			<div class="flex">
				{#if loggedIn}
					<button
						class="mx-4 text-lg border-2 border-black p-2 rounded-xl hover:border-gray-700 transition-all"
						on:click={() => {
							addTokens = !addTokens;
							getFlowBalance();
						}}>tokens: {$accountData.tokens}</button
					>
					<a href={`/profile?uuid=${get(accountData).uuid}`}>
						<button
							class="mx-4 text-lg bg-black p-2 rounded-xl border-2 border-opacity-0 hover:border-opacity-100 transition-all border-gray-700"
							>My Profile</button
						>
					</a>
				{:else}
					<button
						class="mx-4 text-lg bg-black p-2 rounded-xl border-2 border-opacity-0 hover:border-opacity-100 transition-all border-gray-700"
						on:click={connectMeta}>connect metamask</button
					>
				{/if}
			</div>
		</div>
	</div>
	<div
		class="absolute right-0 left-0 top-0 bottom-0 inset-0 {addTokens
			? ''
			: 'hidden'} h-screen backdrop-blur-md"
	>
		<div class=" w-1/3 h-1/3 bg-black rounded-xl drop-shadow-lg mx-auto my-32">
			<button on:click={() => (addTokens = false)}>
				<Icon icon="ph:x" class="w-8 h-8 text-white absolute top-4 right-4" />
			</button>
			<div class="m-8 space-y-2">
				<h1>Transfer funds</h1>
				<h1>Current balance: {$accountData.tokens} tokens</h1>
				<h1>Tokens:</h1>
				<input
					type="number"
					class="w-full h-12 rounded-md border-2 border-neutral-700 bg-black p-2"
					placeholder="0"
					bind:value={newTokens}
				/>

				<div class="flex justify-between">
					<button
						class="bg-black text-white p-2 rounded-xl border-2 border-opacity-0 hover:border-opacity-100 transition-all border-gray-700"
						on:click={() => addTokensToAccount(newTokens)}>Transfer in</button
					>
					<button
						class="bg-black text-white p-2 rounded-xl border-2 border-opacity-0 hover:border-opacity-100 transition-all border-gray-700"
						on:click={() => subtractTokensFromAccount(newTokens)}>Transfer out</button
					>
				</div>
				<div>
					Flow Balance: {flowBalance} FLOW.
				</div>
			</div>
		</div>
	</div>
</nav>
