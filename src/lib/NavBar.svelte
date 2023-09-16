<script>
	import { onMount } from 'svelte';
	import detectEthereumProvider from '@metamask/detect-provider';
	import { db } from '../services/firebase/firebase';
	import {
		addDoc,
		collection,
		doc,
		getDoc,
		getDocs,
		query,
		updateDoc,
		where
	} from 'firebase/firestore';
	import Icon from '@iconify/svelte';
	import { get, writable} from 'svelte/store';
	import { currentAccountStore } from './store';
	export let loggedIn = false;

	let currentAccount = '';
	let addTokens = false;
	let accountData = {};
	let newTokens = 0;

	const addTokensToAccount = async () => {
		const q = query(collection(db, 'users'), where('uuid', '==', currentAccount));

		getDocs(q)
			.then((querySnapshot) => {
				if (!querySnapshot.empty) {
					// User with currentAccount exists
					updateDoc(querySnapshot.docs[0].ref, {
						tokens: querySnapshot.docs[0].data().tokens + newTokens
					});
				} else {
					// No user with currentAccount found, create a new user
					console.log('No such document!');
				}
			})
			.then(() => {
				addTokens = false;
				newTokens = 0;
				updateUserData();
			})
			.catch((error) => {
				console.log('Error getting document:', error);
			});
	};

	const subtractTokensFromAccount = async () => {
		const q = query(collection(db, 'users'), where('uuid', '==', currentAccount));
		if (accountData.tokens - newTokens < 0) {
			console.log('Not enough tokens!');
			return;
		}
		getDocs(q)
			.then((querySnapshot) => {
				if (!querySnapshot.empty) {
					// User with currentAccount exists
					updateDoc(querySnapshot.docs[0].ref, {
						tokens: querySnapshot.docs[0].data().tokens - newTokens
					});
				} else {
					// No user with currentAccount found, create a new user
					console.log('No such document!');
				}
			})
			.then(() => {
				addTokens = false;
				newTokens = 0;
				updateUserData();
			})
			.catch((error) => {
				console.log('Error getting document:', error);
			});
	};

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
				accountData = {
					uuid: currentAccount,
					trade_history: [],
					tokens: 0,
					created_contracts: [],
					active_contracts: [],
					joined: new Date()
				};
			})
			.catch((/** @type {any} */ error) => {
				console.error('Error writing document: ', error);
			});
	};

	const updateUserData = async () => {
		const userRef = doc(db, 'users', currentAccount);
		const q = query(collection(db, 'users'), where('uuid', '==', currentAccount));

		const userSnap = await getDoc(userRef);

		getDocs(q)
			.then((querySnapshot) => {
				if (!querySnapshot.empty) {
					// User with currentAccount exists
					console.log('User exists. Document data:', querySnapshot.docs[0].data());
					accountData = querySnapshot.docs[0].data();
				} else {
					// No user with currentAccount found, create a new user
					console.log('No such document!');
				}
			})
			.catch((error) => {
				console.log('Error getting document:', error);
			});
	};

	const connectMeta = async () => {
		detectEthereumProvider().then((provider) => {
			if (provider) {
				console.log('Ethereum successfully detected!');
				provider
					.request({ method: 'eth_requestAccounts' })
					.then((/** @type {string[]} */ accounts) => {
						currentAccount = accounts[0];
						currentAccountStore.set(currentAccount);
						console.log(currentAccount);

						const q = query(collection(db, 'users'), where('uuid', '==', currentAccount));

						getDocs(q)
							.then((querySnapshot) => {
								if (!querySnapshot.empty) {
									// User with currentAccount exists
									console.log('User exists. Document data:', querySnapshot.docs[0].data());
									accountData = querySnapshot.docs[0].data();
								} else {
									// No user with currentAccount found, create a new user
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
				<h1><a href="/">WeXchange</a></h1>
			</div>
			<div class="flex">
				{#if loggedIn}
					<button
						class="mx-4 text-lg border-2 border-black p-2 rounded-xl hover:border-gray-700 transition-all"
						on:click={() => (addTokens = !addTokens)}>tokens: {accountData.tokens}</button
					>
					<a href="/profile">
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
				<h1>Current balance: {accountData.tokens} tokens</h1>
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
						on:click={addTokensToAccount}>Transfer in</button
					>
					<button
						class="bg-black text-white p-2 rounded-xl border-2 border-opacity-0 hover:border-opacity-100 transition-all border-gray-700"
						on:click={subtractTokensFromAccount}>Transfer out</button
					>
				</div>
			</div>
		</div>
	</div>
</nav>
