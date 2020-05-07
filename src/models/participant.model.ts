import sequelize from './init'
import {DataTypes, Model} from 'sequelize'


// 마지막에 사용했던 actionId를 기록한다
class ParticipantModel extends Model {
    public id!: bigint
    public event_id!: bigint
    public rank!: bigint
    public user_id!: bigint
    public update_date!: Date
    public pick_no!: bigint
}

ParticipantModel.init({
    id: {
        type: DataTypes.BIGINT,
        unique: true,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    event_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    rank: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    update_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    pick_no: {
        type: DataTypes.BIGINT,
        allowNull: true
    },

},{
    sequelize,
    // true인 경우 자동으로 createdAt, updateAt필드를 찾게 된다. 없으면 에러
    timestamps: false,
    tableName: 'tb_participant'
})

export default ParticipantModel