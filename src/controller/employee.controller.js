
const db = require('../utils/db.js');
const { isEmptyOrNull, KEY_TOKEN, REFRESH_KEY } = require('../utils/service.js');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const { getPermissionUser, getRoleUser } = require('./auth.controller.js');

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
        var user = await db.query(`SELECT * FROM employee WHERE tel = $1`,[username]);
    
        if(user.rows.length > 0){
            var passDb= user.rows[0].password;
            var isCorrect = bcrypt.compareSync(password,passDb);
            if(isCorrect){
                var user = user.rows[0];
                delete user.password; //delete column password object user
                // var permission = [];//get for db
                var permission = await getPermissionUser(user.employee_id);
                var role = [];
                // var role = await getRoleUser(user.employee_id);
                // console.log(role.rows)
                var obj = {
                    user: user,
                    permission: permission,
                    role: role,
                    // token: "" //generate token jwt
                }
               
                var access_token = jwt.sign({data: {...obj}},KEY_TOKEN,{expiresIn: "3h"})
                var refresh_token = jwt.sign({data: {...obj}},REFRESH_KEY)
                res.json({
                    ...obj,
                    access_token: access_token,
                    refresh_token: refresh_token
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
        console.log(err)
        res.json({
            error: true,
            message: err
        })
    }
}

const setPassword = async (req,res) => {
    const {
        username,
        password
    } = req.body;
    var message = {};
    if(isEmptyOrNull(username)){
        message.username = 'The username field is required.'
    }
    if(isEmptyOrNull(password)){
        message.password = 'The password field is required.'
    }
    if(Object.keys(message).length > 0){
        res.json({
            error: true,
            message: message
        })
        return false;
    }
    try{
        var employee = await db.query(`SELECT * FROM employee WHERE tel = $1`,[username]);
        if(employee.rows.length > 0){
            const bcryptPassword = bcrypt.hashSync(password, 10);
            try{
                var updateEmployee = await db.query(`UPDATE employee SET password = $1 WHERE tel = $2`,[bcryptPassword,username]);
                res.json({
                    message: 'Set password successfully.'
                })
            }catch(e){
                res.json({
                    error: true,
                    message: e
                })
            }
        }
    }catch(err){
        console.log(err)
        res.json({
            error: true,
            message: err
        })
    }
}

const refresh_token = (req,res)=> {
    //check and verify refresh token from client
    var {refresh_token} = req.body;

    if(isEmptyOrNull(refresh_token)){
        res.status(401).send({
            message: "Unauthorize"
        })
    }else{
        jwt.verify(refresh_token,REFRESH_KEY, async (error,result)=>{
            if(error){
                res.status(401).send({
                    message: "Unauthorize",
                    error: error
                })
            }else{
                //som sit teanh yk token thmey


                var username = result.data.user.tel;
                var user = await db.query(`SELECT * FROM employee WHERE tel = $1`,[username]);

                var user = user.rows[0];
                delete user.password; //delete column password object user
                // var permission = [];//get for db
                var permission = await getPermissionUser(user.employee_id);
                var role = [];
                // var role = await getRoleUser(user.employee_id);
                // console.log(role.rows)
                var obj = {
                    user: user,
                    permission: permission,
                    role: role,
                    // token: "" //generate token jwt
                }
               
                var access_token = jwt.sign({data: {...obj}},KEY_TOKEN,{expiresIn: "30s"})
                var refresh_token = jwt.sign({data: {...obj}},REFRESH_KEY)
                res.json({
                    ...obj,
                    access_token: access_token,
                    refresh_token: refresh_token
                })
                
            }
        })
    }
}

const getList = (req,res) =>{
    const sql = "SELECT * FROM employee";
    db.query(sql,(err,result)=>{
        if(err){
            res.json({
                message: err
            })
        }else{
            res.json({
                data: result.rows
            })
        }
    })

}

const  getOneByQuery= (req,res) =>{
    const id = req.query.id;
    const sql =  `SELECT * FROM employee WHERE employee_id = $1`;
    console.log(sql);
    db.query(sql,[id],(err,result)=>{
        if(err){
            res.json({
                msg: err
            })
        }else{
            res.json({
                data: result.rows
            })
        }
    })
}


const getOneByParam = (req,res) =>{
    const id = req.params.id;
    const sql =  `SELECT * FROM employee WHERE employee_id = $1`;
    db.query(sql,[id],(err,result)=>{
        if(err){
            res.json({
                msg: err
            })
        }else{
            res.json({
                data: result.rows
            })
        }
    })
}

const create = (req,res)=>{
    const {
        firstname,
        lastname,
        tel,
        email, 
        base_salary, 
        address, 
        province, 
        country,
        role_id
    } = req.body;

    //customer not null msg
    var message = {};
    // if(firstname === null || firstname === "" || firstname === undefined){message.firstname = "firstname field is required...!"};
    // if(lastname === null || lastname === "" || lastname === undefined){message.lastname = "lastname field is required...!"};
    // if(tel === null || tel === "" || tel === undefined){message.tel = "tel field is required...!"};

    if(isEmptyOrNull(firstname)){
        message.firstname = "firstname is required...!";
    }
    if(isEmptyOrNull(lastname)){
        message.lastname = "lastname is required...!";
    }
    if(isEmptyOrNull(tel)){
        message.tel = "tel is required...!";
    }
    if(isEmptyOrNull(role_id)){
        message.role_id = "role_id is required...!";
    }

    if(Object.keys(message).length > 0){
        res.json({
            error: true,
            msg: message
        })
        return; //
    }

    const sql = `INSERT INTO public.employee(
	            firstname, lastname, tel, email, base_salary, address, province, country,role_id)
	            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`;
    const param = [firstname,lastname,tel,email,base_salary,address,province,country,role_id];
    db.query(sql,param,(err,result)=>{
        if(err){
            res.json({
                error: true,
                message: err
            })
        }else{
            res.json({
                message: 'Employee created successfully.',
                data: result
            })
        }

    })
}

const update = (req,res)=>{
    const {
        employee_id,
        firstname,
        lastname,
        tel,
        email, 
        base_salary, 
        address, 
        province, 
        country
    } = req.body;
    const sql = `UPDATE public.employee
	            SET firstname=$1, lastname=$2, tel=$3, email=$4, base_salary=$5, address=$6, province=$7, country=$8
	            WHERE employee_id = $9;`;
    const param = [firstname,lastname,tel,email,base_salary,address,province,country,employee_id];
    db.query(sql,param,(err,result)=>{
        if(err){
            res.json({
                error: true,
                message: err
            })
        }else{
            console.log(result);
            console.log(result.rowCount);
            res.json({
                message: result.rowCount? 'Employee updated successfully.': "Data not found in system....!",
                data: result
            })
        }

    })
}

const remove = (req,res)=>{
    const id = req.params.id;
    const sql = `DELETE FROM employee WHERE employee_id = $1`;
    db.query(sql,[id],(err,result)=>{
        if(err){
            res.json({
                err: true,
                message: err
            })
        }else{
             res.json({
                message: result.rowCount? 'Employee delete from system success.' : "Data not found in system...!",
                dat: result
             })
        }
    })
}

module.exports = {
    getList,
    getOneByParam,
    getOneByQuery,
    create,
    update,
    remove,
    setPassword,
    login,
    refresh_token
}

