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

import { currentAccountStore } from './store';

import { get, writable } from 'svelte/store';

export const loggedIn = writable(false);
export const accountData = writable({});

export const addTokensToAccount = async (numTokens: number) => {
	const q = query(collection(db, 'users'), where('uuid', '==', get(currentAccountStore)));

	getDocs(q)
		.then((querySnapshot) => {
			if (!querySnapshot.empty) {
				// User with currentAccount exists
				updateDoc(querySnapshot.docs[0].ref, {
					tokens: querySnapshot.docs[0].data().tokens + numTokens
				});
			} else {
				// No user with currentAccount found, create a new user
				console.log('No such document!');
			}
		})
		.then(() => {
			updateUserData();
		})
		.catch((error) => {
			console.log('Error getting document:', error);
		});
};

export const subtractTokensFromAccount = async (numTokens: number) => {
	const q = query(collection(db, 'users'), where('uuid', '==', get(currentAccountStore)));
	if (get(accountData).tokens - numTokens < 0) {
		console.log('Not enough tokens!');
		return;
	}
	getDocs(q)
		.then((querySnapshot) => {
			if (!querySnapshot.empty) {
				// User with currentAccount exists
				updateDoc(querySnapshot.docs[0].ref, {
					tokens: querySnapshot.docs[0].data().tokens - numTokens
				});
			} else {
				// No user with currentAccount found, create a new user
				console.log('No such document!');
			}
		})
		.then(() => {
			updateUserData();
		})
		.catch((error) => {
			console.log('Error getting document:', error);
		});
};

export const createUser = async () => {
	let userCollection = collection(db, 'users');
	await addDoc(userCollection, {
		uuid: get(currentAccountStore),
		trade_history: [],
		tokens: 0,
		created_contracts: [],
		active_contracts: [],
		joined: new Date()
	})
		.then(() => {
			console.log('Document successfully written!');
			accountData.set({
				uuid: get(currentAccountStore),
				trade_history: [],
				tokens: 0,
				created_contracts: [],
				active_contracts: [],
				joined: new Date()
			});
		})
		.catch((/** @type {any} */ error) => {
			console.error('Error writing document: ', error);
		});
};

export const updateUserData = async () => {
	const userRef = doc(db, 'users', get(currentAccountStore));
	const q = query(collection(db, 'users'), where('uuid', '==', get(currentAccountStore)));

	const userSnap = await getDoc(userRef);

	getDocs(q)
		.then((querySnapshot) => {
			if (!querySnapshot.empty) {
				// User with currentAccount exists
				console.log('User exists. Document data:', querySnapshot.docs[0].data());
				accountData.set(querySnapshot.docs[0].data());
			} else {
				// No user with currentAccount found, create a new user
				console.log('No such document!');
			}
		})
		.catch((error) => {
			console.log('Error getting document:', error);
		});
};

export const connectMeta = async () => {
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
								accountData.set(querySnapshot.docs[0].data());
							} else {
								// No user with currentAccount found, create a new user
								console.log('No such document!');
								createUser();
							}
						})
						.then(() => {
							loggedIn.set(true);
							window.sessionStorage.setItem('loggedIn', 'true');
							window.sessionStorage.setItem('currentAccount', currentAccount);
							window.sessionStorage.setItem('accountData', JSON.stringify(accountData));
						})
						.catch((error) => {
							console.log('Error getting document:', error);
						});
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
