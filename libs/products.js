const connection = require('../helpers/createDBConnection');
const mysql = require('mysql');

async function getProductsByCategory(product_category, page, productsPerPage) {
    console.log('Hello from getProduct function');
    const conn = await connection.connect();

    // 1: 1->6 6 * 1 - 6
    // 2: 7->12 6 * 2 - 6

    // handle category:

    let categories = await getCategories();
    let category = product_category;

    for (let i = 0; i < categories.length; i++) {
        let cat = categories[i].name.toLowerCase();
        if (cat.includes(',')) {
            cat = cat.split(',').join('');
        }
        cat = cat.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        cat = cat.split(' ').join('-');

        if (cat === product_category) {
            category = categories[i].name;
            console.log(category)
        }
    }

    let product_sql = null;
    let product_query_params = null;
    let product_query = null;
    let skipRows = (productsPerPage * page) - productsPerPage;

    if (category != 'all') {
        product_sql = 'SELECT barcode_data.id, barcode_data.product_name, barcode_data.image_url FROM barcode_data INNER JOIN categories ON barcode_data.category_id=categories.id AND categories.name = ? LIMIT ? OFFSET ?;';
        product_query_params = [category, productsPerPage, skipRows];
    }
    else {
        product_sql = 'SELECT id, product_name, image_url FROM barcode_data LIMIT ? OFFSET ?;';
        product_query_params = [productsPerPage, skipRows];
    }

    product_query = mysql.format(product_sql, product_query_params);
    
    const data = await new Promise((resolve, reject) => {
        conn.query(product_query, (err, res) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(res);
            }
        });
    });

    // query count based on category:
    let count_sql = null;
    let count_query_params = null;
    let count_query = null;

    if (category != 'all') {
        count_sql = 'SELECT COUNT(*) AS productsCount FROM barcode_data INNER JOIN categories ON barcode_data.category_id=categories.id AND categories.name = ?;';
        count_query_params = [category];
    }
    else {
        count_sql = 'SELECT COUNT(*) AS productsCount FROM barcode_data';
        count_query_params = [];
    }

    count_query = mysql.format(count_sql, count_query_params);
    const counts = await new Promise((resolve, reject) => {
        conn.query(count_query, (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        })
    });

    return {
        data: data,
        counts: counts[0].productsCount
    }
}

async function getProductByProductID(productID) {
    console.log('Hello from getProductByProductID function');

    const conn = await connection.connect();
    const product = await new Promise((resolve, reject) => {
        let sql = 'SELECT id, product_name, brand, made_in, image_url FROM barcode_data WHERE id = ?';
        let query_params = [productID];
        let query = mysql.format(sql, query_params);
        console.log(query);

        conn.query(query, (err, res) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(res);
            }
        });
    });

    product[0].product_name = product[0].product_name.trim();

    return product[0];
}

async function getCategories() {
    console.log('Hello from getCategories function');

    const conn = await connection.connect();
    const categories = await new Promise((resolve, reject) => {
        let query = 'SELECT id, name FROM categories;'
        
        conn.query(query, (err, res) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(res);
            }
        });
    });
    return categories;
}

module.exports.getProductsByCategory = getProductsByCategory;
module.exports.getProductByProductID = getProductByProductID;
module.exports.getCategories = getCategories;