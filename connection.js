// db.js
const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'EMPLOYEE',
});

module.exports = pool;
