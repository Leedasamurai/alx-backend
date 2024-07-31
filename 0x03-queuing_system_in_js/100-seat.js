// 100-seat.js

import express from 'express';
import redis from 'redis';
import kue from 'kue';
import { promisify } from 'util';

// Create an Express server
const app = express();
const port = 1245;

// Initialize Redis client
const client = redis.createClient();
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

// Initialize Kue queue
const queue = kue.createQueue();

// Set initial number of available seats
const INITIAL_SEATS = 50;

// Initialize reservation status
let reservationEnabled = true;

// Function to reserve seats in Redis
const reserveSeat = (number) => {
	return setAsync('available_seats', number);
};

// Function to get current available seats from Redis
const getCurrentAvailableSeats = async () => {
	const seats = await getAsync('available_seats');
	return parseInt(seats, 10) || 0;
};

// Set the initial number of available seats
reserveSeat(INITIAL_SEATS);

// Route to get available seats
app.get('/available_seats', async (req, res) => {
	const availableSeats = await getCurrentAvailableSeats();
	res.json({ numberOfAvailableSeats: availableSeats.toString() });
});

// Route to reserve a seat
app.get('/reserve_seat', (req, res) => {
	if (!reservationEnabled) {
		return res.json({ status: 'Reservation are blocked' });
	}

	const job = queue.create('reserve_seat', {}).save((err) => {
		if (err) {
			return res.json({ status: 'Reservation failed' });
		}
		res.json({ status: 'Reservation in process' });
	});

	job.on('complete', (result) => {
		console.log(`Seat reservation job ${job.id} completed`);
	}).on('failed', (errorMessage) => {
		console.log(`Seat reservation job ${job.id} failed: ${errorMessage}`);
	});
});

// Route to process the queue
app.get('/process', async (req, res) => {
	res.json({ status: 'Queue processing' });

	// Process the queue
	queue.process('reserve_seat', async (job, done) => {
		try {
			const availableSeats = await getCurrentAvailableSeats();
			if (availableSeats <= 0) {
				reservationEnabled = false;
				return done(new Error('Not enough seats available'));
			}

			await reserveSeat(availableSeats - 1);
			done();
		} catch (err) {
			done(err);
		}
	});
});

// Start the server
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
