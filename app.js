const express = require('express');
const app = express();

// logger using morgan
const morgan = require('morgan');
app.use(morgan('dev'));

// use .env
require('dotenv').config();

// use helmet
const helmet = require('helmet');

/* currently I cannot fix the CSP for Font Awesome so I leave it here */

// app.use(helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//         "script-src": [
//             "'self'", 
//             "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js",
//             "https://kit.fontawesome.com/1fb1fb2be8.js",
//             "https://code.jquery.com/jquery-3.6.0.js",
//         ],
//         "style-src": [
//             "'self'",
//             "https://fonts.googleapis.com",
//             "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
//             "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
//             "https://ka-f.fontawesome.com/releases/v5.15.4/css/free.min.css?token=1fb1fb2be8",
//         ]
//     }
// }));

/* Disable CSP in Helmet because I cannot fix =))) Fuck it */
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// using middleware:
app.use(express.urlencoded({ extended: false }));
app.use('', express.static(__dirname + '/public'));
app.use('/products', express.static(__dirname + '/public'));
app.use('/products/:category/:page', express.static(__dirname + '/public'));

// include custom modules:

// product page:
const products = require('./libs/products');

// set view engine to ejs:
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/products/:category/:page', async (req, res) => {
    console.log('hello from product page');

    let category = req.params.category;
    let page = req.params.page;
    let productsPerPage = 12;
    let categories = await products.getCategories();
    let products_result = await products.getProductsByCategory(category, page, productsPerPage);
    
    res.render('products', {
        currentCategory: category,
        categories: categories,
        products: products_result.data,
        pages: Math.floor(products_result.counts / productsPerPage),
        currentPage: page
    });
});

app.get('/products/:category/:page/:productID', async(req, res) => {
    console.log('hello from product detail page');

    let category = req.params.category
    let page = req.params.page;
    let productID = req.params.productID;
    let product = await products.getProductByProductID(productID);
    res.render('product_detail', {
        product: product,
        currentCategory: category, 
        currentPage: page
    });
});

app.get('/products', (req, res) => {
    res.redirect('/products/all/1');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register'); 
});

app.get('/about', (req, res) => {
    res.render('about');
})

app.listen(process.env.PORT, () => {
    console.log('Server is listening on port ' + process.env.PORT);
});