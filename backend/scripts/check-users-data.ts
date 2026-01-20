import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsersAndData() {
  try {
    console.log('🔍 Checking database for users and data...\n');

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        familyMembers: true,
        appointments: true,
        medications: true,
        healthReports: true,
        reminders: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Found ${users.length} user(s) in database:\n`);

    if (users.length === 0) {
      console.log('⚠️  No users found in the database!');
      console.log('💡 This means no data has been created yet, or you\'re connected to a different database.');
      return;
    }

    users.forEach((user, index) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Clerk ID: ${user.clerkId}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Created: ${user.createdAt.toLocaleString()}`);
      console.log(`  Updated: ${user.updatedAt.toLocaleString()}`);
      console.log(`\n  Data Summary:`);
      console.log(`    - Family Members: ${user.familyMembers.length}`);
      console.log(`    - Appointments: ${user.appointments.length}`);
      console.log(`    - Medications: ${user.medications.length}`);
      console.log(`    - Health Reports: ${user.healthReports.length}`);
      console.log(`    - Reminders: ${user.reminders.length}`);

      if (user.familyMembers.length > 0) {
        console.log(`\n  Family Members:`);
        user.familyMembers.forEach((member) => {
          console.log(`    - ${member.name} (${member.relationship}) - Created: ${member.createdAt.toLocaleString()}`);
        });
      }
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log('\n💡 To find your data:');
    console.log('   1. Check the Clerk IDs above');
    console.log('   2. Sign in with the Gmail account that matches the Clerk ID');
    console.log('   3. If you see data but can\'t access it, the Clerk ID might have changed');
    console.log('\n💡 If you don\'t see your data:');
    console.log('   - You might be connected to a different database');
    console.log('   - Check your DATABASE_URL in backend/.env');
    console.log('   - The data might be in a different environment (dev vs prod)');

  } catch (error: any) {
    console.error('❌ Error checking database:', error.message);
    if (error.code === 'P1001') {
      console.error('\n💡 Database connection failed!');
      console.error('   Check your DATABASE_URL in backend/.env');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkUsersAndData();
