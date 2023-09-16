import { onMount } from 'svelte';
import detectEthereumProvider from '@metamask/detect-provider';
import { db } from '../../services/firebase/firebase';
import { addDoc, collection, updateDoc, getDocs} from 'firebase/firestore';
import { contractUUIDs } from './contractStore.svelte'; 
import { doc, setDoc } from 'firebase/firestore';
export const actions = {
	default: async ({ cookies, request }) => {
		const formDataEntries = await request.formData();
		let dataObject: Record<string, any> = {};

		let contractCollection = collection(db, 'contracts');

		const newContractRef = doc(contractCollection);  // Create a new document reference with an auto-generated ID
		const contractId = newContractRef.id;

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


		var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');

		await addDoc(contractCollection, {  
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
		.then((docRef) => {
			console.log('Document successfully written!');
			// Push the contract's UUID to the Svelte store
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