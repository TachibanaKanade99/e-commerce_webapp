// var MenuItems = document.getElementById("MenuItems");
// MenuItems.style.maxHeight = "0px";

// function menutoggle(){
//     if (MenuItems.style.maxHeight == "0px"){
//         MenuItems.style.maxHeight = "200px";
//     }
//     else {
//         MenuItems.style.maxHeight = "0px";
//     }
// }

// make navbar fixed top when scrolling
window.onscroll = () => {
    let navbarElement = document.getElementsByClassName('header')[0];
    let backToTopElement = document.getElementById('back-to-top-btn');
    // let categoryElement = document.getElementsByClassName('fixed-category-tab');
    // let additionColElement = document.getElementsByClassName('addition-col');

    // if (categoryElement) {
    //     if (document.documentElement.scrollTop > 645 || document.body.scrollTop > 645) {
    //         console.log(categoryElement[0]);
    //         categoryElement[0].style.position = 'static';
    //         additionColElement[0].style.display = 'none';
    //     }
    //     else {
    //         categoryElement[0].style.position = 'fixed';
    //         additionColElement[0].style.display = 'block';    
    //     }
    // }

    if (document.documentElement.scrollTop > 120 || document.body.scrollTop > 120) {
        // navbar:
        // navbarElement.style.padding = "0px 0px 0px 0px";
        // navbarElement.classList.add('fixed-top');

        // back-to-top btn:
        backToTopElement.style.display = 'block';
    }
    else {
        // navbarElement.style.padding = "0px 0px 0px 0px";   
        // navbarElement.classList.remove('fixed-top');

        // back-to-top btn:
        backToTopElement.style.display = 'none';
    }
}

// back-to-top:
backToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// set active for category:
document.querySelectorAll('#navbar-link').forEach(item => {
    item.addEventListener('click', (e) => {
        e = e || window.event;
        let target = e.target || e.srcElement;
        // console.log(target);

        // remove element had active:
        let element = document.querySelector('.navbar-active');
        if(element !== null){
            element.classList.remove('navbar-active');
        } 
        target.classList.add('navbar-active');
        
    }, false);
});

// set cart number when page load
// value is taken from localStorage
window.onload = () => {
    // load number of badge:
    let badge_element = document.getElementById('badge-num');
    let badge_num = parseInt(localStorage.getItem('badge_num'), 10);

    if (!badge_num) {
        localStorage.setItem('badge_num', 0);
        badge_num = 0;
    }

    if (badge_num != 0) {
        badge_element.classList.remove('d-none');
    }
    badge_element.innerHTML = badge_num;

    // Load product info on cart modal:
    let products = JSON.parse(localStorage.getItem('products'));
    if (products) {
        for (let i = 0; i < products.length; i++) {
            updateCartTable(i+1, products[i].id, products[i].name, products[i].quantity, products[i].price);
        }
    }

    updateRemoveItemCartListener();
    calculateTotalPrice();
}

updateCartTable = (num, id, name, quantity, price) => {
    // create element and add to cart table:
    let cart_element = document.getElementById('cart-table');
    let row = cart_element.insertRow();
    let productID = row.insertCell(0);
    let productName = row.insertCell(1);
    let productQuantity = row.insertCell(2);
    let productPrice = row.insertCell(3);
    let closeBtn = row.insertCell(4);

    // set value for each cell:
    productID.innerHTML = num;
    productName.innerHTML = name;
    productQuantity.innerHTML = quantity;
    productPrice.innerHTML = price;
    closeBtn.innerHTML = '<button id="remove-cart-item" class="btn btn-sm btn-danger" onclick="removeItemCart(this, ' + id + ')">X</button>';
}

addToCart = (productName, productPrice) => {
    

    let badge_element = document.getElementById('badge-num');
    let badge_num = parseInt(localStorage.getItem('badge_num'), 10);

    // increase badge number and save to localStorage
    badge_num++;
    localStorage.setItem('badge_num', badge_num);
    badge_element.innerHTML = badge_num;

    if (badge_element.classList.contains('d-none')) {
        badge_element.classList.remove('d-none');
    }
    
    // set product into localStorage:

    let products = null;
    if (localStorage.getItem('products') === null) {
        products = [];
    }
    else {
        products = JSON.parse(localStorage.getItem('products'));
        // console.log(products);
    }

    let product = {
        id: badge_num,
        name: productName,
        quantity: 1,
        price: productPrice
    }
    products.push(product);
    updateCartTable(badge_num, product.id, product.name, product.quantity, product.price);
    localStorage.setItem('products', JSON.stringify(products));

    // update cart table:
    updateRemoveItemCartListener();
    calculateTotalPrice();
}

// update listen for event of remove-item-cart button
updateRemoveItemCartListener = () => {
    // remove item in cart table:
    document.querySelectorAll('#remove-cart-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e = e || window.event;
            let target = e.target || e.srcElement;
            console.log(target);
        })
    });
}

