
const db = require('../utils/db.js');
const {isEmptyOrNull} = require('../utils/service.js');

const getAll = async (req,res) => {
    var {customer_id} = req.body;
    var sql = `SELECT * FROM wishlist WHERE customer_id = $1`;
    var list = await db.query(sql,[customer_id]);
    res.json({
        list: list.rows,
    })
    

}

const create = async (req,res) => {
    var {customer_id,product_id} = req.body;
    var sql = `INSERT INTO wishlist (customer_id,product_id) VALUES($1,$2)`;
    var data = await db.query(sql,[customer_id,product_id]);
    res.json({
        message: "product added...!"
    })
}

const update =  async (req,res) => {
    


}

const remove =  (req,res) => {
    const wishlist_id = req.params.id;
    var sqlQuery = `DELETE FROM wishlist WHERE wishlist_id = $1`;
    db.query(sqlQuery,[wishlist_id],(err,result)=>{
        if(!err){
            res.json({
                message : result.rowCount ? "product removed...!" : "wishlist_id not found in system."
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
    remove
}