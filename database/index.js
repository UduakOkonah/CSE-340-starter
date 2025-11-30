const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * In development (local), we typically don't use SSL.
 * In production (Render), SSL is required.
 * This if-else determines which one to use.
 * *************** */

let pool

// Production (Render or any non-development environment)
if (process.env.NODE_ENV !== "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  module.exports = pool

} else {
  // Local development
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  // Development: log SQL queries
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    },
  }
}
