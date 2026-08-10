import pg from 'pg';
const { Client } = pg;
const client = new Client('postgresql://postgres:abcd%401234@10.13.34.188:5432/ggp_db');

async function test() {
  try {
    await client.connect();
    
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
    console.log(res.rows);
    
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

test();
