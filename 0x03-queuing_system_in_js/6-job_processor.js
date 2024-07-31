import kue from 'kue';
import redis from 'redis';

// Create a Redis client
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
	console.error('Redis client not connected to the server:', err);
});

// Create a queue
const queue = kue.createQueue();

// Function to send notification
function sendNotification(phoneNumber, message) {
	console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);
}

// Process jobs in the push_notification_code queue
queue.process('push_notification_code', (job, done) => {
	const { phoneNumber, message } = job.data;
	sendNotification(phoneNumber, message);
	done();
});
