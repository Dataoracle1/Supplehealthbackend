/**
 * One-time script to backfill slugs on existing products
 * Run with: node migrateslugs.js
 * Delete this file after running it
 */

require('dotenv').config();
const mongoose = require('mongoose');

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function migrateSlugs() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Product = require('./src/models/Product');

  const products = await Product.find({ slug: { $exists: false } });
  console.log(`Found ${products.length} products without slugs`);

  for (const product of products) {
    let baseSlug = generateSlug(product.name);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await Product.exists({ slug, _id: { $ne: product._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    await Product.updateOne({ _id: product._id }, { $set: { slug } });
    console.log(`✅ "${product.name}" → "${slug}"`);
  }

  console.log('\nMigration complete! You can delete this file now.');
  await mongoose.disconnect();
}

migrateSlugs().catch(console.error);