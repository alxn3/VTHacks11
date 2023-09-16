<script>
	import { onMount } from 'svelte';
    import detectEthereumProvider from '@metamask/detect-provider';
	export let loggedIn = false;

    let currentAccount = null;
    const connectMeta = () => {
        detectEthereumProvider().then((provider) => {
            if (provider) {
                console.log('Ethereum successfully detected!');
                provider
                    .request({ method: 'eth_requestAccounts' })
                    .then((/** @type {any[]} */ accounts) => {
                        currentAccount = accounts[0];
                        loggedIn = true;
                        console.log(currentAccount);
                    })
                    .catch((/** @type {{ code: number; }} */ err) => {
                        if (err.code === 4001) {
                            // EIP-1193 userRejectedRequest error
                            console.log('Please connect to MetaMask.');
                        } else {
                            console.error(err);
                        }
                    });
            } else {
                console.error('Please install MetaMask!');
            }
        });
    }
</script>

<nav class="w-full bg-neutral-900 text-white">
	<div class="w-full bg-primary-900 bg-opacity-20 pt-2">
		<div class=" mx-auto flex h-[3.5rem] w-full items-center justify-between">
            <div class="mx-4">
                <h1><a href="/">BuddyBets</a></h1>
            </div>
			<div class="flex">
				{#if loggedIn}
					<a href="/profile">
						<button
							class=" mx-4 text-lg"
							>My Profile</button
						>
					</a>
				{:else}
					<button
						class="mx-4 text-lg"
                        on:click={connectMeta}
						>connect metamask</button
					>
				{/if}
			</div>
		</div>
	</div>
</nav>
