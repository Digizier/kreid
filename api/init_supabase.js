/**
 * KREID COUTURE — Supabase Database Initialization Script
 * Connects via pooler to initialize tables and RLS policies.
 */

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

async function main() {
  console.log('🔌 Connecting to Supabase Postgres database...');
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // 1. Create Tables
    console.log('🛠️ Creating tables...');

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        model TEXT,
        category TEXT NOT NULL,
        color TEXT,
        "colorVariants" JSONB DEFAULT '[]'::jsonb,
        material TEXT,
        condition TEXT,
        price NUMERIC NOT NULL,
        "originalPrice" NUMERIC,
        "isFlashSale" BOOLEAN DEFAULT false,
        "discountPercent" NUMERIC,
        stock INTEGER NOT NULL DEFAULT 0,
        badge TEXT,
        images JSONB NOT NULL DEFAULT '[]'::jsonb,
        sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
        description TEXT,
        features JSONB DEFAULT '[]'::jsonb,
        "inStock" BOOLEAN NOT NULL DEFAULT true,
        rating NUMERIC DEFAULT 5.0,
        "reviewCount" INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('   - Table "products" ready.');

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        "trackingNo" TEXT NOT NULL,
        "customerName" TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        courier TEXT NOT NULL,
        "paymentMethod" TEXT NOT NULL,
        "paymentProof" TEXT,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        subtotal NUMERIC NOT NULL,
        discount NUMERIC NOT NULL DEFAULT 0,
        "shippingFee" NUMERIC NOT NULL DEFAULT 0,
        total NUMERIC NOT NULL,
        status TEXT NOT NULL DEFAULT 'Processing',
        timestamp BIGINT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('   - Table "orders" ready.');

    // Coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        "discountPercent" NUMERIC NOT NULL DEFAULT 0,
        "minSpend" NUMERIC NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "freeShipping" BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('   - Table "coupons" ready.');

    // Configs table (for storing paymentSettings, whatsappConfig, emailConfig, etc.)
    await client.query(`
      CREATE TABLE IF NOT EXISTS configs (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('   - Table "configs" ready.');

    // City rates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS city_rates (
        city TEXT PRIMARY KEY,
        rate NUMERIC NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('   - Table "city_rates" ready.');

    // 2. Enable Row Level Security (RLS)
    console.log('🔒 Enabling Row Level Security (RLS)...');
    await client.query('ALTER TABLE products ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE orders ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE configs ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE city_rates ENABLE ROW LEVEL SECURITY;');
    console.log('   - RLS enabled on all tables.');

    // 3. Setup RLS Policies for the "anon" role (so storefront can read/insert where needed)
    console.log('📜 Configuring RLS policies for anonymous (storefront) access...');

    // Products Policies
    await client.query('DROP POLICY IF EXISTS "Allow public read access on products" ON products;');
    await client.query('CREATE POLICY "Allow public read access on products" ON products FOR SELECT TO anon USING (true);');

    // Orders Policies
    await client.query('DROP POLICY IF EXISTS "Allow public read access on orders" ON orders;');
    await client.query('DROP POLICY IF EXISTS "Allow public insert access on orders" ON orders;');
    await client.query('CREATE POLICY "Allow public read access on orders" ON orders FOR SELECT TO anon USING (true);');
    await client.query('CREATE POLICY "Allow public insert access on orders" ON orders FOR INSERT TO anon WITH CHECK (true);');

    // Coupons Policies
    await client.query('DROP POLICY IF EXISTS "Allow public read access on coupons" ON coupons;');
    await client.query('CREATE POLICY "Allow public read access on coupons" ON coupons FOR SELECT TO anon USING (true);');

    // Configs Policies
    await client.query('DROP POLICY IF EXISTS "Allow public read access on configs" ON configs;');
    await client.query('CREATE POLICY "Allow public read access on configs" ON configs FOR SELECT TO anon USING (true);');

    // City Rates Policies
    await client.query('DROP POLICY IF EXISTS "Allow public read access on city_rates" ON city_rates;');
    await client.query('CREATE POLICY "Allow public read access on city_rates" ON city_rates FOR SELECT TO anon USING (true);');

    console.log('   - RLS Policies successfully configured.');
    console.log('🎉 Database initialization complete!');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

main();
