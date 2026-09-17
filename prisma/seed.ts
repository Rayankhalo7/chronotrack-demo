import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@chronotrack.dev";

/**
 * bcrypt hash only — plaintext demo password is documented solely in README.md.
 * Never commit the plaintext password in this file or other source.
 */
const DEMO_PASSWORD_HASH =
  "$2b$12$OOD2gAmxGcRP20fZE.l2ceY3XG2hoSwX7kWLl9hjeUAnagA1zPw82";

async function seedSampleData(userId: string) {
  const projects = await Promise.all([
    prisma.project.create({
      data: { name: "Portfolio Website", color: "#3B82F6", userId },
    }),
    prisma.project.create({
      data: { name: "Client Discovery", color: "#10B981", userId },
    }),
    prisma.project.create({
      data: { name: "Learning / Docs", color: "#F59E0B", userId },
    }),
  ]);

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
  const daysAgo = (d: number, hour = 10) => {
    const dte = new Date(now);
    dte.setDate(dte.getDate() - d);
    dte.setHours(hour, 0, 0, 0);
    return dte;
  };

  await prisma.timeEntry.createMany({
    data: [
      {
        userId,
        projectId: projects[0].id,
        startedAt: daysAgo(1, 9),
        endedAt: daysAgo(1, 11),
        note: "Landing page layout",
      },
      {
        userId,
        projectId: projects[0].id,
        startedAt: daysAgo(1, 14),
        endedAt: daysAgo(1, 16),
        note: "Responsive polish",
      },
      {
        userId,
        projectId: projects[1].id,
        startedAt: daysAgo(2, 10),
        endedAt: daysAgo(2, 12),
        note: "Stakeholder call notes",
      },
      {
        userId,
        projectId: projects[2].id,
        startedAt: daysAgo(3, 15),
        endedAt: daysAgo(3, 17),
        note: "Prisma + NextAuth notes",
      },
      {
        userId,
        projectId: projects[0].id,
        startedAt: hoursAgo(3),
        endedAt: hoursAgo(1),
        note: "Today: timer UX",
      },
      {
        userId,
        projectId: projects[1].id,
        startedAt: daysAgo(0, 8),
        endedAt: daysAgo(0, 9),
        note: "Morning planning",
      },
    ],
  });

  return projects.length;
}

async function main() {
  const reset = process.env.SEED_RESET === "true";

  if (reset) {
    await prisma.timeEntry.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  }

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Demo User",
      passwordHash: DEMO_PASSWORD_HASH,
    },
    create: {
      email: DEMO_EMAIL,
      name: "Demo User",
      passwordHash: DEMO_PASSWORD_HASH,
    },
  });

  const existingProjects = await prisma.project.count({
    where: { userId: user.id },
  });

  let projectCount = existingProjects;
  if (reset || existingProjects === 0) {
    if (!reset && existingProjects === 0) {
      projectCount = await seedSampleData(user.id);
    } else if (reset) {
      projectCount = await seedSampleData(user.id);
    }
  }

  const entryCount = await prisma.timeEntry.count({ where: { userId: user.id } });

  console.log("Seed complete:", {
    user: user.email,
    projects: projectCount,
    entries: entryCount,
    reset,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
