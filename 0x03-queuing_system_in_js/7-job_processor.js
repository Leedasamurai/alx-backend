const kue = require('kue');
const queue = kue.createQueue();

const blacklistedNumbers = [
	'4153518780',
	'4153518781'
];

function sendNotification(phoneNumber, message, job, done) {
	// Start job progress tracking
	job.progress(0, 100);

	// Check if the phone number is blacklisted
	if (blacklistedNumbers.includes(phoneNumber)) {
		// Fail the job with an error
		return done(new Error(`Phone number ${phoneNumber} is blacklisted`));
	}

	// Update job progress
	job.progress(50, 100);

	// Log the notification details
	console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);

	// Complete the job
	done();
}


// Process jobs with concurrency of 2
queue.process('push_notification_code_2', 2, (job, done) => {
	const { phoneNumber, message } = job.data;
	sendNotification(phoneNumber, message, job, done);
});

// Handle job events
queue.on('job complete', (id) => {
	console.log(`Notification job ${id} completed`);
});

queue.on('job failed', (id, err) => {
	console.log(`Notification job ${id} failed: ${err.message}`);
});

queue.on('job progress', (id, progress) => {
	console.log(`Notification job ${id} ${progress}% complete`);
});
