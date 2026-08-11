import pg from 'pg';
const { Client } = pg;
const client = new Client('postgresql://postgres:abcd%401234@10.13.34.188:5432/ggp_db');

async function test() {
  try {
    await client.connect();
    
    await client.query("ALTER TABLE goods_out_requests ADD COLUMN IF NOT EXISTS qr_code VARCHAR(255);");
    console.log("Column qr_code added successfully.");
    
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

test();
