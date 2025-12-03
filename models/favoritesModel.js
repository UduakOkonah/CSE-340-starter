const pool = require('../database/');

async function getFavoritesByAccount(account_id) {
  try {
    const sql = `
      SELECT f.favorite_id, i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price
      FROM favorites AS f
      JOIN inventory AS i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
      ORDER BY f.created_at DESC
    `;
    const data = await pool.query(sql, [account_id]);
    return data.rows;
  } catch (error) {
    console.error("getFavoritesByAccount error", error);
    throw error;
  }
}

async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING favorite_id
    `;
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("addFavorite error", error);
    throw error;
  }
}

async function isFavorite(account_id, inv_id) {
  const sql = `SELECT 1 FROM favorites WHERE account_id = $1 AND inv_id = $2`;
  const data = await pool.query(sql, [account_id, inv_id]);
  return data.rowCount > 0;
}

async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2`;
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rowCount;
  } catch (error) {
    console.error("removeFavorite error", error);
    throw error;
  }
}

module.exports = {
  getFavoritesByAccount,
  addFavorite,
  removeFavorite,
  isFavorite,
};
