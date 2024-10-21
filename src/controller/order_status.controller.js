
const e = require('express');
const db = require('../utils/db.js');
const {isEmptyOrNull} = require('../utils/service.js');

const getAll =  (req,res) =>{
    var sqlQuery = `SELECT * FROM public."order _status" ORDER BY order_status_id ASC LIMIT 100`;
    db.query(sqlQuery,(err,result)=>{
        console.log(err)
        if(!err){
            res.json({
                message : "success",
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

const remove = (req,res) =>{
    var order_status_id = req.params.id;
    var sqlQuery = `DELETE FROM order_status_id WHERE order_status_id = $1`;
    db.query(sqlQuery,[order_status_id],(err,result)=>{
        if(!err){
            res.json({
                message: result.rowCount ? 'order_status delete success.' : 'order_status_id is not found in system.'
            })
        }else{
            res.json({
                error: true,
                message_detail: err
            })
        }
    })

}

const create = (req,res) =>{
    const {
        name,
        message,
        sort_order
    } = req.body;
    var msg = {};
    if(isEmptyOrNull(name)){
        msg.name = 'The name field is required.'
    }
    if(isEmptyOrNull(message)){
        msg.message = 'The message field is required.'
    }
    if(isEmptyOrNull(sort_order)){
        msg.sort_order = 'The sort_order field is required.'
    }
    if(Object.keys(msg).length > 0 ){
        res.json({
            error: true,
            msg: msg
        })
        return false;
    }

    var sqlQuery = `INSERT INTO public."order _status" (name,message,sort_order) VALUES ($1,$2,$3)`;
    db.query(sqlQuery,[name,message,sort_order],(err,result)=>{
        if(!err){
            res.json({
                message: 'order status added...!'
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
    remove
}