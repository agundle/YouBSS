import sequelize from './init'
import {DataTypes, Model} from 'sequelize'

// 마지막에 사용했던 actionId를 기록한다
class EosNodeModel extends Model {
    public id!: number
    public url!: string
}

EosNodeModel.init({
    id: {
        type: DataTypes.NUMBER,
        unique: true,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true
    },

},{
    sequelize,
    // true인 경우 자동으로 createdAt, updateAt필드를 찾게 된다. 없으면 에러
    timestamps: false,
    tableName: 'tb_eos_node'
})

export default EosNodeModel