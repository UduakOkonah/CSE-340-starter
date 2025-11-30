const pool = require("../database/")

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql = `
      INSERT INTO account (
        account_firstname, 
        account_lastname, 
        account_email, 
        account_password, 
        account_type
      )
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *
    `
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount   // 0 = ok, 1 = exists
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function updatePassword(account_id, hashedPassword) {
  const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2`;
  return await pool.query(sql, [hashedPassword, account_id]);
}

// Get account by ID
async function getAccountById(account_id) {
  const sql = `SELECT * FROM public.account WHERE account_id = $1`;
  const result = await pool.query(sql, [account_id]);
  return result.rows[0];
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, updatePassword, getAccountById  }
