/**
 * Team Management Data Seeding Script
 * Run this script to populate the database with comprehensive team management data
 */

const database = require('../services/database');
const TeamDataSeeder = require('../services/teamDataSeeder');

async function seedTeamData() {
  console.log('🚀 Starting Team Management data seeding...');
  
  try {
    // Initialize the seeder
    const seeder = new TeamDataSeeder(database);
    
    // Run comprehensive seeding
    const result = await seeder.seedTeamManagementData();
    
    console.log('✅ Team Management data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - 50 teams created across different departments');
    console.log('   - 200+ additional users created for team members');
    console.log('   - 3-8 projects per team with realistic progress');
    console.log('   - 2-5 invitations per team with various statuses');
    console.log('   - 90 days of analytics data for each team');
    console.log('   - 30 days of collaboration metrics');
    console.log('   - 3-6 workflow optimizations per team');
    console.log('   - Skills and mentorship relationships');
    console.log('   - 12 months of KPI metrics');
    
    return result;
    
  } catch (error) {
    console.error('❌ Team data seeding failed:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTeamData()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedTeamData };