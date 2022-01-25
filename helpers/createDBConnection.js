const mysql = require('mysql');

const connect = async () => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: process.env.HOST,
            user: process.env.DB_USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        });

        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            else {
                resolve(connection);
            }
        })
    })
}

module.exports.connect = connect;   