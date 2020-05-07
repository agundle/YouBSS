
const EosApi = require('eosjs-api') // Or EosApi = require('./src')

export class BlockInfo {
    nodeUrl: string[]
    public blockHash: string | null
    public blockNo: number

    constructor() {
        this.nodeUrl = new Array()
        this.blockHash = null
        this.blockNo = 0
    }

    addNode(url:string) {
        this.nodeUrl.push(url)
    }

    async getLatestBlockInfo(): Promise<boolean> {

        for(let url of this.nodeUrl) {
            console.log(url)
            let options = {
                httpEndpoint: url, // default,
                // null for cold-storage
                verbose: false, // API logging
                fetchConfiguration: {}
            }
            let eosApi = EosApi(options)

            let chainInfo

            try {
                chainInfo = await eosApi.getInfo({});
            }
            catch(error){

                const errorDetail = JSON.parse(error.message)
                console.log(errorDetail.error)
                continue

            }

            this.blockHash = chainInfo.last_irreversible_block_id
            this.blockNo = chainInfo.last_irreversible_block_num

            console.log("blockHash:",this.blockHash)
            console.log("blockNo",this.blockNo)
            return true
        }

        return false
    }
}


async function main(): Promise<void> {

    //eos.getBlock()
    let blockInfo:BlockInfo = new BlockInfo()

    blockInfo.addNode("https://api1.eosasia.one")
    console.log(await blockInfo.getLatestBlockInfo())
    console.log(blockInfo.blockHash)
    console.log(blockInfo.blockNo)

}

if (require.main === module)
     main()