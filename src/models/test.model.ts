import sequelize from './init'
import {DataTypes, Model} from 'sequelize'


// 마지막에 사용했던 actionId를 기록한다
class tb_test extends Model {
    public id!: number
    //public create_date!: Date
    public tag_name!: string | null

}

tb_test.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        unique: true,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    // create_date: {
    //     type: DataTypes.DATE,
    //     allowNull: false
    // },
    tag_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
},{
    sequelize,
    // true인 경우 자동으로 createdAt, updateAt필드를 찾게 된다. 없으면 에러
    timestamps: false,
    tableName: 'tb_tag'
})


export default tb_test