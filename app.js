const express = require('express');
const session = require('express-session');
const app = express();

// logger using morgan
const morgan = require('morgan');
app.use(morgan('dev'));

// use .env
require('dotenv').config();

// use helmet
const helmet = require('helmet');

// passport:
const passport = require('passport');

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
app.use(session({ 
    secret: "cats",
    resave: false,
    saveUninitialized: false
}));
app.use(express.urlencoded({ extended: false }));
app.use('', express.static(__dirname + '/public'));
app.use('/products', express.static(__dirname + '/public'));
app.use('/products/:category/:page', express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(passport.session());

// get current user
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

// include custom modules:

// products page:
const products = require('./libs/products');

// users page:
const users = require('./libs/users');

// set view engine to ejs:
app.set('view engine', 'ejs');


// Homepage:
app.get('/', (req, res) => {
    res.render('home');
});

// Product page:
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
        currentPage: parseInt(page)
    });
});

// Product detail page:
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

// User page:
app.get('/user', (req, res) => {
    if (req.user) {
        console.log('Hello from user page')
        res.render('user');
    }
    else {
        let message = encodeURIComponent('Please login first!');
        res.redirect('/login?message=' + message);
    }
})

// Login page:
app.get('/login', (req, res) => {
    let message = '';
    if (req.query.message) {
        message = req.query.message;
    }
    if (!req.user) {
        res.render('login', {
            message: message
        });
    }
    else {
        res.redirect('back');
    }
});

const LocalStrategy = require('passport-local');
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
    async function verify(username, password, cb) {
        // console.log('hello world');
        const connection = require('./helpers/createDBConnection');
        const mysql = require('mysql');
        const bcrypt = require('bcrypt');
        
        const conn = await connection.connect();
        let user = await new Promise((resolve, reject) => {
            let cmd = 'SELECT first_name, last_name, email, encrypted_password FROM users WHERE email = ?';
            let params = [username];
            let query = mysql.format(cmd, params);

            conn.query(query, (err, res) => {
                if (err) {
                    // console.log(err);
                    return cb(null, false, { message: 'Incorrect email or password' });
                }
                else {
                    return resolve(res[0]);
                }
            })
        })
        // console.log(user);

        // check if user's password matched
        // console.log(password, user.encrypted_password);
        const match = await bcrypt.compare(password, user.encrypted_password);
        if (match) {
            return cb(null, user);
        }
        else {
            return cb(null, false, { message: 'Incorrect email or password' });
        }
        
    }
))

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.post(
    '/login',
    passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
    (req, res) => {
        // res.redirect('/');
        res.redirect('back');
    } 
)

// Register page:
app.get('/register', (req, res) => {
    let message = '';
    if (req.query.message) {
        message = req.query.message;
    }
    if (!req.user) {
        res.render('register', {
            message: message
        });
    }
    else {
        res.redirect('back');
    }
});

app.post('/register', async(req, res) => {
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let password = req.body.password[0];
    // console.log(req.body);
    
    let register = await users.register(first_name, last_name, email, password);
    if (register) {
        let str = encodeURIComponent('Register successfully! Please login to your account');
        res.redirect('/login?message=' + str);
    }
})

// Logout:
app.post('/logout', async(req, res) => {
    req.logout();
    res.redirect('/');
})

app.get('/about', (req, res) => {
    res.render('about');
})

app.listen(process.env.PORT, () => {
    console.log('Server is listening on port ' + process.env.PORT);
});

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    // some other closing procedures go here
    process.exit(0);
  });