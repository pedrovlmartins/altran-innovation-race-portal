/**
 * Created by Afonso on 25/03/2017.
 */
var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 10,
  host: '192.168.58.180',
  user: 'root',
  database: 'irp',
});

// Exemplo

/*
 function getUsers(next) {
 pool.query('SELECT * FROM Utilizador', function (err, rows, fields) {
 if (typeof next === 'function')
 next(rows);
 });
 }
 */

module.exports = {};
