const db = require("../utils/db.js");

const getAllProvince = async (req, res) => {
  try {
    var sql = `SELECT * FROM province`;
    var list = await db.query(sql);
    res.json({
      list: list.rows,
    });
  } catch (e) {
    console.log(e);
  }
};
module.exports = {
  getAllProvince,
};