removeItemCart = (element, productID) => {
    // remove product from localStorage
    let products = JSON.parse(localStorage.getItem('products'));
    let foundProduct = products.find((product) => {
        return productID == product.id;
    })
    products.splice(products.indexOf(foundProduct), 1);

    // update products in localStorage
    localStorage.setItem('products', JSON.stringify(products));

    element.parentElement.parentElement.remove();

    // update badge number:
    let badge_num = parseInt(localStorage.getItem('badge_num'), 10);
    badge_num--;
    localStorage.setItem('badge_num', badge_num);

    let badge_element = document.getElementById('badge-num');
    badge_element.innerHTML = badge_num;

    // if badge_num == 0 set d-none
    if (badge_num == 0) {
        badge_element.classList.add('d-none');
    }
    // update total price:
    calculateTotalPrice();
}

calculateTotalPrice = () => {
    let table_element = document.getElementById('cart-table');
    let table_rows = table_element.rows;
    
    if (table_rows.length > 2) {
        let totalPrice = 0;
        for (let i = 2; i < table_rows.length; i++) {
            // console.log(table_rows[i].cells[3].innerHTML);
            totalPrice += parseFloat(table_rows[i].cells[3].innerHTML, 10);
        }
        document.getElementById('price-value').innerHTML = totalPrice.toFixed(2);
    }
    else {
        document.getElementById('price-value').innerHTML = 0;
    }
}

// Custom Paypal Button:
initPayPalButton = () => {
    paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'gold',
            layout: 'horizontal',
            label: 'checkout',
            height: 37,
            
        },

        createOrder: function(data, actions) {
            let value = document.getElementById('price-value').innerHTML;
            console.log('Value in paypal: ', value);

            return actions.order.create({
                purchase_units: [{
                    "amount":{
                        "currency_code": "USD",
                        "value": parseFloat(value),
                        }
                    }]
            });
        },

        onApprove: function(data, actions) {
                return actions.order.capture().then(function(orderData) {
                
                    // Full available details
                    console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));

                    // Show a success message within this page, e.g.
                    const element = document.getElementById('paypal-button-container');
                    element.innerHTML = '';
                    element.innerHTML = '<h3>Thank you for your payment!</h3>';

                    // Or go to another URL:  actions.redirect('thank_you.html');
                
                });
        },

        onError: function(err) {
            console.log(err);
        }
    }).render('#paypal-button-container');
}
initPayPalButton();

// Login
toggleVisibility = (ele) => {
    // console.log($(ele).children("i"));
    if ($(ele).children("i").hasClass("fa-eye")) {
        $(ele).children("i").removeClass("fa-eye");
        $(ele).children("i").addClass("fa-eye-slash");
        // $("input[name='password']").attr("type", "text");
        $(ele).parent().find("input[name='password']").attr("type", "text");
    }
    else {
        $(ele).children("i").removeClass("fa-eye-slash");
        $(ele).children("i").addClass("fa-eye");
        // $("input[name='password']").attr("type", "password");
        $(ele).parent().find("input[name='password']").attr("type", "password");
    }
}

// Star rating
let stars = Array.from(document.querySelectorAll('.rating li.star > i'));
let isClick = false;
stars.forEach(item => {
    item.addEventListener('mouseover', handleHoverStar);
    item.addEventListener('mouseout', handleHoverOutStar);
    item.addEventListener('click', handleClickStar);
});

function handleHoverStar(e) {
    i = stars.indexOf(e.target);
    if (e.target.classList.contains('fa-star-o') && isClick == false) {
        for (i; i >= 0; i--) {
            stars[i].classList.remove('fa-star-o');
            stars[i].classList.add('fa-star');
        }    
    }
    // else {
    //     for (i; i <= stars.length; i++) {
    //         stars[i].classList.remove('fa-star');
    //         stars[i].classList.add('fa-star-o');
    //     }
    // }
}

function handleHoverOutStar(e) {
    i = stars.indexOf(e.target);
    if (e.target.classList.contains('fa-star') && isClick == false) {
        for (i; i >= 0; i--) {
            stars[i].classList.remove('fa-star');
            stars[i].classList.add('fa-star-o');
        }    
    }
}

function handleClickStar(e) {
    isClick = true;
    let target = stars.indexOf(e.target);
    for (let i = target; i >= 0; i--) {
        stars[i].classList.remove('fa-star-o');
        stars[i].classList.add('fa-star');
    }

    try {
        // send AJAX request to update rating from user
        let rating = target + 1;
        // console.log(userId);
        // console.log(productId);
        
        const xhttp = new XMLHttpRequest();
        xhttp.onload = () => {
            console.log(this.responseText);
        }

        let query = '/rating?userId=' + userId + '&productId=' + productId + '&rating=' + rating;
        xhttp.open('POST', query, true);
        xhttp.send();

        // show message success
        let message = "You voted " + rating.toString() + " stars";
        swal("Thanks you!", message, "success");
    }
    catch(err) {
        let message = encodeURIComponent('Please login before rating our product!');
        location.replace("http://localhost:3000/login?message=" + message);
    }
}

// Cart button
let cartBtn = document.querySelector('.cart-btn');
if (cartBtn != null) {
    cartBtn.addEventListener('click', e => {
        e.target.innerHTML = 'Added to cart';
        e.target.style.backgroundColor = '#198754';
    });
}