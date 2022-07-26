const { Pool } = require('pg')

// Local
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'expressjs-note',
    password: 'root',
    port: 5432
})

// Production


module.exports = pool