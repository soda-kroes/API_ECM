const { KEY_TOKEN } = require("../utils/service");
const jwt = require("jsonwebtoken");
const db = require("../utils/db");

const userGuardWithParam = (param) => {
  return (req, res, next) => {
    var authorization = req.headers.authorization; //token from client
    var token_from_client = null;
    // console.log(authorization)
    if (authorization != null && authorization != "") {
      token_from_client = authorization.split(" ");
      token_from_client = token_from_client[1];
    //   console.log(token_from_client)
    }
    if (token_from_client == null || token_from_client == "") {
      res.status(401).send({
        message: "Unauthorize",
      });
    } else {
      jwt.verify(token_from_client, KEY_TOKEN, (err, result) => {
        if (err) {
          res.status(401).send({
            message: "Unauthorize",
            error: err,
          });
        } else {
          //check permission
           var permisson = result.data.permission //get permisson from token
         
          if(permisson.includes(param)){
            req.user = result.data; //write user properties
            req.user_id = result.data.user.customer_id;
            next();
          }else{
            res.status(401).send({
                message: "Unauthorize",
                error: true,
            })
          }
        }
      });
    }

    return token_from_client;
  };
};

const userGuard = (req, res, next) => {
  //get access token from client
  var authorization = req.headers.authorization; //token from client
  var token_from_client = null;
  if (authorization != null && authorization != "") {
    token_from_client = authorization.split(" ");
    token_from_client = token_from_client[1];
  }
  if (token_from_client == null || token_from_client == "") {
    res.status(401).send({
      message: "Unauthorize",
    });
  } else {
    jwt.verify(token_from_client, KEY_TOKEN, (err, result) => {
      if (err) {
        res.status(401).send({
          message: "Unauthorize",
          error: err,
        });
      } else {
        //check permission
        var permisson = result.data.permisson; //get permisson from token
        req.user = result.data; //write user properties
        req.user_id = result.data.user.customer_id;
        next();
      }
    });
  }

  return token_from_client;
};

const getRoleUser = async (id) => {
  var sql = `SELECT rol.name FROM public.employee emp
               INNER JOIN public."role" rol ON(emp.role_id = rol.role_id)
               INNER JOIN public.role_permission rp ON(rol.role_id = rp.role_id)
               INNER JOIN public.permission per ON(rp.permission_id = per.permission_id) WHERE emp.employee_id = $1`;
  try {
    var list = await db.query(sql, [id]);
    // console.log(list)
    return list;
  } catch (e) {
    console.log(e);
    res.json({
      error: true,
      message: e,
    });
  }
};
const getPermissionUser = async (id) => {
  var sql = `SELECT per.code FROM public.employee emp
               INNER JOIN public."role" rol ON(emp.role_id = rol.role_id)
               INNER JOIN public.role_permission rp ON(rol.role_id = rp.role_id)
               INNER JOIN public.permission per ON(rp.permission_id = per.permission_id) WHERE emp.employee_id = $1`;
  try {
    var list = await db.query(sql, [id]);
    var tmpArr = [];
    //     list.rows.forEach((element) => {
    //         console.log(element)
    //         tmpArr.push(element);
    //     }
    // );
    list.rows.map((item, index) => {
      tmpArr.push(item.code);
    });

    return tmpArr;
  } catch (err) {
    console.log(err);
    res.json({
      error: true,
      message: err,
    });
  }
};
module.exports = {
  userGuard,
  getPermissionUser,
  getRoleUser,
  userGuardWithParam
};
