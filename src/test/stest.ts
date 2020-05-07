import sequelize from '../models/init'
import tb_test from '../models/test.model'
import tb_event from '../models/event.model'
import ParticipantModel from '../models/participant.model'
import EosNodeModel from '../models/eosNode.model'
//import {BlockHash} from '../blockchain/eos/BlockInfo'

import Sequelize, {Transaction} from 'sequelize'

var crypto = require('crypto');
var hash = crypto.createHash('sha256');

import { Api, JsonRpc, RpcError } from 'eosjs';


const Op = Sequelize.Op


async function eosGetBlockTest(): Promise<void> {
    const eonNodeList: EosNodeModel[] = await EosNodeModel.findAll( {
        order: [
            ['id', 'ASC']
        ]
    })

    // if(blockHash == null ) {
    //     throw "error"
    // }
    //console.log(blockHash)

    //console.log(eonNodeList[0].url)
}

async function main(): Promise<void> {


    const hash = crypto.createHash('sha256').update("123").digest('hex');

    console.log(hash)



    // console.log(`test BEGIN`)
    // let eventId = 17
    // let userId = 19
    //
    // const maxPickNo = await ParticipantModel.max('pick_no',{
    //     where: {
    //         event_id:eventId
    //     }
    // })
    //
    // const t = await sequelize.transaction();
    //
    // try {
    //
    //     ParticipantModel.update( {rank : 1} , {where: {
    //             [Op.and]: [
    //                 {event_id: eventId},
    //                 {user_id: userId}]
    //     }})
    //
    //     // If the execution reaches this line, no errors were thrown.
    //     // We commit the transaction.
    //     await t.commit();
    //
    // } catch (error) {
    //
    //     // If the execution reaches this line, an error was thrown.
    //     // We rollback the transaction.
    //     await t.rollback();
    //
    // }
    //
    // console.log(maxPickNo)



    //
    // const eventList: tb_event[] = await tb_event.findAll( {
    //     where: {
    //         [Op.and]: [
    //             {del_yn:'N'},
    //             {close_yn:'N'},
    //             {
    //                 end_date: {
    //                     [Op.lt]: new Date()
    //                 }
    //             }]
    //     }
    // })
    //
    // for(let event of eventList ) {
    //     //console.log(tb_test.prize_info)
    //
    //     //console.log((<any>tb_test.prize_info[0]).count)
    //     //console.log((<any>tb_test.prize_info[0]).prize)
    //
    //     for(let rank in event.prize_info) {
    //         console.log("Ranking:", rank)
    //         let pickCnt: number = (<any>event.prize_info[rank]).count
    //         console.log(pickCnt)
    //         //let hashVal =
    //     }
    //
    //
    //     //tb_test.prize_info.count
    // }

   // for(let tb_tests)
    //console.log(tb_tests[0].id)
    //console.log(tb_tests[0].block_hash)

    //console.log(tb_tests[0].id)
}


if (require.main === module)
    main()