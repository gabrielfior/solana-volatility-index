//var cron = require('node-cron');
import * as cron from 'node-cron';
import { execute } from './main';

let task = cron.schedule('*/5 * * * *', () => {
  console.log('starting job', new Date());
  execute();
  console.log('finished job');
}, {
  scheduled: true
});

task.start();