import { onMount } from 'svelte';
import detectEthereumProvider from '@metamask/detect-provider';
import { db } from '../../services/firebase/firebase';
import { addDoc, collection, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const updateOrderbook = async (type, operation, dataObject, userUuid) => {
    const contractId = dataObject.get('contractId');
    const price = parseFloat(dataObject.get('price'));
    const amount = parseInt(dataObject.get('amount'));

    let specificContractDoc = doc(db, 'contracts', contractId);
    let path = "";

    if (type === "for") {
        path = (operation === "buy") ? "for_orderbook.bids" : "for_orderbook.asks";
    } else if (type === "against") {
        path = (operation === "buy") ? "ask_orderbook.bids" : "ask_orderbook.asks";
    }

    try {
        await updateDoc(specificContractDoc, {
            [path]: arrayUnion({
                price: price,
                amount: amount,
                user: userUuid
            })
        });
        console.log("Contract updated!");
    } catch (error) {
        console.error("Error updating contract: ", error);
    }
};

export const actions = {
    default: async ({cookies, request }) => {
        const data = await request.formData();
        console.log(data);
        const actionType = data.get('actionType'); 
        const userUuid = data.get('currentUuid');

        switch(actionType) {
            case 'buyForShares':
                await updateOrderbook("for", "buy", data, userUuid);
                break;
            case 'sellForShares':
                await updateOrderbook("for", "sell", data, userUuid);
                break;
            case 'buyAgainstShares':
                await updateOrderbook("against", "buy", data, userUuid);
                break;
            case 'sellAgainstShares':
                await updateOrderbook("against", "sell", data, userUuid);
                break;
            default:
                console.error("Unknown action type");
                break;
        }
    }
};
