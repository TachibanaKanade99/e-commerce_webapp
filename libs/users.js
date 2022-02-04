const connection = require('../helpers/createDBConnection');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

// passport
// const passport = require('passport');
// const LocalStrategy = require('passport-local');

async function register(firstName, lastName, email, password) {
    console.log('Hello from register!')
    const conn = await connection.connect();

    // encrypt password:
    const salt = parseInt(process.env.SALTROUNDS, 10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    // console.log(encrypted_password);

    let insertUser = await new Promise((resolve, reject) => {
        let sql = 'INSERT INTO users (first_name, last_name, email, encrypted_password, created_at, is_admin) VALUES (?, ?, ?, ?, ?, ?)';

        let params = [firstName, lastName, email, encryptedPassword, new Date(), 0];
        let sql_query = mysql.format(sql, params);

        conn.query(sql_query, (err, res) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(res.insertId);
            }
        });
    });

    return insertUser;
}

// async function login(email, password) {
    
// }

/*
This average rating is from rating table. However the database average value is random values :)))
So I decided to take to the average of rating value in Products table and from Users Rating table 
*/

async function getAverageRating(productId) {
    const conn = await connection.connect();
    const userAverageRating = await new Promise((resolve, reject) => {
        let sql = 'SELECT AVG(rating) AS averageRating FROM ratings_users_barcode_data WHERE product_id = ?';
        let params = [productId];
        let sql_query = mysql.format(sql, params);

        conn.query(sql_query, (err, res) => {
            if (err) return reject(err);
            else return resolve(res[0].averageRating);
        })
    });
    console.log(userAverageRating);

    const productAverageRating = await new Promise((resolve, reject) => {
        let sql = 'SELECT average_rating FROM barcode_data WHERE id = ?';
        let params = [productId];
        let sql_query = mysql.format(sql, params);

        conn.query(sql_query, (err, res) => {
            if (err) return reject(err);
            else return resolve(res[0].average_rating);
        });
    });
    console.log(productAverageRating);

    let finalResult = (userAverageRating + productAverageRating) / 2;
    return finalResult;
}

async function postRating(userId, productId, rating) {
    const conn = await connection.connect();
    let insertRating = await new Promise((resolve, reject) => {
        let sql = 'INSERT INTO ratings_users_barcode_data (user_id, product_id, rating) VALUES (?, ?, ?)';
        let params = [userId, productId, rating];
        let sql_query = mysql.format(sql, params);

        conn.query(sql_query, (err, res) => {
            if (err) return reject(err);
            else return resolve(res.insertId);
        });
    });
    const averageRating = await getAverageRating(productId);
    // console.log(averageRating);

    if (insertRating) {
        const products = require('./products');
        const isUpdateProduct = await products.updateAverageRating(averageRating, productId);
        // console.log(isUpdateProduct);
    }
    return insertRating;
}


module.exports.register = register;
// module.exports.login = login;
module.exports.postRating = postRating;