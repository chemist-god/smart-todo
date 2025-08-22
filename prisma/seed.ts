import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create achievements
    const achievements = [
        {
            name: 'First Todo',
            description: 'Create your first todo item',
            points: 10,
            type: 'TODO' as const,
            requirement: 1,
        },
        {
            name: 'Todo Master',
            description: 'Complete 10 todos',
            points: 50,
            type: 'TODO' as const,
            requirement: 10,
        },
        {
            name: 'Note Taker',
            description: 'Create your first note',
            points: 15,
            type: 'NOTE' as const,
            requirement: 1,
        },
        {
            name: 'Consistent',
            description: 'Complete todos for 7 days in a row',
            points: 100,
            type: 'STREAK' as const,
            requirement: 7,
        },
        {
            name: 'High Priority',
            description: 'Complete 5 high priority todos',
            points: 75,
            type: 'TODO' as const,
            requirement: 5,
        },
    ]

    for (const achievement of achievements) {
        await prisma.achievement.upsert({
            where: { name: achievement.name },
            update: achievement,
            create: achievement,
        })
    }

    console.log('✅ Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

