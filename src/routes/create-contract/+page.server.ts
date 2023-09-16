import { onMount } from 'svelte';
import detectEthereumProvider from '@metamask/detect-provider';
import { db } from '../../services/firebase/firebase';
import { addDoc, collection, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export const actions = {
	default: async ({ cookies, request }) => {
		const formDataEntries = await request.formData();
		let dataObject: Record<string, any> = {};
		
		const defaultForOrderbook = {
			bids: [
			],
			asks: [
			]
		};
		
		const defaultHistoricalPrices = {
			history: [
			]
		}

		for (let entry of formDataEntries.entries()) {
			const [key, value] = entry;
			dataObject[key] = value;
		}
		
		let contractCollection = collection(db, 'contracts');	

		var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
		
        await addDoc(contractCollection, {  
			title: dataObject['title'],
			description: dataObject['description'],
			startingPrice: parseFloat(dataObject['starting-price']),
			volume: parseInt(dataObject['volume']),
			for_orderbook: defaultForOrderbook, 
			ask_orderbook: defaultForOrderbook, 
			start_date: utc, 
			end_date: "", 
			for_historicalPrices: defaultHistoricalPrices,
			against_historicalPrices: defaultHistoricalPrices

		})
		.then(() => {
			console.log('Document successfully written!');
		})
		.catch((error) => {
			console.error('Error writing document: ', error);
		});
	}
};
