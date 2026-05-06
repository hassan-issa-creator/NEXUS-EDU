// Seed Million Profiles for existing users
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMillionProfiles() {
    console.log('🌱 Seeding Million Profiles...');

    try {
        // Get all users with STUDENT role
        const users = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: { id: true, name: true }
        });

        console.log(`Found ${users.length} students`);

        let created = 0;
        let skipped = 0;

        for (const user of users) {
            // Check if profile already exists
            const exists = await prisma.millionProfile.findUnique({
                where: { userId: user.id }
            });

            if (!exists) {
                await prisma.millionProfile.create({
                    data: {
                        userId: user.id,
                        displayName: user.name || `Student-${user.id.substring(0, 8)}`,
                        totalPoints: 0,
                        currentLevel: 'Beginner'
                    }
                });
                created++;
            } else {
                skipped++;
            }
        }

        console.log(`✅ Created ${created} profiles`);
        console.log(`⏭️  Skipped ${skipped} existing profiles`);
        console.log('✨ Million Profiles seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding Million Profiles:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if executed directly
if (require.main === module) {
    seedMillionProfiles()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
}

module.exports = { seedMillionProfiles };
