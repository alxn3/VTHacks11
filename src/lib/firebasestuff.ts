// Contracts

{
    uuid: "uuid",
    title: "title",
    bg: "background stuff",
    for_orderbook: {
        bids: [
            {
                price: 0,
                amount: 0,
                user: "uuid"
            }
        ],
        asks: [
            {
                price: 0,
                amount: 0,
                user: "uuid"
            }
        ]
    },
    against_orderbook: {
        bids: [
            {
                price: 0,
                amount: 0,
                user: "uuid"
            }
        ],
        asks: [
            {
                price: 0,
                amount: 0,
                user: "uuid"
            }
        ]
    },
    for_volume: 1000,
    against_volume: 1000,
    lastPrice: 1,
    endDate: "date",
    startDate: "date",
    creator: "uuid",
    for_historicalPrices: [
        {
            date: "date",
            price: 1
        }
    ],
    against_historicalPrices: [
        {
            date: "date",
            price: 1
        }
    ],
}

// users
{
    uuid: "uuid",
    trade_history: [
        {
            uuid: "uuid",
            date: "date",
            price: 1,
            amount: 1,
            type: "buy/sell",
            bet: "for/against"
        }
    ],
    createdContracts: [
        "uuid"
    ],
    tokens: 1000,
    activeContracts: [
       {
        uuid: "uuid",
        amount: 1,
        bet: "for/against"
        buyprice: 1,
       }
    ],
}