
const customer = require('../route/customer.route');
const product = require('../route/product.route');
const db = require('../utils/db');
const {isEmptyOrNull} = require('../utils/service');

const getCartByCustomer = async (req,res) =>{
    const {customer_id} = req.body;
    var sql = `SELECT c.cart_id, c.quantity as pro_quantity, p.* FROM cart c `;
        sql+= `INNER JOIN product p ON (c.product_id = p.product_id) WHERE c.customer_id = $1`;
        var list = await db.query(sql,[customer_id]);
        res.json({
            list: list.rows
        })
}

const addCard = (req,res) => {
    const {
        customer_id,
        product_id,
        quantity,
    } = req.body;

    var message = {};
    if(isEmptyOrNull(customer_id)){
        message.customer_id = "The customer_id field is required."
    }
    if(isEmptyOrNull(product_id)){
        message.product_id = "The product_id field is required."
    }
    if(isEmptyOrNull(quantity)){
        message.quantity = "The quantity field is required."
    }
    if(Object.keys(message).length > 0 ){
        res.json({
            error: true,
            message: message
        })
    }

    var sql = `INSERT INTO cart (customer_id,product_id,quantity) VALUES ($1,$2,$3)`;
    db.query(sql,[customer_id,product_id,quantity],(err,result)=>{
        if(!err){
            res.json({
                 message: "product insert to cart success.",
                 data: result
            })
        }else{
            res.json({
                error: true,
                message: err
            })
        }
    })
    
}

const remove = async (req,res) => {
    const {cart_id} = req.body;
    var sql = `DELETE FROM cart WHERE cart_id = $1`;
    var list = await db.query(sql,[cart_id]);
    res.json({
        message: list.rowCount ? "cart remove success." : "cart_id not found in system.",
        data: list
    })
}

const update = (req,res) => {
    const {cart_id,quantity} = req.body;
    var message = {};
    if(isEmptyOrNull(cart_id)){
        message.cart_id = "The card_id field is required."
    }
    if(isEmptyOrNull(quantity)){
        message.quantity = "The quantity field is required."
    }
    if(Object.keys(message).length > 0){
        res.json({
            error: true,
            message: message,
        })
    }
    var sql = `UPDATE cart SET quantity = $1 WHERE cart_id = $2`;
    db.query(sql,[quantity,cart_id],(err,result)=>{
        if(!err){
            res.json({
                message: result.rowCount ? "cart update success." : "cart_id not found in system.",
            })
        }else{
            res.json({
                error: true,
                message: err
            })
        }
    })

}

module.exports = {
    getCartByCustomer,
    addCard,
    remove,
    update
}