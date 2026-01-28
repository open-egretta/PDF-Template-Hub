import pool from './pool.js';

// 單一查詢
export async function query(sql, params = []) {
  const start = Date.now();
  const result = await pool.query(sql, params);
  const duration = Date.now() - start;
  
  console.log('Executed query', { sql, duration, rows: result.rowCount });
  return result;
}

// 取得單筆
export async function getOne(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows[0] || null;
}

// 取得多筆
export async function getMany(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows;
}

// Transaction 輔助
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}