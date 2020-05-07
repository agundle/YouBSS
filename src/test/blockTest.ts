
import {BlockInfo} from '../blockchain/eos/BlockInfo'
 
export async function expectedBlockNo(pickDate: Date) : Promise<number> {
  
  //const block:any = await BlockInfo("https://api.eoseoul.io",63072000)
  //console.log(block.timestamp)

  let genesisBlockTime = new Date("2018-06-08T08:08:08.500")
  //let pickTime = new Date("2018-06-08T08:08:08.500")

  let genesisBlockMin:number = genesisBlockTime.getTime()
  let pickDateMin:number = pickDate.getTime()
  let blockNo = ((pickDateMin - genesisBlockMin)/1000) * 2 + 1

  console.log(genesisBlockMin)
  console.log(pickDateMin)
  console.log(blockNo)

  //const block:any = await BlockInfo("https://api.eoseoul.io",blockNo)
  //console.log(block)
  
  return 1
}


async function main(): Promise<void> {

  //eos.getBlock()

  await expectedBlockNo(new Date('2019-06-08T08:08:08.500'));


  // options.httpEndpoint = "https://api1.eosasia.one"
  // eos = EosApi(options)

  // const data2:any = await eos.getBlock({block_num_or_id: 1});
  // console.log(data2)
}

if (require.main === module)
   main()