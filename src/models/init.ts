import {Sequelize} from 'sequelize'

const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../../config/config.json')[env]

console.log('env=', env)
console.log('host=', config.host)
console.log('database=', config.database)
console.log('username=', config.username)

const sequelize = new Sequelize(config.database, config.username, config.password, {
    'host': config.host,
    'dialect': config.dialect,
    'dialectOptions': config.dialectOptions,
    'logging': config.logging,
    'pool': config.pool,
    'timezone': config.timezone,
    'logQueryParameters': config.logQueryParameters,
    'benchmark': config.benchmark
})

export default sequelize