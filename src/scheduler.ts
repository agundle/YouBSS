//////////////////////////////// node-cron /////////////////////////////////
import {eventProc} from "./job/eventProc";

var cron = require('node-cron');

function scheduler():void {

    // second minute hour day-of-month month day-of-week
    // Event 추첨 jos - 1시간 마다
    cron.schedule('0 0-23 * * *', async function(){
        console.log('===============================');
        console.log('Scheduler Start - Event Process');
        await eventProc()
        console.log('===============================');
    });

}

export default scheduler