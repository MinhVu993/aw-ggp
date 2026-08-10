import pg from 'pg';
const { Client } = pg;
const client = new Client('postgresql://postgres:abcd%401234@10.13.34.188:5432/ggp_db');

async function test() {
  try {
    await client.connect();
    
    const res = await client.query("SELECT request_id, request_no, status, current_lvl, current_step, flow_snapshot FROM goods_out_requests WHERE request_no = 'GGP-20260810-0001'");
    console.log(JSON.stringify(res.rows[0], null, 2));
    
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

test();
