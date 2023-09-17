import type { PageLoad } from './$types';
import { db } from '../../services/firebase/firebase';
import { getDoc, doc, getDocs, query, collection, where } from 'firebase/firestore';
import { currentAccountStore } from '$lib/store';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		return { status: 400, body: 'ID not provided' };
	}

	try {
		console.log(id);
		const contractSnapshot = await getDoc(doc(db, 'contracts', id));
		const userSnapshot = (
			await getDocs(query(collection(db, 'users'), where('uuid', '==', get(currentAccountStore))))
		).docs[0];
		console.log(contractSnapshot.data());
		console.log(userSnapshot.data());
		if (contractSnapshot.exists()) {
			return { contract: contractSnapshot.data(), user: userSnapshot.data() };
		} else {
			return { status: 404, body: 'Contract not found' };
		}
	} catch (error) {
		return { status: 500, body: `Error fetching contract: ${error.message}` };
	}
};
