import sequelize from '../models/init'
import tb_test from '../models/test.model'
import EventModel from '../models/event.model'
import ParticipantModel from '../models/participant.model'
import EosNodeModel from '../models/eosNode.model'

import Sequelize, {Transaction} from 'sequelize'

var crypto = require('crypto');
var hash = crypto.createHash('sha256');

import { Api, JsonRpc, RpcError } from 'eosjs';

const Op = Sequelize.Op
let eonNodeList:EosNodeModel[]

class PickInfo {
    private rankCnt:number
    private pickNo:number[]

    constructor(rankCnt:number) {
        this.rankCnt = rankCnt
        this.pickNo = new Array()
    }

    addPickId(id:number) {
        this.pickNo.push(id)
    }

    isPickEnd(): boolean {
        if(this.rankCnt == this.pickNo.length) {
            return true
        }
        return false
    }
}

// class PickReceipt {

//     private rankCnt:number[]
//     private pickId:number[]

//     private fullHash:string[]
//     private subHash:string[]
// }

class SubHashPickInfo {

    private subHash:string
    private pickNo:number
    private isOk:boolean
    private rank:number

    constructor() {
        this.subHash = ""
        this.pickNo = 0
        this.isOk = false
        this.rank = 0
    }

    setSubHash(subHash:string) {
        this.subHash = subHash
    }

    setPickNo(pickNo:number) {
        this.pickNo = pickNo
    }

    setIsOk(isOk:boolean) {
        this.isOk = isOk
    }

    setRank(rank:number) {
        this.rank = rank
    }
}

class HashPickInfo {
    private hashInput:string
    private fullHash:string
    private subHashPickInfoList:SubHashPickInfo[]

    constructor(hashInput:string, fullHash:string) {
        this.hashInput = hashInput
        this.fullHash = fullHash
        this.subHashPickInfoList = new Array()
    }

    addSubHashInfos(subHashInfos:SubHashPickInfo) {
        this.subHashPickInfoList.push(subHashInfos)
    }
}

class EventResult {
    private blockChain:string
    private blockNo:number
    private eventId:number
    private maxPickCnt:number
    private totalParticipantCnt:number
    private pickInfoList:PickInfo[]
    private hashPickInfoList:HashPickInfo[]

    constructor(blockChain:string, blockNo:number, eventId:number, maxPickCnt:number, totalParticipantCnt:number,pickInfoList:PickInfo[], hashPickInfoList:HashPickInfo[] ) {
        this.blockChain = blockChain
        this.blockNo = blockNo
        this.eventId = eventId
        this.hashPickInfoList = hashPickInfoList
        this.maxPickCnt = maxPickCnt
        this.pickInfoList = pickInfoList
        this.totalParticipantCnt = totalParticipantCnt
    }

}


async function eventDeatilProc(): Promise<void> {

    let blockHash : string = "4cce907f2dc92d03e827775182e20394b8020bca12ba6d6fccb58f9a60873ea711"

    // 2. 추첨 최대수 확인
    const maxPickNo: number = 10000

    // 3. 추첨 인원 및 정보 확인
    let pickInfoList:PickInfo[] = new Array()

    for(let i = 0 ; i < 5 ; i++) {
        let pickInfo:PickInfo = new PickInfo(1+i)
        pickInfoList.push(pickInfo)
    }

    console.log("============")
    console.log("pickInfos")
    console.log(pickInfoList)
    console.log("============")

    // 3. 추첨
    //blockHash += event.id.toString()
    let totalPickList: number[] = new Array()
    let rankIndex: number = 0
    let hashPickList: HashPickInfo[] = new Array()

    while(true) {
        const hash = crypto.createHash('sha256').update(blockHash).digest('hex');
        console.log(hash)

        let hashPick: HashPickInfo = new HashPickInfo(blockHash,hash)

        for(let i=0; i< hash.length ; i+=8){
            let subHasgPickInfo:SubHashPickInfo = new SubHashPickInfo()
            let val:number = parseInt(hash.substring(i,i+8),16)
            let pickNo = val % maxPickNo +1

            subHasgPickInfo.setSubHash(hash.substring(i,i+8))
            subHasgPickInfo.setPickNo(pickNo)

            console.log("============")
            console.log(rankIndex)
            console.log(i,hash.substring(i,i+8).toString(10))
            console.log(val)
            console.log(pickNo)
            console.log(totalPickList.length)
            console.log("============")

            ///////////////////////////////////////////////
            // 중복 추첨 여부 확인
            let samePick: boolean = false
            for(let j=0 ; j < totalPickList.length ; j++) {

                if(pickNo == totalPickList[j]) {
                    samePick = true
                    break
                }
            }

            if(samePick) {
                console.log("same pick")
                hashPick.addSubHashInfos(subHasgPickInfo)
                continue
            }

            subHasgPickInfo.setIsOk(true)
            subHasgPickInfo.setRank(rankIndex+1)
            hashPick.addSubHashInfos(subHasgPickInfo)

            totalPickList.push(pickNo)
            ///////////////////////////////////////////////

            ///////////////////////////////////////////////
            // 참가 취소한 사용자 여부 확인

            ///////////////////////////////////////////////
            console.log("2222")
            ///////////////////////////////////////////////
            // 추첨 정보 업데이트
            pickInfoList[rankIndex].addPickId(pickNo)
            if(pickInfoList[rankIndex].isPickEnd()) {
                rankIndex++
            }

            if(rankIndex >= pickInfoList.length) {
                console.log("333")
                break
            }
            ///////////////////////////////////////////////////
        }

        hashPickList.push(hashPick)

        if(rankIndex >= pickInfoList.length) {
            break
        }
        blockHash = hash
    }
    console.log("============")
    console.log("pickInfos")
    console.log(pickInfoList)
    console.log("============")

    console.log("============")
    console.log("hashPickList")
    console.log(JSON.stringify(hashPickList))
    console.log("============")

    let eventResult:EventResult = new EventResult("EOS",22,11,maxPickNo,maxPickNo, pickInfoList ,hashPickList)

    console.log("============")
    console.log("eventResult")
    console.log(JSON.stringify(eventResult))
    console.log("============")

}

async function eventProc(): Promise<void> {

    // 1. 미 처리 이벤트 리스트 가져오기
    const eventList: EventModel[] = await EventModel.findAll( {
        where: {
            [Op.and]: [
                {del_yn:'N'},
                {close_yn:'N'},
                {
                    end_date: {
                        [Op.lt]: new Date()
                    }
                }]
        }
    })

    // 2. 노드 접속 주소 DB로부터 가져 오기
    if(eventList.length > 0) {
        eonNodeList = await EosNodeModel.findAll( {
            order: [
                ['id', 'ASC']
            ]
        })
    }

    // 3. 미 처리 이벤트 처리
    for(let event of eventList ) {
        console.log("Event No:", event.id)
        eventDeatilProc()
    }
}

async function main(): Promise<void> {


    //const hash = crypto.createHash('sha256').update("123").digest('hex');
    //console.log(hash)

    await eventDeatilProc()

}


if (require.main === module)
    main()