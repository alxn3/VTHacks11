import type { PageLoad } from './$types';
import { db } from '../../services/firebase/firebase';
import { getDoc, doc, getDocs, query, collection, where } from 'firebase/firestore';
import { get } from 'svelte/store';
import { currentAccountStore } from '$lib/store';

export const load: PageLoad = async ({ url }) => {
	const id = url.searchParams.get('uuid');
	if (!id) {
		return { status: 400, body: 'ID not provided' };
	}

	try {
		console.log(id);
		const contractSnapshot = (
			await getDocs(query(collection(db, 'users'), where('uuid', '==', id)))
		).docs[0];
		console.log(contractSnapshot.data());
		if (contractSnapshot.exists()) {
			const data = contractSnapshot.data();
			return {
				...data,
				wallet_id: data.uuid,
				uuid: id
			};
		} else {
			return { status: 404, body: 'User not found' };
		}
	} catch (error) {
		return { status: 500, body: `Error fetching user: ${error.message}` };
	}
};
