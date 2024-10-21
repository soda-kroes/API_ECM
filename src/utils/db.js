


const { Pool } = require('pg');
// const pool = new Pool({
//   user: 'postgres',
//   password: 'sodaIT@168',
//   host: 'localhost',
//   port: '5432',
//   database: 'ecm_2k24',
// });
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

pool.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
  });
module.exports = pool;
