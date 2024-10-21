
const category = require('../route/category.route');
const db = require('../utils/db.js');
const {isEmptyOrNull} = require('../utils/service.js')

// const getList = (req,res) =>{
//     var sql = "SELECT * FROM category";
//     db.query(sql,(err,result)=>{
//         if(err){
//             res.json({
//                 message: err
//             })
//         }else{
//             res.json({
//                 data: result.rows
//             })
//         }
//     })
    
// }

const getList = async (req,res) =>{
    const list_category = await db.query("SELECT * FROM category");
    res.json({
        data: list_category.rows
    })
    
}

const getOne = (req,res)=>{
    const id = req.params.id;
    var sql = `SELECT * FROM category WHERE category_id = $1`;
    db.query(sql,[id],(err,result)=>{
        if(err){
            res.json({
                error: true,
                message: err
            })
        }else{
            res.json({
                message: "success...!",
                data: result.rows
            })
        }
    })
}

const create = (req,res)=>{
    const {
        name,
        parent_id,
        status,
        description
    } = req.body;
    var message = {};

    if(isEmptyOrNull(name)){
        message.name = 'The name field is required.';
    }
    if(isEmptyOrNull(status)){
        message.status = 'The status field is required.';
    }
    if(Object.keys(message).length > 0){
        res.json({
            error: true,
            message: message
        })
        return; //
    }

    var sql = `INSERT INTO category(name,parent_id,status,description) VALUES($1,$2,$3,$4)`;
    var param = [name,parent_id,status,description];
    db.query(sql,param,(err,result)=>{
        if(err){
            res.json({
                error: true,
                message: err
            })
        }else{
            res.json({
                message: "Category create success...!",
                data: result
            })
        }
    })
}

const update = (req,res) =>{
    const {
        category_id,
        name,
        parent_id,
        status,
        description
    } = req.body;
    var message = {};

    if(isEmptyOrNull(name)){
        message.name = 'The name field is required.';
    }
    if(isEmptyOrNull(status)){
        message.status = 'The status field is required.';
    }
    if(isEmptyOrNull(category_id)){
        message.status = 'The category id field is required.';
    }
    if(Object.keys(message).length > 0){
        res.json({
            error: true,
            message: message
        })
        return; //
    }
    var sql =  `UPDATE category SET name = $1,parent_id = $2, status = $3, description = $4 WHERE category_id = $5`;
    var param = [name,parent_id,status,description,category_id];
    db.query(sql,param,(err,result)=>{
        if(err){
            console.log(err)
            res.json({
                error: true,
                message: err
            })
        }else{
            res.json({
                message : result.rowCount ? "Category update in system success...!" : "Category id not found in system...!",
                data: result
            })
        }
    })
}

const remove = (req,res) =>{
    const id = req.params.id;
    const sql = `DELETE FROM category WHERE category_id = $1`;
    db.query(sql,[id],(err,result)=>{
        if(err){
            console.log('----------------')
            console.log(err)
            console.log('----------------')
            res.json({
                error: true,
                message: err
            })
        }else{
            res.json({
                message: result.rowCount ? "category delete from system success....!" : "category id not found in system....!",
                data: result
            })
        }
    })
}

module.exports = {
    getList,
    getOne,
    create,
    update,
    remove
}