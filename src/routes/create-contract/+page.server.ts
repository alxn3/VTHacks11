import { onMount } from 'svelte';
import detectEthereumProvider from '@metamask/detect-provider';
import { db } from '../../services/firebase/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; 
import { contractUUIDs } from './contractStore.svelte'; 

export const actions = {
	default: async ({ cookies, request }) => {
		const formDataEntries = await request.formData();
		let dataObject: Record<string, any> = {};

		const contractId = uuidv4();

		for (let entry of formDataEntries.entries()) {
			const [key, value] = entry;
			dataObject[key] = value;
		}

		const defaultForOrderbook = {
			bids: [
			],
			asks: [
				{
					price: parseFloat(dataObject['starting-price']),
					amount: parseInt(dataObject['volume']),
					user: ""
				}
			]
		};

		const defaultHistoricalPrices = {
			history: [
				{
					date: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
					for_price: parseFloat(dataObject['starting-price']),
					against_price: parseFloat(dataObject['starting-price'])
				}
			]
		}

		let contractCollection = collection(db, 'contracts');	

		var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');

		await addDoc(contractCollection, {  
			id: contractId,
			title: dataObject['title'],
			description: dataObject['description'],
			startingPrice: parseFloat(dataObject['starting-price']),
			volume: parseInt(dataObject['volume']),
			for_orderbook: defaultForOrderbook, 
			against_orderbook: defaultForOrderbook, 
			start_date: utc, 
			end_date: "", 
			for_historicalPrices: defaultHistoricalPrices,
			against_historicalPrices: defaultHistoricalPrices
		})
		.then(() => {
			console.log('Document successfully written!');
			// Push the contract's UUID to the Svelte store
			contractUUIDs.update(ids => [...ids, contractId]);
		})
		.catch((error) => {
			console.error('Error writing document: ', error);
		});
	}
};