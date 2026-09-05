import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old records...');
  await prisma.retrospective.deleteMany();
  await prisma.shoppingItem.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.task.deleteMany();
  await prisma.timelineItem.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding initial host user...');
  const hostUser = await prisma.user.create({
    data: {
      id: 'host-1',
      email: 'host@gathercraft.app',
      name: 'Alex Rivera (Host)',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop',
    },
  });

  console.log('Seeding sample events...');
  const cocktailParty = await prisma.event.create({
    data: {
      id: 'sample-cocktail-party',
      inviteToken: 'sample-cocktail-party',
      title: 'Friday Sunset Cocktails & Bites',
      ownerId: hostUser.id,
      templateId: 'cocktail-party',
      status: 'planning',
      rawPurpose: 'Host a fun cocktail gathering to introduce friends from different circles.',
      purposeStatement:
        'To bring together 15 friends from tech, design, and music for high-energy conversations, introducing people who should know each other.',
      isPurposePrivate: false,
      date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      startTime: '18:30',
      endTime: '20:30',
      timezone: 'America/Los_Angeles',
      locationName: 'Host Penthouse Terrace',
      address: '742 Evergreen Terrace, San Francisco, CA',
      locationNotes: 'Ring bell #4B. Elevator to top floor.',
      isLocationTBD: false,
      capacity: 16,
      totalBudget: 200,
      currency: 'USD',
      coverAssetUrl:
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
      themeColor: 'from-amber-500 to-rose-600',
      guests: {
        create: [
          {
            id: 'guest-1',
            name: 'Alex Rivera',
            email: 'alex@example.com',
            phone: '+1 415-555-0192',
            role: 'co-host',
            rsvpStatus: 'yes',
            plusOnesAllowed: 1,
            plusOnesActual: 1,
            dietary: 'Vegetarian',
            notes: 'Bringing signature mezcal bottle',
            updatedAt: new Date(),
          },
          {
            id: 'guest-2',
            name: 'Sarah Chen',
            email: 'sarah.c@example.com',
            role: 'guest',
            rsvpStatus: 'yes',
            plusOnesAllowed: 0,
            plusOnesActual: 0,
            dietary: 'Gluten-Free',
            notes: 'Introduced by Alex',
            updatedAt: new Date(),
          },
          {
            id: 'guest-3',
            name: 'Marcus Vance',
            email: 'marcus@example.com',
            role: 'guest',
            rsvpStatus: 'maybe',
            plusOnesAllowed: 1,
            plusOnesActual: 0,
            dietary: 'None',
            updatedAt: new Date(),
          },
          {
            id: 'guest-4',
            name: 'Elena Rostova',
            email: 'elena@example.com',
            role: 'guest',
            rsvpStatus: 'no',
            plusOnesAllowed: 0,
            plusOnesActual: 0,
            dietary: 'Nut allergy',
            updatedAt: new Date(),
          },
        ],
      },
      timeline: {
        create: [
          {
            id: 'time-1',
            title: 'Welcome Guests & First Pour',
            description: 'Greet guests, offer signature cocktail or infused mocktail, hand out nametag prompts.',
            offsetMinutes: 0,
            durationMinutes: 30,
            isCompleted: false,
            assigneeName: 'Host (You)',
            order: 1,
            updatedAt: new Date(),
          },
          {
            id: 'time-2',
            title: 'Interactive Icebreaker Round',
            description: 'Pair up people who do not know each other; 5-minute speed questions.',
            offsetMinutes: 30,
            durationMinutes: 45,
            isCompleted: false,
            assigneeName: 'Alex Rivera',
            order: 2,
            updatedAt: new Date(),
          },
          {
            id: 'time-3',
            title: 'Last Call & Group Toast',
            description: 'Host toast thanking everyone; take group photo while energy is high.',
            offsetMinutes: 105,
            durationMinutes: 15,
            isCompleted: false,
            assigneeName: 'Host (You)',
            order: 3,
            updatedAt: new Date(),
          },
        ],
      },
      tasks: {
        create: [
          {
            id: 'task-1',
            title: 'Buy fresh mint, limes & tonic water',
            category: 'Drinks',
            priority: 'high',
            status: 'todo',
            updatedAt: new Date(),
          },
          {
            id: 'task-2',
            title: 'Create upbeat background music playlist (120 BPM)',
            category: 'Atmosphere',
            priority: 'medium',
            status: 'done',
            updatedAt: new Date(),
          },
          {
            id: 'task-3',
            title: 'Set up glass recycling & coat drop area',
            category: 'Setup',
            priority: 'low',
            status: 'todo',
            updatedAt: new Date(),
          },
        ],
      },
      budget: {
        create: [
          {
            id: 'bud-1',
            name: 'Mezcal & Tequila Bottles',
            category: 'Beverages',
            plannedAmount: 90,
            actualAmount: 85,
            updatedAt: new Date(),
          },
          {
            id: 'bud-2',
            name: 'Artisanal Cheeses & Baguette',
            category: 'Food',
            plannedAmount: 60,
            actualAmount: 65,
            updatedAt: new Date(),
          },
          {
            id: 'bud-3',
            name: 'Fresh Citrus, Herbs & Ice Bags',
            category: 'Supplies',
            plannedAmount: 30,
            actualAmount: 28,
            updatedAt: new Date(),
          },
        ],
      },
    },
  });

  const birthdayDinner = await prisma.event.create({
    data: {
      id: 'sample-birthday-dinner',
      inviteToken: 'sample-birthday-dinner',
      title: "Maya's 30th Milestone Birthday Dinner",
      ownerId: hostUser.id,
      templateId: 'birthday-dinner',
      status: 'completed',
      rawPurpose: 'Celebrate Maya turning 30 with intimate storytelling and great food.',
      purposeStatement:
        "To honor Maya's 30th birthday with 10 close friends sharing personal stories, gratitude, and a gourmet 3-course dinner.",
      isPurposePrivate: false,
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      startTime: '19:00',
      endTime: '22:00',
      timezone: 'America/Los_Angeles',
      locationName: 'Private Dining Room - Osteria Bella',
      address: '1288 Mission St, San Francisco, CA',
      locationNotes: 'Reservation under Maya Lin.',
      isLocationTBD: false,
      capacity: 12,
      totalBudget: 450,
      currency: 'USD',
      coverAssetUrl:
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
      themeColor: 'from-violet-600 to-indigo-600',
      retrospective: {
        create: {
          rating: 5,
          whatWorked:
            'The toast round during dessert was incredible — everyone shared heartfelt memories. Food was served right on time.',
          whatToImprove: 'Set up background music playlist earlier before guests arrive.',
          completedAt: new Date(Date.now() - 3 * 86400000),
        },
      },
    },
  });

  console.log('Database seeded successfully:');
  console.log(`- Created event: ${cocktailParty.title} (${cocktailParty.id})`);
  console.log(`- Created event: ${birthdayDinner.title} (${birthdayDinner.id})`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
