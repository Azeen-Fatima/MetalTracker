const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL is not set. Copy your Supabase connection string into backend/.env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
    console.error('Unexpected Postgres pool error:', err.message);
});

function toPgQuery(sql, params = []) {
    const flatParams = [];
    let paramIndex = 0;

    const pgSql = sql.replace(/\?/g, () => {
        const value = params[paramIndex++];
        if (Array.isArray(value)) {
            const placeholders = value.map((v) => {
                flatParams.push(v);
                return `$${flatParams.length}`;
            });
            return placeholders.join(', ');
        }
        flatParams.push(value);
        return `$${flatParams.length}`;
    });

    return { pgSql, flatParams };
}

async function run(sql, params = []) {
    const { pgSql, flatParams } = toPgQuery(sql, params);
    const trimmedUpper = pgSql.trim().toUpperCase();

    if (trimmedUpper.startsWith('SELECT')) {
        const result = await pool.query(pgSql, flatParams);
        return [result.rows, result.fields];
    }

    if (trimmedUpper.startsWith('INSERT') && !/RETURNING/i.test(pgSql)) {
        const result = await pool.query(`${pgSql} RETURNING id`, flatParams);
        const insertId = result.rows[0] ? result.rows[0].id : undefined;
        return [{ insertId, affectedRows: result.rowCount, rows: result.rows }, undefined];
    }

    const result = await pool.query(pgSql, flatParams);
    return [{ affectedRows: result.rowCount, rows: result.rows }, undefined];
}

module.exports = {
    execute: run,
    query: run
};
