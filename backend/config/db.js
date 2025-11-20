const { Sequelize } = require('sequelize')

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  NODE_ENV
} = process.env

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST || '127.0.0.1',
  port: DB_PORT ? Number(DB_PORT) : 3306,
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true
  }
})

const connectDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Connected to MySQL database')
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message)
    throw error
  }
}

module.exports = {
  sequelize,
  connectDatabase
}

