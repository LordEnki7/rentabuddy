import { db } from "./storage";
import { users, buddyProfiles } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  // Create sample buddy users
  const buddyData = [
    {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      city: "San Francisco, CA",
      headline: "Hiking enthusiast & coffee lover",
      bio: "I love exploring nature trails and trying out new coffee shops! Always up for an adventure or a chill conversation over a good latte.",
      hourlyRate: "45",
      tags: ["Hiking", "Coffee", "Photography", "Travel"],
    },
    {
      name: "Mike Chen",
      email: "mike@example.com",
      city: "New York, NY",
      headline: "Museum guide & art history buff",
      bio: "Passionate about art and culture. I can show you around the best museums in the city or just chat about your favorite artists.",
      hourlyRate: "50",
      tags: ["Museums", "Art", "History", "Walking Tours"],
    },
    {
      name: "Emma Davis",
      email: "emma@example.com",
      city: "Austin, TX",
      headline: "Foodie & live music fan",
      bio: "Love discovering new restaurants and catching live music shows. Let's explore the local food scene or hit up a concert together!",
      hourlyRate: "40",
      tags: ["Food", "Music", "Events", "Nightlife"],
    },
  ];

  for (const buddy of buddyData) {
    // Create user
    const passwordHash = await bcrypt.hash("password123", 10);
    const [user] = await db.insert(users).values({
      email: buddy.email,
      name: buddy.name,
      passwordHash,
      role: "BUDDY",
      status: "ACTIVE",
    }).returning();

    // Create buddy profile
    await db.insert(buddyProfiles).values({
      userId: user.id,
      city: buddy.city,
      headline: buddy.headline,
      bio: buddy.bio,
      hourlyRate: buddy.hourlyRate,
      experienceYears: Math.floor(Math.random() * 5) + 1,
      tags: buddy.tags,
      languages: ["English"],
      ratingAverage: (4.5 + Math.random() * 0.5).toFixed(1),
      ratingCount: Math.floor(Math.random() * 50) + 10,
      isCertified: Math.random() > 0.5,
      codeOfConductAcceptedAt: new Date(),
      safetyProtocolAcceptedAt: new Date(),
    });

    console.log(`✓ Created buddy: ${buddy.name}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
