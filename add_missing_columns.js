const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.aweqcuytubnlkjwvvxgb',
  password: process.env.DB_PASSWORD || 'YOUR_DATABASE_PASSWORD',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected! Adding missing columns to "products" table...');

    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "colorVariants" JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS condition TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "isFlashSale" BOOLEAN DEFAULT false;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "discountPercent" NUMERIC;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
    `);

    console.log('✅ Columns added successfully!');
  } catch (err) {
    console.error('❌ Failed to add columns:', err);
  } finally {
    await client.end();
  }
}

run();
