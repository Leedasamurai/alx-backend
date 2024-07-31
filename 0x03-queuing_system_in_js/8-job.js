const kue = require('kue');

function createPushNotificationsJobs(jobs, queue) {
	if (!Array.isArray(jobs)) {
		throw new Error('Jobs is not an array');
	}

	jobs.forEach((jobData) => {
		const job = queue.create('push_notification_code_3', jobData);

		// Log when a job is created
		job.on('enqueue', () => {
			console.log(`Notification job created: ${job.id}`);
		});

		// Log when a job completes
		job.on('complete', () => {
			console.log(`Notification job ${job.id} completed`);
		});

		// Log when a job fails
		job.on('failed', (err) => {
			console.log(`Notification job ${job.id} failed: ${err.message}`);
		});

		// Log job progress
		job.on('progress', (progress) => {
			console.log(`Notification job ${job.id} ${progress}% complete`);
		});

		job.save();
	});
}

module.exports = createPushNotificationsJobs;
