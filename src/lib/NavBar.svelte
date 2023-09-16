<script>
	import { onMount } from 'svelte';
	import detectEthereumProvider from '@metamask/detect-provider';
	import { db } from '../services/firebase/firebase';
	import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
	export let loggedIn = false;

	let currentAccount = '';

	const createUser = async () => {
		let userCollection = collection(db, 'users');
		await addDoc(userCollection, {
			uuid: currentAccount,
			trade_history: [],
			tokens: 0,
			created_contracts: [],
			active_contracts: [],
			joined: new Date()
		})
			.then(() => {
				console.log('Document successfully written!');
			})
			.catch((/** @type {any} */ error) => {
				console.error('Error writing document: ', error);
			});
	};

	const connectMeta = async () => {
		detectEthereumProvider().then((provider) => {
			if (provider) {
				console.log('Ethereum successfully detected!');
				provider
					.request({ method: 'eth_requestAccounts' })
					.then((accounts) => {
						currentAccount = accounts[0];
						console.log(currentAccount);
						// check to see if user is in firebase else add them

						getDoc(doc(db, 'users', currentAccount))
							.then((doc) => {
								if (doc.exists()) {
									console.log('Document data:', doc.data());
								} else {
									console.log('No such document!');
									createUser();
								}
							})
							.catch((error) => {
								console.log('Error getting document:', error);
							});
						loggedIn = true;
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
	};
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
						<button class=" mx-4 text-lg">My Profile</button>
					</a>
				{:else}
					<button class="mx-4 text-lg" on:click={connectMeta}>connect metamask</button>
				{/if}
			</div>
		</div>
	</div>
</nav>
