

const db = require('../utils/db.js')
const { isEmptyOrNull, KEY_TOKEN } = require('../utils/service.js');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");

const login = async (req,res) => {
    var {username,password} = req.body;
    var message= {};
    if(isEmptyOrNull(username)){
        message.username = "The username field is required."
    }
    if(isEmptyOrNull(password)){
        message.password = "The password field is required."
    }
    if(Object.keys(message).length > 0){
        res.json({
            error: true,
            message: message
        })
        return 0;
    }
    try{
        var user = await db.query(`SELECT * FROM customer WHERE username = $1`,[username]);
        if(user.rows.length > 0){
            var passDb= user.rows[0].password;
            var isCorrect = bcrypt.compareSync(password,passDb);
            if(isCorrect){
                var user = user.rows[0];
                delete user.password; //delete column password object user
                var permission = [];
                var role = [];
                var obj = {
                    user: user,
                    permission: permission,
                    role: role,
                    token: "" //generate token jwt
                }
               
                var access_token = jwt.sign({data: {...obj}},KEY_TOKEN,{expiresIn: "1h"})
                res.json({
                    ...obj,
                    access_token: access_token
                })
                
            }else{
                res.json({
                    error: true,
                    message: "password is invalid....!"
                })
            }
        }else{
            res.json({
                error: true,
                message: "Account doesn't exist!. please goto register....!"
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: err
        })
    }
}

const getAll = (req,res) => {
    var sql = `SELECT * FROM public.customer WHERE is_active = 1 ORDER BY customer_id DESC`;
    db.query(sql,(err,result)=>{
        if(!err){
            res.json({
                message: "success.",
                data: result.rows
            })
        }else{
            res.json({
                error : true,
                message: err
            })
        }
    })
}

// const create = (req, res) => {
//     // 1. param required
//     // 2. check if it exists
//     // 3. password needs bcrypt
//     // 4. insert into two tables: customer/customer_address

//     // Implement #1 param required
//     var {
//         firstname,
//         lastname,
//         gender,
//         username,
//         password,
//         province_id,
//         address_des,
//     } = req.body;

//     var message = {}
//     if (isEmptyOrNull(username)) { message.username = "The username field is required." }
//     if (isEmptyOrNull(firstname)) { message.firstname = "The firstname field is required." }
//     if (isEmptyOrNull(lastname)) { message.lastname = "The lastname field is required." }
//     if (isEmptyOrNull(password)) { message.password = "The password field is required." }
//     if (isEmptyOrNull(province_id)) { message.province_id = "The province_id field is required." }
//     if (isEmptyOrNull(address_des)) { message.address_des = "The address_des field is required." }
//     if (isEmptyOrNull(gender)) { message.gender = "The gender field is required." }
//     if (Object.keys(message).length > 0) {
//         res.json({
//             error: true,
//             message: message
//         })
//         return false; // stop the code execution
//     }

//     // Implement #2 -> check if it exists
//     var sqlFind = "SELECT * FROM customer WHERE username = $1";
//     db.query(sqlFind, [username], (err, resultFind) => {
//         if (resultFind.rows.length > 0) {
//             res.json({
//                 error: true,
//                 message: "Account already exists"
//             })
//             return false;
//         } else {
//             // Implement #3 -> password needs bcrypt
//             var bcryptPassword = bcrypt.hashSync(password, 10);

//             // Implement #4 -> insert into two tables: customer and customer_address
//             var sqlCustomer = `INSERT INTO customer (firstname, lastname, gender, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
//             var paramCustomer = [firstname, lastname, gender, username, bcryptPassword];
//             db.query(sqlCustomer, paramCustomer, (err1, result1) => {
//                 console.log(err1)
//                 if (!err1) {
                
//                     const customerId = result1.rows[0].customer_id; // Extract the customer_id from the result

//                     // Continue to insert into the customer_address table
//                     var sqlCustomerAdd = `INSERT INTO customer_address (customer_id, province_id, firstname, lastname, tel, address_des) VALUES ($1, $2, $3, $4, $5,$6)`;
//                     var paramCustomerAdd = [customerId, province_id, firstname, lastname,username, address_des];
//                     db.query(sqlCustomerAdd, paramCustomerAdd, (err2, result2) => {
//                         console.log(err2)
//                         if (!err2) {
//                             res.json({
//                                 message: "Account created successfully!"
//                             })
//                         } else {
//                             res.json({
//                                 error: true,
//                                 message: err2
//                             })
//                         }
//                     })
//                 } else {
//                     res.json({
//                         error: true,
//                         message: err1
//                     })
//                 }
//             })
//         }
//     })
// }

const create = async (req, res) => {
    const {
        firstname,
        lastname,
        gender,
        username,
        password,
        province_id,
        address_des,
    } = req.body;

    const message = {};
    const requiredFields = ['username', 'firstname', 'lastname', 'password', 'province_id', 'address_des', 'gender'];

    requiredFields.forEach(field => {
        if (!req.body[field]) {
            message[field] = `The ${field} field is required.`;
        }
    });

    if (Object.keys(message).length > 0) {
        return res.json({ error: true, message });
    }

    const sqlFind = "SELECT * FROM customer WHERE username = $1";
    
    try {
        const resultFind = await db.query(sqlFind, [username]);

        if (resultFind.rows.length > 0) {
            return res.json({ error: true, message: "Account already exists" });
        }

        const bcryptPassword = bcrypt.hashSync(password, 10);

        await db.query('BEGIN');

        const sqlCustomer = `INSERT INTO customer (firstname, lastname, gender, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING customer_id`;
        const paramCustomer = [firstname, lastname, gender, username, bcryptPassword];
        const result1 = await db.query(sqlCustomer, paramCustomer);

        const customerId = result1.rows[0].customer_id;

        const sqlCustomerAdd = `INSERT INTO customer_address (customer_id, province_id, firstname, lastname, address_des) VALUES ($1, $2, $3, $4, $5)`;
        const paramCustomerAdd = [customerId, province_id, firstname, lastname, address_des];
        await db.query(sqlCustomerAdd, paramCustomerAdd);

        await db.query('COMMIT');
        res.json({ errCode: 200,message: "Account created successfully!" });
    } catch (error) {
        console.log(error)
        await db.query('ROLLBACK');
        return res.json({ error: true, message: error.message });
    }
};

const update = (req,res) => {
    var {
        customer_id,
        firstname,
        lastname,
        gender,
        username,
        province_id,
        address_des,
    } = req.body;

    var message = {}
    if (isEmptyOrNull(customer_id)) { message.username = "The customer_id field is required." }
    if (isEmptyOrNull(username)) { message.username = "The username field is required." }
    if (isEmptyOrNull(firstname)) { message.firstname = "The firstname field is required." }
    if (isEmptyOrNull(lastname)) { message.lastname = "The lastname field is required." }
    if (isEmptyOrNull(province_id)) { message.province_id = "The province_id field is required." }
    if (isEmptyOrNull(address_des)) { message.address_des = "The address_des field is required." }
    if (isEmptyOrNull(gender)) { message.gender = "The gender field is required." }
    if (Object.keys(message).length > 0) {
        res.json({
            error: true,
            message: message
        })
        return false; // stop the code execution
    }

    var sqlUpdate = `UPDATE customer SET firstname=$1, lastname=$2, gender=$3, username=$4 WHERE customer_id = $5`;
    var param = [firstname,lastname,gender,username,customer_id];
    db.query(sqlUpdate,param,(err,result)=>{
        if(!err){
            res.json({
                errorCode: 200,
                message: result.rowCount ? "Customer update success." : "customer_id not found in system."
            })
        }else{
            console.log(err);
            res.json({
                error: true,
                message: err
            })
        }
    })
}

const remove = (req,res) =>{
    var customer_id = req.params.id;
    var sqlDelete = "UPDATE customer SET is_active = 0 WHERE customer_id = $1";
    db.query(sqlDelete,[customer_id],(err,result)=>{
        console.log(err)
        if(!err){
            res.json({
                errorCode: 200,
                message: result.rowCount ? "Customer delete from system success." : "customer id not found in system."
            })
        }else{
            res.json({
                error: true,
                message: err
            })
        }
    })
}

const listAddress = (req, res) => {
    var { customer_id } = req.body;
    if (!customer_id) {
        return res.status(400).json({ error: true, message: "Missing customer_id in request body" });
    }

    var sql =  `SELECT * FROM customer_address WHERE customer_id = $1`;
    
    db.query(sql, [customer_id], (err, result) => {
        if (!err) {
            res.json({
                message: result.rowCount ? "Success" : "Customer ID not found in system.",
                data: result.rows
            });
        } else {
            res.status(500).json({
                error: true,
                message: "Database error occurred",
                details: err
            });
        }
    });
}
const listOneAddress = (req,res) =>{
    var customer_address_id = req.params.id;
    var sql = `SELECT * FROM customer_address WHERE customer_address_id = $1`;
    db.query(sql,[customer_address_id],(err,result)=>{
        if(!err){
            res.json({
                message: result.rowCount ? "Success" : "customer_address_id is not found in system.",
                data: result.rows
            })
        }else{
            res.json({
                error: true,
                message: err
            })
        }
    })
}

const newAddress = (req,res) => {
    var {
        customer_id,
        province_id,
        firstname,
        lastname,
        tel,
        address_des,
    } = req.body;
    var message = {};
    if(isEmptyOrNull(customer_id)){
        message.customer_id = "The customer_id field is required."
    }
    if(isEmptyOrNull(province_id)){
        message.province_id = "The province_id field is required."
    }
    if(isEmptyOrNull(firstname)){
        message.firstname = "The firstname field is required."
    }
    if(isEmptyOrNull(lastname)){
        message.lastname = "The lastname field is required."
    }
    if(isEmptyOrNull(tel)){
        message.tel = "The tel field is required."
    }
    if(isEmptyOrNull(address_des)){
        message.address_des = "The address_des field is required."
    }

    if(Object.keys(message).length > 0){
        res.json({
            error: true,
            message: message
        })
        return false;//stop code process
    }

    //insert to db 
    var sql = `INSERT INTO customer_address (customer_id,province_id,firstname,lastname,tel,address_des) VALUES ($1,$2,$3,$4,$5,$6)`;
    var params = [customer_id,province_id,firstname,lastname,tel,address_des];
    db.query(sql,params,(err,result)=>{
        console.log(err)
        if(!err){
            res.json({
                message: "Success",
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

const updateAddress = (req,res) =>{

    var {
        customer_address_id,
        province_id,
        address_des,
    } = req.body;
    var message = {};
    if(isEmptyOrNull(customer_address_id)){
        message.customer_address_id = "The customer_address_id field is required."
    }

    if(isEmptyOrNull(province_id)){
        message.province_id = "The province_id field is required."
    }
    if(isEmptyOrNull(address_des)){
        message.address_des = "The address_des field is required."
    }

    if(Object.keys(message).length > 0){
        res.json({
            error: true,
            message: message
        })
        return false;//stop code process
    }

    var sql = "UPDATE customer_address SET province_id = $1, address_des = $2 WHERE customer_address_id =$3";
    db.query(sql,[province_id,address_des,customer_address_id],(err,result)=>{
        if(!err){
            res.json({
                message: result.rowCount ? "customer_address update success." : "customer_address_id is not found in system."
            })
        }else{
            res.json({
                error: true,
                message: err
            })
        }
    })
}

const deleteAddress = (req,res) =>{
    var customer_address_id = req.params.id;
    var sql = `DELETE FROM customer_address WHERE customer_address_id = $1`;
    db.query(sql,[customer_address_id],(err,result)=>{
        console.log(err)
        if(!err){
            res.json({
                message: result.rowCount ? "customer_address_id delete from system success" : "customer_address_id is not found in system."
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
    getAll,
    create,
    update,
    remove,
    listAddress,
    listOneAddress,
    newAddress,
    updateAddress,
    deleteAddress,
    login
}