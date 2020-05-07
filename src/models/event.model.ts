import sequelize from './init'
import {DataTypes, Model} from 'sequelize'


// 마지막에 사용했던 actionId를 기록한다
class EventModel extends Model {
    public id!: number
    public block_hash!: string | null
    public block_num!: number
    public chain_name!: string| null
    public del_yn!: string
    public close_yn!: string
    public end_date!: Date
    public prize_info!: JSON[]
    public result!: JSON
    //public create_date!: Date
    //public tag_name!: string | null

}

EventModel.init({
    id: {
        type: DataTypes.NUMBER,
        unique: true,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    block_hash: {
        type: DataTypes.STRING,
        allowNull: true
    },
    block_num: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    chain_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    del_yn: {
        type: DataTypes.STRING,
        allowNull: true
    },
    close_yn: {
        type: DataTypes.STRING,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    prize_info: {
        type: DataTypes.JSON,
        allowNull: true
    },
    result: {
        type: DataTypes.JSON,
        allowNull: true
    },

    // // create_date: {
    // //     type: DataTypes.DATE,
    // //     allowNull: false
    // // },
    // tag_name: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // },
},{
    sequelize,
    // true인 경우 자동으로 createdAt, updateAt필드를 찾게 된다. 없으면 에러
    timestamps: false,
    tableName: 'tb_event'
})


export default EventModel