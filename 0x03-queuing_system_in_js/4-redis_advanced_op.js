import redis from 'redis';
import { client } from './0-redis_client.js';

function setNewHash() {
	client.hset('HolbertonSchools', 'Portland', 50, redis.print);
	client.hset('HolbertonSchools', 'Seattle', 80, redis.print);
	client.hset('HolbertonSchools', 'New York', 20, redis.print);
	client.hset('HolbertonSchools', 'Bogota', 20, redis.print);
	client.hset('HolbertonSchools', 'Cali', 40, redis.print);
	client.hset('HolbertonSchools', 'Paris', 2, redis.print);
}

function displayHash() {
	client.hgetall('HolbertonSchools', (err, obj) => {
		if (err) {
			console.log(err);
		} else {
			console.log(obj);
		}
	});
}

client.on('connect', () => {
	console.log('Redis client connected to the server');
	setNewHash();
	displayHash();
});

client.on('error', (err) => {
	console.log('Redis client not connected to the server:', err);
});
