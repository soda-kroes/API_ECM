
const db = require('../utils/db');

const masterData = async (req,res) =>{
    var sqlCustomer = `SELECT * FROM public.customer`;
    var sqlPaymentMethod = `SELECT * FROM public.payment_method`;
    var sqlOrderStatus = `SELECT * FROM public.order_status`;

    var data_customer = await db.query(sqlCustomer);
    var data_payment_method = await db.query(sqlPaymentMethod);
    var data_order_status = await db.query(sqlOrderStatus);

    res.json({
        data_customer: data_customer.rows,
        data_payment_method: data_payment_method.rows,
        data_order_status: data_order_status.rows
    })

}

module.exports = {
    masterData
}