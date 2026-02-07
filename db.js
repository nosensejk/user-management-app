const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '06072002',
  database: 'mydb',
});

module.exports = pool;

