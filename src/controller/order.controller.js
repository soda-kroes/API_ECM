const order = require("../route/order.route");
const db = require("../utils/db");
const { isEmptyOrNull, invoiceNumber } = require("../utils/service");

const generateInvoiceNo = async () => {
  const data = await db.query(
    `SELECT MAX (order_id) AS id FROM public."order"`
  );
  return invoiceNumber(data.rows[0].id);
};

const getAll = async (req, res) => {
  var sql = `SELECT * FROM public."order"`;
  var list = await db.query(sql);

  res.json({
    list: list.rows,
  });
};

const getOne = async (req, res) => {
  var list = await db.query(
    `SELECT * FROM public."order" WHERE order_id = $1`,
    [req.params.id]
  );
  res.json({
    list: list.rows,
  });
};

const getOrderByCustomer = async (req, res) => {
  const { customer_id } = req.body;
  var list = await db.query(
    `SELECT * FROM public."order" WHERE customer_id = $1`,
    customer_id
  );
  res.json({
    list: list.rows,
  });
};

const create = async (req, res) => {
  try {
    db.query("BEGIN");
    const { customer_id, customer_address_id, payment_method_id, comment } =
      req.body;

    const order_status_id = 1;
    const invoice_no = "";

    var message = {};
    if (isEmptyOrNull(customer_id)) {
      message.customer_id = "The customer_id field is required.";
    }
    if (isEmptyOrNull(customer_address_id)) {
      message.customer_address_id =
        "The customer_address_id field is required.";
    }
    if (isEmptyOrNull(payment_method_id)) {
      message.payment_method_id = "The payment_method_id field is requried.";
    }
    if (isEmptyOrNull(comment)) {
      message.comment = "The comment field is required.";
    }
    if (Object.keys(message).length > 0) {
      res.json({
        error: true,
        message: message,
      });
      return 0;
    }

    //find customer_address info by customer_address_id(from client)
    var address = await db.query(
      `SELECT * FROM customer_address WHERE customer_address_id = $1`,
      [customer_address_id]
    );

    if (address.rows?.length > 0) {
      const { firstname, lastname, tel, address_des } = address.rows[0];
      var cart = await db.query(
        `SELECT c.*, p.price FROM cart c INNER JOIN product p ON c.product_id = p.product_id WHERE customer_id = $1`,
        [customer_id]
      );

      if (cart.rows.length == 0) {
        res.json({
          message:
            "You don't have product in cart, plase add product into your cart, thanks....!",
        });
        return false;
      }
      //find total amount
      var order_total = 0;
      cart.rows.map((item, index) => {
        order_total += item.quantity * item.price;
      });

      //insert data to order
      var orderStatusID = 1;
      var inv_no = await generateInvoiceNo();
      var sqlOrder = `INSERT INTO public."order" `;
      sqlOrder += `(customer_id, payment_method_id,order_status_id,invoice_no, comment, order_total, firstname, lastname, telephone, address_des) `;
      sqlOrder += `VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING order_id`;
      var paramsOrder = [
        customer_id,
        payment_method_id,
        orderStatusID,
        inv_no,
        comment,
        order_total,
        firstname,
        lastname,
        tel,
        address_des,
      ];
      var order_id = "";
      try {
        const order = await db.query(sqlOrder, paramsOrder);
        order_id = order.rows[0].order_id;
      } catch (err) {
        console.log(err);
        res.json({
          error: true,
          message_details: err,
        });
        return 0;
      }

      //insert order detail
      cart.rows.map(async (item, index) => {
        var sqlOrderDetail = `INSERT INTO public."order_detail" (order_id,product_id,quantity,price) VALUES($1,$2,$3,$4)`;
        var sqlOrderDetailParam = [
          order_id,
          item.product_id,
          item.quantity,
          item.price,
        ];
        const orderDetail = await db.query(sqlOrderDetail, sqlOrderDetailParam);

        //cut stock product
        var sqlProduct = `UPDATE product SET quantity = (quantity-$1) WHERE product_id = $2`;
        var updateProduct = await db.query(sqlProduct, [
          item.quantity,
          item.product_id,
        ]);
      });

      //clear cart
      await db.query(`DELETE FROM cart WHERE customer_id = $1`, [customer_id]);

      //insert to table order_detail
      db.query("COMMIT");
      res.json({
        message: "Your order has been completed...!",
      });
    } else {
      res.json({
        error: true,
        message: "Please select your address...!",
      });
    }
  } catch (e) {
    db.query("ROLLBACK");
    res.json({
      error: true,
      message_details: e,
    });
  }
};

const create_order = async (req, res) => {
    try {
    db.query("BEGIN");
  
      const {
        customer_id,
        order_status_id,
        payment_method_id,
        invoice_no,
        order_total,
        comment,
        address_des,
        status,
        is_paid,
        array_product,
        inputter_id
      } = req.body;
  
      const sqlInsertOrder = `INSERT INTO public."order" (customer_id, order_status_id, payment_method_id, invoice_no, order_total, comment, address_des, status, is_paid,inputter_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10) RETURNING order_id`;
      const paramInsertOrder = [
        customer_id,
        order_status_id,
        payment_method_id,
        invoice_no,
        order_total,
        comment,
        address_des,
        status,
        is_paid,
        inputter_id
      ];
      const data_order = await db.query(sqlInsertOrder, paramInsertOrder);

  
  
      const promises = array_product.map(async (item) => {
        const sqlInsertOrderDetail = `INSERT INTO public.order_detail (order_id, product_id, quantity, price, discount_price, total) VALUES ($1, $2, $3, $4, $5, $6)`;
        const paramInsertOrderDetail = [
          data_order.rows[0].order_id,
          item.product_id,
          item.qty,
          item.price,
          0,
          item.price * item.quantity,
        ];
        const data_order_detail = await db.query(sqlInsertOrderDetail, paramInsertOrderDetail);
  
        const sqlReStock = `UPDATE public.product SET quantity = (quantity - $1) WHERE product_id = $2`;
        const paramReStock = [item.qty, item.product_id];
        return db.query(sqlReStock, paramReStock);
      });
  
      await Promise.all(promises);
  
      db.query("COMMIT");
      res.json({
        message: "Product Order Success...!",
        data: data_order.rows[0],
      });
  
    } catch (error) {
      db.query("ROLLBACK");
      console.error(error);
      res.sendStatus(500);
    }
  };

const update = (req, res) => {};

const remove = (req, res) => {};

module.exports = {
  getAll,
  create,
  getOne,
  update,
  remove,
  getOrderByCustomer,
  create_order,
};
