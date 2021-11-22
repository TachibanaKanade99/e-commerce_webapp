const express = require('express');
const app = express();

const path = require('path');

// logger using morgan
const morgan = require('morgan');
app.use(morgan('dev'));

// use .env
require('dotenv').config();

// using middleware:
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
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
    res.render('/register'); 
});

app.get('/about', (req, res) => {
    res.render('about');
})

app.get('/checkout', async(req, res) => {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var partnerCode = "MOMO";
    var accessKey = "F8BBA842ECF85";
    var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    var requestId = partnerCode + new Date().getTime();
    var orderId = requestId;
    var orderInfo = "pay with MoMo";
    var redirectUrl = "https://momo.vn/return";
    var ipnUrl = "https://callback.url/notify";
    // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
    var amount = "50000";
    var requestType = "captureWallet"
    var extraData = ""; //pass empty value if your merchant does not have stores

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey="+accessKey+"&amount=" + amount+"&extraData=" + extraData+"&ipnUrl=" + ipnUrl+"&orderId=" + orderId+"&orderInfo=" + orderInfo+"&partnerCode=" + partnerCode +"&redirectUrl=" + redirectUrl+"&requestId=" + requestId+"&requestType=" + requestType
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
    //signature
    const crypto = require('crypto');
    var signature = crypto.createHmac('sha256', secretkey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode : partnerCode,
        accessKey : accessKey,
        requestId : requestId,
        amount : amount,
        orderId : orderId,
        orderInfo : orderInfo,
        redirectUrl : redirectUrl,
        ipnUrl : ipnUrl,
        extraData : extraData,
        requestType : requestType,
        signature : signature,
        lang: 'en'
    });
    //Create the HTTPS objects
    const https = require('https');
    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    }
    //Send the request and get the response
    let res_url = null;
    const request = https.request(options, response => {
        console.log(`Status: ${response.statusCode}`);
        console.log(`Headers: ${JSON.stringify(response.headers)}`);
        response.setEncoding('utf8');
        response.on('data', (body) => {
            console.log('Body: ');
            console.log(body);
            console.log('payUrl: ');
            res_url = JSON.parse(body).payUrl;
            console.log(res_url);
        });
        response.on('end', () => {
            console.log('No more data in response.');
            res.redirect(res_url);
        });
    })

    request.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    // write data to request body
    console.log("Sending....")
    request.write(requestBody);
    request.end();
})

app.listen(process.env.PORT, () => {
    console.log('Server is listening on port ' + process.env.PORT);
});