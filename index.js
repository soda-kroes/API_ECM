const express = require('express');
const cors = require('cors')
const app = express();
app.use(express.json()); //register response json
const port = 9091;

//allow cors origin -> (npm i cors)
app.use(cors({
    origin: "*"
}))

//import route
const category = require('./src/route/category.route');
const employee = require('./src/route/employee.route');
const customer = require('./src/route/customer.route');
const wishlist = require('./src/route/wishlist.route');
const order_status = require('./src/route/order_status.route');
const payment_method = require('./src/route/payment_method.route');
const product = require('./src/route/product.route');
const cart = require('./src/route/cart.route');
const order = require('./src/route/order.route');
const address = require('./src/route/address.route');
const pos = require('./src/route/pos.route');

//call route
category(app);
employee(app);
customer(app);
wishlist(app);
order_status(app);
payment_method(app);
product(app);
cart(app);
order(app);
address(app);
pos(app);

app.listen(port,(req,res)=>{
    console.log(`App listening on port ${port}`)
})