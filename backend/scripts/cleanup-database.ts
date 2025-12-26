import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Step 1: Delete all child records (those with foreign keys)
    console.log('📦 Deleting wearable data...');
    const wearableDeleted = await prisma.wearableData.deleteMany({});
    console.log(`   ✅ Deleted ${wearableDeleted.count} wearable data records`);

    console.log('📊 Deleting health metrics...');
    const metricsDeleted = await prisma.healthMetric.deleteMany({});
    console.log(`   ✅ Deleted ${metricsDeleted.count} health metrics`);

    console.log('🔍 Deleting symptom analyses...');
    const symptomsDeleted = await prisma.symptomAnalysis.deleteMany({});
    console.log(`   ✅ Deleted ${symptomsDeleted.count} symptom analyses`);

    console.log('🤖 Deleting AI insights...');
    const insightsDeleted = await prisma.aIInsight.deleteMany({});
    console.log(`   ✅ Deleted ${insightsDeleted.count} AI insights`);

    console.log('⏰ Deleting reminders...');
    const remindersDeleted = await prisma.reminder.deleteMany({});
    console.log(`   ✅ Deleted ${remindersDeleted.count} reminders`);

    console.log('💊 Deleting medications...');
    const medicationsDeleted = await prisma.medication.deleteMany({});
    console.log(`   ✅ Deleted ${medicationsDeleted.count} medications`);

    console.log('📅 Deleting appointments...');
    const appointmentsDeleted = await prisma.appointment.deleteMany({});
    console.log(`   ✅ Deleted ${appointmentsDeleted.count} appointments`);

    console.log('📄 Deleting health reports...');
    const reportsDeleted = await prisma.healthReport.deleteMany({});
    console.log(`   ✅ Deleted ${reportsDeleted.count} health reports`);

    // Step 2: Delete family members
    console.log('👨‍👩‍👧 Deleting family members...');
    const membersDeleted = await prisma.familyMember.deleteMany({});
    console.log(`   ✅ Deleted ${membersDeleted.count} family members`);

    // Step 3: Optionally delete users (commented out by default)
    // Uncomment the lines below if you want to delete users too
    /*
    console.log('👤 Deleting users...');
    const usersDeleted = await prisma.user.deleteMany({});
    console.log(`   ✅ Deleted ${usersDeleted.count} users`);
    */

    console.log('\n✨ Database cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Wearable Data: ${wearableDeleted.count}`);
    console.log(`   - Health Metrics: ${metricsDeleted.count}`);
    console.log(`   - Symptom Analyses: ${symptomsDeleted.count}`);
    console.log(`   - AI Insights: ${insightsDeleted.count}`);
    console.log(`   - Reminders: ${remindersDeleted.count}`);
    console.log(`   - Medications: ${medicationsDeleted.count}`);
    console.log(`   - Appointments: ${appointmentsDeleted.count}`);
    console.log(`   - Health Reports: ${reportsDeleted.count}`);
    console.log(`   - Family Members: ${membersDeleted.count}`);
    console.log(`   - Users: Kept (not deleted)`);

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('\n✅ Cleanup script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cleanup script failed:', error);
    process.exit(1);
  });

