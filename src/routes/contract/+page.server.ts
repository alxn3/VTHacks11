import { onMount } from 'svelte';
import detectEthereumProvider from '@metamask/detect-provider';
import { db } from '../../services/firebase/firebase';
import { addDoc, collection, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const updateOrderbook = async (type, operation, dataObject, userUuid) => {
	console.log('updateOrderbook', type, operation, dataObject, userUuid);
	const fillType = dataObject.get('ordertype');
	const contractId = dataObject.get('contractId');
	const price = parseFloat(dataObject.get('price'));
	let amount = parseInt(dataObject.get('amount'));

	let specificContractDoc = doc(db, 'contracts', contractId);
	let path = '';

	// check if the user has enough tokens to make the order if it is a buy order

	let userDoc = doc(db, 'users', userUuid);
	let userDocData = await getDoc(userDoc);
	if (!userDocData.exists()) {
		console.error('User does not exist');
		return;
	}
	let userCurrentContracts = userDocData.data().active_contracts;
	let userTokens = userDocData.data().tokens;
	if (operation === 'buy' && userTokens < price * amount) {
		console.error('User does not have enough tokens');
		return;
	}
	if (operation === 'sell') {
		// check if the user has enough contracts to sell
		let userCurrentContractIndex = userCurrentContracts.findIndex(
			(contract) => contract.uuid === contractId
		);
		if (userCurrentContractIndex === -1) {
			console.error('User does not have enough contracts');
			return;
		}
		let userCurrentContract = userCurrentContracts[userCurrentContractIndex];
		if (userCurrentContract.amount < amount) {
			console.error('User does not have enough contracts');
			return;
		}
	}

	if (type === 'for') {
		path = 'for_orderbook';
	} else if (type === 'against') {
		path = 'against_orderbook';
	}
	let aorb = operation === 'buy' ? 'asks' : 'bids';

	// see if the orderbook could fulfill the order
	let orderbookDoc = await getDoc(specificContractDoc);
	if (!orderbookDoc.exists()) {
		console.error('Contract does not exist');
		return;
	}

	let orderbook = orderbookDoc.data()[path][aorb];
    if (orderbook === undefined) {
        orderbook = [];
    }
	orderbook.sort((a, b) => {
		return operation === 'buy' ? a.price - b.price : b.price - a.price;
	});

	let curUserNetTokens = 0;
	let newContracts = [];
	let soldContracts = [];
	if (fillType === 'market') {
		// if market order, then fill as much as possible and then add the rest to the orderbook, corresponding to the type of order
		// update user trade history and current contracts
		let filled = 0;
		let i = 0;
		while (filled < amount && i < orderbook.length) {
			let order = orderbook[i];
			let amtFilled = 0;
			console.log('order', order);
			if (order.amount > amount - filled) {
				// fill the order and update the orderbook
				order.amount -= amount - filled;
				amtFilled += amount - filled;
				filled = amount;
			} else {
				// fill the order and remove it from the orderbook
				filled += order.amount;
				orderbook.splice(i, 1);
				amtFilled += order.amount;
			}
			let nettokens = amtFilled * order.price * (operation === 'buy' ? -1 : 1);
			if (order.user != '') {
				let userDoc = doc(db, 'users', order.user);
				let userDocData = await getDoc(userDoc);
				if (!userDocData.exists()) {
					console.error('User does not exist');
					return;
				}
				let userTradeHistory = userDocData.data().trade_history;
				let userCurrentContracts = userDocData.data().active_contracts;
				let userCurrentContractIndex = userCurrentContracts.findIndex(
					(contract) => contract.uuid === contractId
				);
				if (operation === 'buy') {
					// update trade history and current contracts of user who owned the order
					let userCurrentContract = userCurrentContracts[userCurrentContractIndex];
					userCurrentContract.amount -= amtFilled;
					userCurrentContracts[userCurrentContractIndex] = userCurrentContract;
					userTradeHistory.push({
						uuid: contractId,
						date: new Date(),
						price: order.price,
						amount: amtFilled,
						type: 'sell'
					});
					userCurrentContracts = userCurrentContracts.filter((contract) => contract.amount > 0);
					// filter out contracts with 0 amount
					await updateDoc(userDoc, {
						trade_history: userTradeHistory,
						active_contracts: userCurrentContracts,
						tokens: userDocData.data().tokens + nettokens * -1
					});
				} else {
					if (userCurrentContractIndex === -1) {
						userCurrentContracts.push({
							uuid: contractId,
							amount: amtFilled
						});
					} else {
						let userCurrentContract = userCurrentContracts[userCurrentContractIndex];
						userCurrentContract.amount += amtFilled;
						userCurrentContracts[userCurrentContractIndex] = userCurrentContract;
					}
					userTradeHistory.push({
						uuid: contractId,
						date: new Date(),
						price: order.price,
						amount: amtFilled,
						type: 'buy'
					});
					await updateDoc(userDoc, {
						trade_history: userTradeHistory,
						active_contracts: userCurrentContracts,
						tokens: userDocData.data().tokens + nettokens * -1
					});
				}
			}

			if (operation === 'buy') {
				newContracts.push({
					uuid: contractId,
					amount: amtFilled
				});
			} else {
				soldContracts.push({
					uuid: contractId,
					amount: amtFilled
				});
			}
			curUserNetTokens += nettokens;
			i++;
		}
		if (filled < amount) {
			// add the rest to the orderbook
			if (type === 'for') {
				path = 'for_orderbook';
			} else if (type === 'against') {
				path = 'against_orderbook';
			}
			let aorb = operation === 'buy' ? 'bids' : 'asks';
			orderbook = orderbookDoc.data()[path][aorb];
			orderbook.push({
				price: price,
				amount: amount - filled,
				user: userUuid
			});
		}
	} else if (fillType === 'limit') {
		// if limit order, then add the order to the orderbook
		orderbook.push({
			price: price,
			amount: amount,
			user: userUuid
		});
	}

	// update current user trade history and current contracts
	let userTradeHistory = userDocData.data().trade_history;
	userCurrentContracts = userDocData.data().active_contracts;
	console.log('userCurrentContracts', userCurrentContracts);
	console.log('userDocData.data()', userDocData.data());
	userTradeHistory.push({
		uuid: contractId,
		date: new Date(),
		price: price,
		amount: amount,
		type: operation
	});

	if (operation === 'buy') {
		userCurrentContracts = userCurrentContracts.concat(newContracts);
	} else {
		let userCurrentContractIndex = userCurrentContracts.findIndex(
			(contract) => contract.uuid === contractId
		);
		let userCurrentContract = userCurrentContracts[userCurrentContractIndex];
		userCurrentContract.amount -= amount;
		userCurrentContracts[userCurrentContractIndex] = userCurrentContract;
		userCurrentContracts = userCurrentContracts.filter((contract) => contract.amount > 0);
	}
	console.log('curUserNetTokens', curUserNetTokens);
	console.log('userDocData.data().tokens', userDocData.data().tokens);

	await updateDoc(userDoc, {
		trade_history: userTradeHistory,
		active_contracts: userCurrentContracts,
		tokens: userDocData.data().tokens + curUserNetTokens
	});

	// update the contract's orderbook
	await updateDoc(specificContractDoc, {
		[path]: {
			[aorb]: orderbook
		}
	});
};

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		console.log(data);
		const actionType = data.get('actionType');
		const userUuid = data.get('currentUuid');

		switch (actionType) {
			case 'buyForShares':
				await updateOrderbook('for', 'buy', data, userUuid);
				break;
			case 'sellForShares':
				await updateOrderbook('for', 'sell', data, userUuid);
				break;
			case 'buyAgainstShares':
				await updateOrderbook('against', 'buy', data, userUuid);
				break;
			case 'sellAgainstShares':
				await updateOrderbook('against', 'sell', data, userUuid);
				break;
			default:
				console.error('Unknown action type');
				break;
		}
	}
};
