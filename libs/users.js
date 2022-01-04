const connection = require('../helpers/createDBConnection');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

// passport
// const passport = require('passport');
// const LocalStrategy = require('passport-local');

async function register(first_name, last_name, email, password) {
    console.log('Hello from register!')
    const conn = await connection.connect();

    // encrypt password:
    const salt = parseInt(process.env.SALTROUNDS, 10);
    const encrypted_password = await bcrypt.hash(password, salt);
    // console.log(encrypted_password);

    let insert_cmd = await new Promise((resolve, reject) => {
        let cmd = 'INSERT INTO users (first_name, last_name, email, encrypted_password, created_at, is_admin) VALUES (?, ?, ?, ?, ?, ?)';

        let params = [first_name, last_name, email, encrypted_password, new Date(), 0];
        let query = mysql.format(cmd, params);

        conn.query(query, (err, res) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(res.insertId);
            }
        });
    });

    return insert_cmd;
}

// async function login(email, password) {
    
// }


module.exports.register = register;
// module.exports.login = login;