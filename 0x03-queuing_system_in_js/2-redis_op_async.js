import redis from 'redis';
import { promisify } from 'util';
import { client } from './0-redis_client.js';

const getAsync = promisify(client.get).bind(client);

function setNewSchool(schoolName, value) {
	client.set(schoolName, value, redis.print);
}

async function displaySchoolValue(schoolName) {
	try {
		const value = await getAsync(schoolName);
		console.log(value);
	} catch (err) {
		console.log(err);
	}
}

displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
