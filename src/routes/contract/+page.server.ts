import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebase';

const updateOrderbook = async (type, operation, dataObject, userUuid) => {
    const fillType = dataObject.get('fillType');
    const contractId = dataObject.get('contractId');
    const price = parseFloat(dataObject.get('price'));
    let amount = parseInt(dataObject.get('amount'));

    let specificContractDoc = doc(db, 'contracts', contractId);
    let path = "";

    // check if the user has enough tokens to make the order if it is a buy order
    
    let userDoc = doc(db, 'users', userUuid);
    let userDocData = await getDoc(userDoc);
    if (!userDocData.exists()) {
        console.error("User does not exist");
        return;
    }
    let userCurrentContracts = userDocData.data().current_contracts;
    let userTokens = userDocData.data().tokens;
    if (operation === "buy" && userTokens < price * amount) {
        console.error("User does not have enough tokens");
        return;
    }
    if (operation === "sell") {
        // check if the user has enough contracts to sell
        let userCurrentContractIndex = userCurrentContracts.findIndex(contract => contract.uuid === contractId);
        if (userCurrentContractIndex === -1) {
            console.error("User does not have enough contracts");
            return;
        }
        let userCurrentContract = userCurrentContracts[userCurrentContractIndex];
        if (userCurrentContract.amount < amount) {
            console.error("User does not have enough contracts");
            return;
        }
    }

    if (type === "for") {
        path = (operation === "buy") ? "for_orderbook.asks" : "for_orderbook.bids";
    } else if (type === "against") {
        path = (operation === "buy") ? "against_orderbook.asks" : "against_orderbook.bids";
    }

    // see if the orderbook could fulfill the order
    let orderbookDoc = await getDoc(specificContractDoc);
    if (!orderbookDoc.exists()) {
        console.error("Contract does not exist");
        return;
    }
    let orderbook = orderbookDoc.data()[path];

    orderbook.sort((a, b) => {
        return (operation === "buy") ? a.price - b.price : b.price - a.price;
    });

    let curUserNetTokens = 0;
    let newContracts = [];
    let soldContracts = [];
    if (fillType === "market") {
        // if market order, then fill as much as possible and then add the rest to the orderbook, corresponding to the type of order
        // update user trade history and current contracts
        let filled = 0;
        let i = 0;
        while (filled < amount && i < orderbook.length) {
            let order = orderbook[i];
            let amtFilled = 0;
            if (order.amount > amount - filled) {
                // fill the order and update the orderbook
                order.amount -= amount - filled;
                filled = amount;
                amtFilled = amount - filled;
            }
            else {
                // fill the order and remove it from the orderbook
                filled += order.amount;
                orderbook.splice(i, 1);
                amtFilled = order.amount;
            }
            let nettokens = order.amount * order.price * ((operation === "buy") ? -1 : 1);
            if (order.user != "")
            {
                let userDoc = doc(db, 'users', order.user);
                let userDocData = await getDoc(userDoc);
                if (!userDocData.exists()) {
                    console.error("User does not exist");
                    return;
                }
                // update trade history and current contracts of user who owned the order
                let userTradeHistory = userDocData.data().trade_history;
                let userCurrentContracts = userDocData.data().current_contracts;
                let userCurrentContractIndex = userCurrentContracts.findIndex(contract => contract.uuid === contractId);
                let userCurrentContract = userCurrentContracts[userCurrentContractIndex];
                userCurrentContract.amount -= amtFilled;
                userCurrentContracts[userCurrentContractIndex] = userCurrentContract;
                userTradeHistory.push({
                    uuid: contractId,
                    date: new Date(),
                    price: order.price,
                    amount: order.amount,
                    type: operation
                });
                // filter out contracts with 0 amount
                userCurrentContracts = userCurrentContracts.filter(contract => contract.amount > 0);
                await updateDoc(userDoc, {
                    trade_history: userTradeHistory,
                    current_contracts: userCurrentContracts,
                    tokens: userDocData.data().tokens + nettokens*-1
                });
            }
            
            if (operation === "buy") {
                newContracts.push({
                    uuid: contractId,
                    amount: order.amount
                });
            }
            else {
                soldContracts.push({
                    uuid: contractId,
                    amount: order.amount
                });
            }
            curUserNetTokens += nettokens;
            i++;
        }
        if (filled < amount) {
            // add the rest to the orderbook
            if (type === "for") {
                path = (operation === "buy") ? "for_orderbook.bids" : "for_orderbook.asks";
            } else if (type === "against") {
                path = (operation === "buy") ? "against_orderbook.bids" : "against_orderbook.asks";
            }
            orderbook = orderbookDoc.data()[path];
            orderbook.push({
                price: price,
                amount: amount - filled,
                user: userUuid
            });
        }
    } else if (fillType === "limit") {
        // if limit order, then add the order to the orderbook
        orderbook.push({
            price: price,
            amount: amount,
            user: userUuid
        });
    }

    // update current user trade history and current contracts
    let userTradeHistory = userDocData.data().trade_history;
    userCurrentContracts = userDocData.data().current_contracts;

    userTradeHistory.push({
        uuid: contractId,
        date: new Date(),
        price: price,
        amount: amount,
        type: operation
    });

    if (operation === "buy") {
        curUserNetTokens = curUserNetTokens*-1;
        userCurrentContracts = userCurrentContracts.concat(newContracts);
    }
    else {
        let userCurrentContractIndex = userCurrentContracts.findIndex(contract => contract.uuid === contractId);
        let userCurrentContract = userCurrentContracts[userCurrentContractIndex];
        userCurrentContract.amount -= amount;
        userCurrentContracts[userCurrentContractIndex] = userCurrentContract;
        userCurrentContracts = userCurrentContracts.filter(contract => contract.amount > 0);
    }
    await updateDoc(userDoc, {
        trade_history: userTradeHistory,
        current_contracts: userCurrentContracts,
        tokens: userDocData.data().tokens + curUserNetTokens
    });
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
