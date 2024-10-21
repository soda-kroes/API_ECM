const db = require("../utils/db");
const { isEmptyOrNull } = require("../utils/service");

// const getAll = async (req, res) => {
//   const { categoryId, txtSearch,productStatus } = req.query;

//   var SELECT = `SELECT p.*, c.name as category_name FROM public.product p INNER JOIN public.category c ON p.category_id = c.category_id`;
//   var WHERE = "";
//   if (categoryId && categoryId !== "") {
//     WHERE += ` p.category_id = ${categoryId}`;
//   }
//   if (txtSearch && txtSearch !== "") {
//     if (WHERE !== "") {
//       WHERE += ` AND p.barcode = '${txtSearch}'`;
//     } else {
//       WHERE += ` p.barcode = '${txtSearch}'`;
//     }
//   }
//   if (productStatus && productStatus !== "") {
//     if (WHERE !== "") {
//       WHERE += ` AND p.is_active = '${productStatus}'`;
//     } else {
//       WHERE += ` p.is_active = '${productStatus}'`;
//     }
//   }
//   if (WHERE !== "") {
//     WHERE = " WHERE" + WHERE;
//   }

//   var ORDER = ` ORDER BY p.product_id DESC`;
//   var sqlQuery = SELECT + WHERE + ORDER;

//   try {
//     var list = await db.query(sqlQuery);

//     var sqlCategory = `SELECT * FROM public.category`;
//     const category = await db.query(sqlCategory);

//     res.json({
//       list: list.rows,
//       list_category: category.rows,
//       query_param: req.query,
//     });
//   } catch (error) {
//     console.error("Error in getAll function: ", error);
//     res.status(500).json({ error: "An error occurred while fetching data." });
//   }
// };
const getListWithPagination = async (req, res) => {
  const { categoryId, txtSearch, productStatus } = req.query;
  let { page, limit } = req.query;

  // Setting default values for page and limit if not provided
  page = page ? parseInt(page, 5) : 1;
  limit = limit ? parseInt(limit, 5) : 5;

  var JOIN = `INNER JOIN public.category c ON p.category_id = c.category_id`;
  var SELECT = `SELECT p.*, c.name as category_name FROM public.product p ${JOIN}`;
  var WHERE = "";

  if (categoryId && categoryId !== "") {
    WHERE += ` p.category_id = ${categoryId}`;
  }

  if (txtSearch && txtSearch !== "") {
    if (WHERE !== "") {
      WHERE += ` AND p.barcode = '${txtSearch}'`;
    } else {
      WHERE += ` p.barcode = '${txtSearch}'`;
    }
  }

  if (productStatus && productStatus !== "") {
    if (WHERE !== "") {
      WHERE += ` AND p.is_active = '${productStatus}'`;
    } else {
      WHERE += ` p.is_active = '${productStatus}'`;
    }
  }

  if (WHERE !== "") {
    WHERE = " WHERE" + WHERE;
  }

  var ORDER = ` ORDER BY p.product_id DESC`;
  var LIMIT_OFFSET = ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
  var sqlQuery = SELECT + WHERE + ORDER + LIMIT_OFFSET;

  try {
    var list = await db.query(sqlQuery);

    var selectTotal = `SELECT COUNT(p.product_id) as total FROM public.product p ${JOIN}${WHERE}`;
    const totalRecord = await db.query(selectTotal);

    var sqlCategory = `SELECT * FROM public.category`;
    const category = await db.query(sqlCategory);

    res.json({
      list: list.rows,
      list_category: category.rows,
      query_param: req.query,
      page: page,
      limit: limit,
      total_records: totalRecord.rows[0].total,
    });
  } catch (error) {
    console.error("Error in getAll function: ", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};


const getList = async (req, res) => {
  var sqlQuery = `SELECT p.*,c.name as category_name FROM public.product p
                    INNER JOIN public.category c
                    ON p.category_id = c.category_id ORDER BY p.product_id DESC;`;
  var list = await db.query(sqlQuery);
  var sqlCategory = `SELECT * FROM category`;
  const category = await db.query(sqlCategory);
  res.json({
    list: list.rows,
    list_category: category.rows,
  });
};

const getOne = async (req,res) => {
  try{
    const {product_id} = req.body;
    var sql = `SELECT * FROM public.product WHERE product_id = $1`;
    var list = await db.query(sql,[product_id]);
    res.json({
      list: list.rows
    })
  }catch(e){
    console.log(e)
  }
}

const create = (req, res) => {
  var { category_id, barcode, name, quantity, price, image, description } =
    req.body;
  var message = {};
  if (isEmptyOrNull(category_id)) {
    message.category_id = "The category_id field is required.";
  }

  if (isEmptyOrNull(name)) {
    message.name = "The name field is required.";
  }
  if (isEmptyOrNull(quantity)) {
    message.quantity = "The quantity field is required.";
  }
  if (isEmptyOrNull(price)) {
    message.price = "The price field is requried.";
  }

  if (isEmptyOrNull(description)) {
    message.description = "The description field is requried.";
  }
  if (Object.keys(message).length > 0) {
    res.json({
      error: true,
      message: message,
    });
    return false;
  }

  var sqlQuery = `INSERT INTO product(category_id,barcode,name,quantity,price,image,description) VALUES($1,$2,$3,$4,$5,$6,$7)`;
  var params = [
    category_id,
    barcode,
    name,
    quantity,
    price,
    image,
    description,
  ];

  db.query(sqlQuery, params, (err, result) => {
    if (!err) {
      res.json({
        message: "Product insert success.",
      });
    } else {
      res.json({
        error: true,
        message: err,
      });
    }
  });
};
const update = (req, res) => {
  var {
    product_id,
    category_id,
    barcode,
    name,
    quantity,
    price,
    image,
    description,
  } = req.body;
  var message = {};

  if (isEmptyOrNull(product_id)) {
    message.product_id = "The product_id field is required.";
  }
  if (isEmptyOrNull(category_id)) {
    message.category_id = "The category_id field is required.";
  }

  if (isEmptyOrNull(name)) {
    message.name = "The name field is required.";
  }
  if (isEmptyOrNull(quantity)) {
    message.quantity = "The quantity field is required.";
  }
  if (isEmptyOrNull(price)) {
    message.price = "The price field is requried.";
  }

  if (isEmptyOrNull(description)) {
    message.description = "The description field is requried.";
  }
  if (Object.keys(message).length > 0) {
    res.json({
      error: true,
      message: message,
    });
    return false;
  }

  var sqlQuery = `UPDATE product SET category_id=$1, barcode=$2, name=$3, quantity=$4, price=$5, image=$6, description=$7 WHERE product_id=$8`;
  var params = [
    category_id,
    barcode,
    name,
    quantity,
    price,
    image,
    description,
    product_id,
  ];
  db.query(sqlQuery, params, (err, result) => {
    if (!err) {
      res.json({
        message: result.rowCount
          ? "product update success."
          : "product_id not found in system.",
      });
    } else {
      res.json({
        error: true,
        message: err,
      });
    }
  });
};

const remove = (req, res) => {
  var { product_id } = req.body;
  var sqlQuery = `DELETE FROM product WHERE product_id = $1`;
  db.query(sqlQuery, [product_id], (err, result) => {
    if (!err) {
      res.json({
        message: result.rowCount
          ? "product delete from system success."
          : "product_id not found in system.",
      });
    } else {
      res.json({
        error: true,
        message: err,
      });
    }
  });
};

module.exports = {
  getListWithPagination,
  create,
  update,
  remove,
  getOne
};
