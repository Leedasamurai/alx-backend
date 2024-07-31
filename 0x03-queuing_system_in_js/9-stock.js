// 9-stock.js

import express from 'express';
import redis from 'redis';
import { promisify } from 'util';

// Create an Express server
const app = express();
const port = 1245;

// Initialize Redis client
const client = redis.createClient();
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

// Sample product list
const listProducts = [
	{ id: 1, name: 'Suitcase 250', price: 50, stock: 4 },
	{ id: 2, name: 'Suitcase 450', price: 100, stock: 10 },
	{ id: 3, name: 'Suitcase 650', price: 350, stock: 2 },
	{ id: 4, name: 'Suitcase 1050', price: 550, stock: 5 },
];

// Function to get item by ID
const getItemById = (id) => {
	return listProducts.find((product) => product.id === id);
};

// Route to get list of products
app.get('/list_products', (req, res) => {
	const formattedProducts = listProducts.map((product) => ({
		itemId: product.id,
		itemName: product.name,
		price: product.price,
		initialAvailableQuantity: product.stock,
	}));
	res.json(formattedProducts);
});

// Route to get product details
app.get('/list_products/:itemId', async (req, res) => {
	const itemId = parseInt(req.params.itemId, 10);
	const product = getItemById(itemId);

	if (!product) {
		return res.json({ status: 'Product not found' });
	}

	const reservedStock = await getCurrentReservedStockById(itemId);
	const currentQuantity = product.stock - reservedStock;

	res.json({
		itemId: product.id,
		itemName: product.name,
		price: product.price,
		initialAvailableQuantity: product.stock,
		currentQuantity,
	});
});

// Route to reserve a product
app.get('/reserve_product/:itemId', async (req, res) => {
	const itemId = parseInt(req.params.itemId, 10);
	const product = getItemById(itemId);

	if (!product) {
		return res.json({ status: 'Product not found' });
	}

	const reservedStock = await getCurrentReservedStockById(itemId);

	if (product.stock - reservedStock <= 0) {
		return res.json({
			status: 'Not enough stock available',
			itemId: product.id,
		});
	}

	await reserveStockById(itemId, reservedStock + 1);
	res.json({
		status: 'Reservation confirmed',
		itemId: product.id,
	});
});

// Function to reserve stock in Redis
const reserveStockById = (itemId, stock) => {
	return setAsync(`item.${itemId}`, stock);
};

// Function to get current reserved stock from Redis
const getCurrentReservedStockById = async (itemId) => {
	const stock = await getAsync(`item.${itemId}`);
	return parseInt(stock, 10) || 0;
};

// Start the server
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
