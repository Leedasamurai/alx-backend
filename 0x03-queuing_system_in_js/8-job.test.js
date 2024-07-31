const kue = require('kue');
const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

const createPushNotificationsJobs = require('./8-job.js');

describe('createPushNotificationsJobs', () => {
  let queue;
  let jobSpy;

  before(() => {
    // Create a Kue queue for testing
    queue = kue.createQueue();

    // Set queue to test mode
    queue.testMode.enter();

    // Spy on job creation and processing
    jobSpy = sinon.spy(queue, 'create');
  });

  afterEach(() => {
    // Clear the queue after each test
    queue.testMode.clear();
  });

  after(() => {
    // Exit test mode
    queue.testMode.exit();
    // Restore spy
    jobSpy.restore();
  });

  it('should throw an error if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs({}, queue)).to.throw('Jobs is not an array');
  });

  it('should create jobs in the queue', () => {
    const list = [
      { phoneNumber: '4153518780', message: 'Test message 1' },
      { phoneNumber: '4153518781', message: 'Test message 2' }
    ];

    createPushNotificationsJobs(list, queue);

    // Check that jobs were added to the queue
    const jobs = queue.testMode.jobs;
    expect(jobs).to.have.lengthOf(2);
    expect(jobs[0].data).to.deep.equal(list[0]);
    expect(jobs[1].data).to.deep.equal(list[1]);
  });

  it('should log job creation and progress correctly', (done) => {
    const list = [
      { phoneNumber: '4153518780', message: 'Test message 1' }
    ];

    // Stub console.log to check its calls
    const logSpy = sinon.spy(console, 'log');
    
    createPushNotificationsJobs(list, queue);

    // Check that the correct logs were made
    setImmediate(() => {
      expect(logSpy.calledWith('Notification job created: 1')).to.be.true;
      logSpy.restore();
      done();
    });
  });

});
