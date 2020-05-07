import sequelize from '../models/init'
import EventModel from '../models/event.model'
import ParticipantModel from '../models/participant.model'
import EosNodeModel from '../models/eosNode.model'
import {BlockInfo} from '../blockchain/eos/BlockInfo'

import Sequelize, {Transaction} from 'sequelize'

var crypto = require('crypto');
var hash = crypto.createHash('sha256');

const Op = Sequelize.Op
let eonNodeList:EosNodeModel[]

// 추첨 정보
class PickInfo {
    private rankCnt:number
    private pickId:number[]

    constructor(rankCnt:number) {
        this.rankCnt = rankCnt
        this.pickId = new Array()
    }

    addPickId(id:number) {
        this.pickId.push(id)
    }

    isPickEnd(): boolean {
        if(this.rankCnt == this.pickId.length) {
            return true
        }
        return false
    }
}

// Hash - SubHash별 정보
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

// Hash 정보
class HashPickInfo {
    private hashInput:string|null
    private fullHash:string
    private subHashPickInfoList:SubHashPickInfo[]

    constructor(hashInput:string|null, fullHash:string) {
        this.hashInput = hashInput
        this.fullHash = fullHash
        this.subHashPickInfoList = new Array()
    }

    addSubHashInfos(subHashInfos:SubHashPickInfo) {
        this.subHashPickInfoList.push(subHashInfos)
    }
}

// Event 결과 정보
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

/**
 * 개별 이벤트를 처리 한다.
 * @param event
 * @param blockHash
 * @param blockNo
 */
async function eventDeatilProc(event: EventModel, blockHash:string , blockNo:number): Promise<void> {

    // 1. 추첨 최대수/참가수 확인
    const maxPickNo: number = await ParticipantModel.max('pick_no',{
            where: {
                event_id: event.id
            }
        })

    const totalParticipantCnt: number = await ParticipantModel.count({
        where: {
            event_id: event.id
        }
    })

    // 2. 추첨 인원 및 정보 확인
    let pickInfoList:PickInfo[] = new Array()

    for(let rank in event.prize_info) {
        let pickInfo:PickInfo = new PickInfo((<any>event.prize_info[rank]).count)
        pickInfoList.push(pickInfo)
    }

    // 3. 추첨
    blockHash += event.id.toString()
    let totalPickList: number[] = new Array()
    let rankIndex: number = 0
    let hashPickList: HashPickInfo[] = new Array()

    while(true) {
        const hash:any = crypto.createHash('sha256').update(blockHash).digest('hex');
        let hashPick: HashPickInfo = new HashPickInfo(blockHash,hash)

        for(let i=0; i< hash.length ; i+=8){
            let subHasgPickInfo:SubHashPickInfo = new SubHashPickInfo()
            let val:number = parseInt(hash.substring(i,i+8),16)
            let pickNo = val % maxPickNo + 1

            subHasgPickInfo.setSubHash(hash.substring(i,i+8))
            subHasgPickInfo.setPickNo(pickNo)

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
                hashPick.addSubHashInfos(subHasgPickInfo)
                continue
            }

            subHasgPickInfo.setIsOk(true)
            subHasgPickInfo.setRank(rankIndex+1)
            hashPick.addSubHashInfos(subHasgPickInfo)

            totalPickList.push(pickNo)
            ///////////////////////////////////////////////

            ///////////////////////////////////////////////
            // 참가 취소한 사용자 여부 확인 - 추후
            ///////////////////////////////////////////////

            ///////////////////////////////////////////////
            // 추첨 정보 업데이트
            const t = await sequelize.transaction();
            try {

                ParticipantModel.update( {rank : rankIndex+1} , {where: {
                        [Op.and]: [
                            {event_id: event.id},
                            {pick_no: pickNo}]
                    }})

                await t.commit();

            } catch (error) {

                await t.rollback();
                continue
            }

            pickInfoList[rankIndex].addPickId(pickNo)
            if(pickInfoList[rankIndex].isPickEnd()) {
                rankIndex++
            }


            if(rankIndex >= pickInfoList.length || totalPickList.length >= totalParticipantCnt ) {
                break
            }
            ///////////////////////////////////////////////////
        }

        hashPickList.push(hashPick)

        if(rankIndex >= pickInfoList.length || totalPickList.length >= totalParticipantCnt) {
            break
        }
        blockHash = hash
    }

    let eventResult:EventResult = new EventResult("EOS",blockNo,event.id,maxPickNo,totalParticipantCnt, pickInfoList ,hashPickList)
    console.log(JSON.stringify(eventResult))

    const t2 = await sequelize.transaction();
    try {

        event.update( {result : eventResult, close_yn : "Y", block_hash: blockHash , block_num: blockNo } , {where: {
            event_id: event.id
            }})

        await t2.commit();

    } catch (error) {
        await t2.rollback();
    }

}

/**
 * 이벤트 처리
 */
export async function eventProc(): Promise<void> {

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
    else {
        console.log("No time up event")
        return
    }

    // 해쉬 계산
    let blockInfo:BlockInfo = new BlockInfo()
    let blockHash : string | null = null

    // 1. 해당 블록 해쉬 가져오기
    // 1-1. 노드 정보 가져오기
    for(let eosNode of eonNodeList) {
        console.log(eosNode.url)
        blockInfo.addNode(eosNode.url)
    }

    // 1-2.
    await blockInfo.getLatestBlockInfo()

    if(blockInfo.blockHash == null ) {
        //
        console.log("EOS Connect Error!!!")
        return
    }

    // 3. 미 처리 이벤트 처리
    for(let event of eventList ) {
        console.log("Event No:", event.id)
        eventDeatilProc(event,blockInfo.blockHash,blockInfo.blockNo)
    }
}


// For test
async function main(): Promise<void> {
    await eventProc()
}


if (require.main === module)
    main()