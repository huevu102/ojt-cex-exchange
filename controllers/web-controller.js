const axios = require('axios');
const crypto = require('crypto');
const { response } = require('express');
const qs = require('qs');
const alert = require('alert');
require('dotenv').config();


// Binance API base url
const baseUrl = 'https://api.binance.com/api/v3';
// testnet base url
const testnetBaseUrl = 'https://testnet.binance.vision/api/v3';


module.exports = {
  //get order book
  renderOrderBook: async (req, res, next) => {
    const endpoint = '/depth';
    // order book details
    const coin1 = 'BTC';
    const coin2 = 'USDT';
    const symbol = coin1+coin2; // trading pair
    const limit = '10'; // number of orders

    const params = qs.stringify({
      symbol,
      limit
    });

    const url = `${baseUrl}${endpoint}?${params}`;

    axios.get(url)
      .then(response => {
        const orders = response.data;
        // console.log(orders);
        res.render('pages/home', 
          { 
            // lastUpdateId: orders.lastUpdateId,
            coin1: coin1,
            coin2: coin2,
            bids: orders.bids,
            asks: orders.asks,
            message: `${symbol}`
          })
      })
      .catch(error => {
        console.error(error);
      }); 
  },


  // search order book
  handleSearchOrderBook: async (req, res, next) => {
    const endpoint = '/depth';
    // order book details
    const coin1 = req.body.coin1.toUpperCase();
    const coin2 = req.body.coin2.toUpperCase();
    const symbol = coin1+coin2; // trading pair
    const limit = '10'; // number of orders

    const params = qs.stringify({
      symbol,
      limit
    });

    const url = `${baseUrl}${endpoint}?${params}`;

    axios.get(url)
      .then(response => {
        const orders = response.data;
        // console.log(orders);
        res.render('pages/home', 
          { 
            // lastUpdateId: orders.lastUpdateId,
            coin1: coin1,
            coin2: coin2,
            bids: orders.bids,
            asks: orders.asks,
            message: `${symbol}`
          })
      })
      .catch(error => {
        console.error(error);
      }); 
  },


  // place limit order
  handlePlaceLimitOrder: async (req, res, next) => {
    const endpoint = '/order';
    
    // Order details
    const symbol = req.body.limitTradingPair.toUpperCase(); //     -> only work when trading pair = BTCUSDT???
    const side = req.body.limitOderSide; // buy or sell

    const quantity = 0.001; // amount to buy
    const price = 40000; // price per unit

    // Timestamp for signature
    const timestamp = Date.now();

    const params = qs.stringify({
      symbol,
      side,
      type: 'LIMIT', // order type
      timeInForce: 'GTC', // good til canceled or IOC, FOK
      quantity,
      price,
      timestamp,
    });

    // Create signature
    const signature = crypto.createHmac('sha256', process.env.testnetSecretKey)
      .update(params) // `symbol=${symbol}&side=${side}&type=LIMIT&timeInForce=GTC&quantity=${quantity}&price=${price}&timestamp=${timestamp}`
      .digest('hex');

    const url = `${testnetBaseUrl}${endpoint}?${params}&signature=${signature}`;

    axios.post(url, null, {
      headers: {
        'X-MBX-APIKEY': process.env.testnetApiKey,
      }
    })
      .then(response => {
        const newOrder = response.data;
        // console.log(newOrder);
        alert(`Limit ${newOrder.side} ${newOrder.symbol} order created.`);
        res.redirect('/')
      })
      .catch(error => {
        console.error(error);
      });   
  },


  // cancel order
  handleCancelOrder: (req, res, next) => {
    const symbol = 'ETHUSDT';
    const orderId = req.params.id;

    const endpoint = '/order';

    const timestamp = Date.now();

    const params = qs.stringify({
      symbol,
      orderId,
      timestamp
    });

    const signature = crypto.createHmac('sha256', process.env.hueSecretKey)
      .update(params)
      .digest('hex');

    const url = `${baseUrl}${endpoint}?${params}&signature=${signature}`;

    axios.delete(url, {
      headers: {
        'X-MBX-APIKEY': process.env.hueApiKey
      }
    })
      .then(response => {
        // console.log(response.data);
        res.redirect('/open-orders');
      })
      .catch(error => {
        console.log(error.response.data);
      });
  },


  // get open orders
  renderOpenOrders: async (req, res, next) => {
    const endpoint = '/openOrders';
    // const symbol = 'BTCUSDT'; // optional but Careful when accessing this with no symbol
    const timestamp = Date.now();

    const params = qs.stringify({
      // symbol, // optional
      recvWindow: 60000, // optional
      timestamp, // required
    })

    const signature = crypto.createHmac('sha256', process.env.hueSecretKey)
      .update(params)
      .digest('hex');

    const url = `${baseUrl}${endpoint}?${params}&signature=${signature}`;

    axios.get(url, {
      headers: {
        'X-MBX-APIKEY': process.env.hueApiKey,
      }
    })
      .then(response => {
        const openOrders = response.data;
        // console.log(openOrders);
        res.render('pages/open-orders', 
          {
            orders: openOrders
          })
      })
      .catch(error => {
        console.error(error);
      });     
  },


  // get order history
  renderOrderHistory: async (req, res, next) => {
    const endpoint = '/allOrders';
    const coin1 = 'BTC';
    const coin2 = 'USDT';
    const symbol = coin1+coin2;
    const timestamp = Date.now();

    const params = qs.stringify({
      symbol,
      recvWindow: 60000,
      timestamp,
      
    })
    
    const signature = crypto.createHmac('sha256', process.env.testnetSecretKey)
      .update(params)
      .digest('hex');

    const url = `${testnetBaseUrl}${endpoint}?${params}&signature=${signature}`;

    axios.get(url, {
      headers: {
        'X-MBX-APIKEY': process.env.testnetApiKey
      }
    })
      .then(response => {
        const allOrders = response.data;
        // console.log(allOrders);
        res.render('pages/order-history', 
          { 
            coin1: coin1,
            coin2: coin2,
            orders: allOrders
          })
      })
      .catch(error => {
        console.error(error);
      });   
  },


  // search order history
  handleSearchOrderHistory: async (req, res, next) => {
    const endpoint = '/allOrders';
    const coin1 = req.body.historyCoin1.toUpperCase();
    const coin2 = req.body.historyCoin2.toUpperCase();
    const symbol = coin1+coin2;
    const timestamp = Date.now();

    const params = qs.stringify({
      symbol,
      recvWindow: 60000,
      timestamp,
      
    })
    
    const signature = crypto.createHmac('sha256', process.env.testnetSecretKey)
      .update(params)
      .digest('hex');

    const url = `${testnetBaseUrl}${endpoint}?${params}&signature=${signature}`;

    axios.get(url, {
      headers: {
        'X-MBX-APIKEY': process.env.testnetApiKey
      }
    })
      .then(response => {
        const allOrders = response.data;
        console.log(allOrders);
        if(allOrders.length==0) {
          alert('There was no order of this pair!')
        }
        res.render('pages/order-history', 
          { 
            coin1: coin1,
            coin2: coin2,
            orders: allOrders
          })
      })
      .catch(error => {
        console.error(error);
      });   
  },


  // get search order
  renderSearchOrder: async (req, res, next) => {
    res.render('pages/search-order',
      {
        order: {}
      })  
  },


  // search order by orderId
  handleSearchOrder: async (req, res, next) => {
    const endpoint = '/order';
    const coin1 = 'BTC';
    const coin2 = 'USDT';
    const symbol = coin1+coin2;
    // const symbol = req.body.searchTradingPair.toUpperCase();   -> API-key format invalid???
    const orderId = req.body.searchOrderId;
    const timestamp = Date.now();

    const params = qs.stringify({
      symbol,
      orderId,
      recvWindow: 60000,
      timestamp
    })
    
    const signature = crypto.createHmac('sha256', process.env.testnetSecretKey)
      .update(params)
      .digest('hex');

    const url = `${testnetBaseUrl}${endpoint}?${params}&signature=${signature}`;

    axios.get(url, {
      headers: {
        'X-MBX-APIKEY': process.env.testnetApiKey
      }
    })
      .then(response => {
        const order = response.data;
        res.render('pages/search-order', {
          coin1: coin1,
          coin2: coin2,
            order: order
          })
      })
      .catch(error => {
        console.error(error);
      });  
  },


  // get spot asset
  renderSpotAsset: async (req, res, next) => {
    const endpoint = '/exchangeInfo?permissions=SPOT';
    const url = `${testnetBaseUrl}${endpoint}`;

    axios.get(url)
      .then(response => {
        const spotAssets = response.data;
        // console.log(spotAssets);
        res.render('pages/spot-assets', {
            spotAssets: spotAssets.symbols
          })
      })
      .catch(error => {
        console.log(error)
      });
  },
}
