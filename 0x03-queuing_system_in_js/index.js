const express = require('express');
const kue = require('kue');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const queue = kue.createQueue();
const redisClient = redis.createClient();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello, Queuing System!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
