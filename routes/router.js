const express = require('express');
const WebController = require('../controllers/web-controller');
const webController = require('../controllers/web-controller');

const router = express.Router();

module.exports = (app) => {
	//get home page
	router.get('/', WebController.renderOrderBook);

	//place limit order
	router.post('/', WebController.handlePlaceLimitOrder);

	//cancel order
	router.post('/cancel/:id', WebController.handleCancelOrder);

	// get open orders
	router.get('/open-orders', WebController.renderOpenOrders);
	// get order history
	router.get('/order-history', WebController.renderOrderHistory);

	// get search order
	router.get('/search-order', WebController.renderSearchOrder);
	// search order by orderId
	router.post('/search-order', WebController.handleSearchOrder);

	// get all spot asset
	router.get('/spot-assets', WebController.renderSpotAsset);
	

	return app.use(router);
}
