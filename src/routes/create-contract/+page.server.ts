import { addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebase';
import { contractUUIDs } from './contractStore.svelte';
export const actions = {
	default: async ({ cookies, request }) => {
		const formDataEntries = await request.formData();
		const dataObject: Record<string, any> = {};

		const contractCollection = collection(db, 'contracts');		

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
					date: new Date(),
					for_price: parseFloat(dataObject['starting-price']),
					against_price: parseFloat(dataObject['starting-price'])
				}
			]
		}


		await addDoc(contractCollection, {  
			title: dataObject['title'],
			description: dataObject['description'],
			startingPrice: parseFloat(dataObject['starting-price']),
			volume: parseInt(dataObject['volume']),
			for_orderbook: defaultForOrderbook, 
			against_orderbook: defaultForOrderbook, 
			start_date: new Date(), 
			end_date: "", 
			for_historicalPrices: defaultHistoricalPrices,
			against_historicalPrices: defaultHistoricalPrices
		})
		.then((docRef) => {
			console.log('Document successfully written!');
			// Push the contract's UUID to the Svelte store
			const contractId = docRef.id;
			contractUUIDs.update(ids => [...ids, contractId]);
			updateDoc(docRef, {
				id: contractId
			});
		})
		.catch((error) => {
			console.error('Error writing document: ', error);
		});
	}
};