
const db = require('../utils/db');

const getAll = async (req,res) => {
    var sqlQuery = `SELECT * FROM payment_method`;
    var list = await db.query(sqlQuery);
    res.json({
        data: list.rows
    })

}
const create = (req,res) => {
    var {
        name,
        code
    } = req.body;
    var sqlQuery = `INSERT INTO payment_method (name,code) VALUES ($1,$2)`;
    db.query(sqlQuery,[name,code],(err,result)=>{
        if(!err){
            res.json({
                message: 'payment_method added...!'
            })
        }else{
            res.json({
                error: true,
                message_detail: err
            })
        }
    })

}
const remove = (req,res) => {
    var payment_method_id = req.params.id;
    var sqlQuery = 'DELETE FROM payment_method WHERE payment_method_id = $1';
    db.query(sqlQuery,[payment_method_id],(err,result)=>{
        if(!err){
            res.json({
                message: result.rowCount ? 'payment_method delete success.' : 'payment_method_id is not found in system.'
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