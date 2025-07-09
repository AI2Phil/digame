const Database = require('better-sqlite3');
const path = require('path');
const ReportingDataSeeder = require('../services/reportingDataSeeder');

async function seedReportingData() {
  console.log('🚀 Starting Advanced Reporting data seeding...');
  
  try {
    // Initialize database connection
    const dbPath = path.join(__dirname, '../../database.sqlite');
    const db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize seeder
    const seeder = new ReportingDataSeeder(db);
    
    // Seed comprehensive reporting data
    const result = await seeder.seedReportingData();
    
    console.log('✅ Advanced Reporting data seeding completed successfully!');
    console.log(`📊 Result: ${result.message}`);
    
    // Close database connection
    db.close();
    
    return result;
  } catch (error) {
    console.error('❌ Error during Advanced Reporting data seeding:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedReportingData()
    .then(() => {
      console.log('🎉 Advanced Reporting data seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Advanced Reporting data seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedReportingData;