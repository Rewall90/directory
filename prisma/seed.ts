import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.courseRecord.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.nearbyCourse.deleteMany();
  await prisma.additionalFeature.deleteMany();
  await prisma.source.deleteMany();
  await prisma.phoneNumber.deleteMany();
  await prisma.courseRating.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.membershipPricing.deleteMany();
  await prisma.pricing.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.course.deleteMany();

  // Seed Course 1: Oslo Golf Club
  console.log("Creating Oslo Golf Club...");
  const osloGolf = await prisma.course.create({
    data: {
      slug: "oslo-golf-club",
      name: "Oslo Golf Club",
      addressStreet: "Bogstad",
      postalCode: "0766",
      city: "Oslo",
      municipality: "Oslo",
      region: "Østlandet",
      country: "Norway",
      latitude: 59.95,
      longitude: 10.65,
      coordinateAccuracy: "approximate",
      holes: 18,
      holesPlayed: 18,
      par: 71,
      parPerRound: 71,
      par3Count: 4,
      par4Count: 11,
      par5Count: 3,
      lengthMeters: 5842,
      lengthYards: 6390,
      terrain: "Parkland",
      courseType: "Championship",
      designer: "Jeremy Pern",
      yearBuilt: 1924,
      description:
        "Oslo Golf Club is one of Norway's most prestigious golf courses, located in beautiful parkland settings just outside the city center.",
      waterHazards: true,
      signatureHole: "Hole 15 - Par 3 over water",
      phone: "+47 22 50 44 02",
      email: "post@oslogk.no",
      website: "https://www.oslogk.no",
      seasonStart: "April",
      seasonEnd: "October",
      visitorsWelcome: true,
      walkingAllowed: true,
      mountainViews: false,
      nearbyCity: "Oslo",
      distanceFromCenter: "7 km",
      scrapedAt: new Date(),
      dataQuality: "high",
      websiteQuality: "excellent",
      completenessPercentage: 95,
      pagesScraped: 10,
      facilities: {
        create: {
          drivingRange: true,
          drivingRangeLength: 250,
          puttingGreen: true,
          chippingArea: true,
          practiceBunker: true,
          clubhouse: true,
          clubhouseName: "Oslo GK Clubhouse",
          proShop: true,
          restaurant: true,
          restaurantName: "Club Restaurant",
          clubRental: true,
          cartRental: true,
          pullCartRental: true,
          golfLessons: true,
          teachingPro: true,
          clubFitting: true,
          lockerRooms: true,
          showers: true,
          bunkers: 72,
        },
      },
      pricing: {
        create: {
          year: 2025,
          currency: "NOK",
          greenFeeWeekday: 950,
          greenFeeWeekend: 1200,
          greenFeeSenior: 750,
          greenFeeJunior: 400,
          cartRental: 300,
          pullCartRental: 100,
          clubRental: 500,
        },
      },
      membershipPricing: {
        create: [
          {
            year: 2025,
            category: "senior",
            price: 18500,
            description: "Full membership for seniors 65+",
            ageRange: "65+",
          },
          {
            year: 2025,
            category: "junior",
            price: 3500,
            description: "Junior membership",
            ageRange: "0-19",
          },
        ],
      },
      ratings: {
        create: [
          {
            source: "google",
            rating: 4.6,
            reviewCount: 284,
            maxRating: 5.0,
            scrapedAt: new Date(),
          },
        ],
      },
      courseRatings: {
        create: [
          {
            teeColor: "White",
            gender: "men",
            courseRating: 72.4,
            slopeRating: 135,
            lengthMeters: 5842,
            par: 71,
          },
          {
            teeColor: "Red",
            gender: "women",
            courseRating: 74.2,
            slopeRating: 138,
            lengthMeters: 5120,
            par: 71,
          },
        ],
      },
    },
  });

  // Seed Course 2: Losby Golf Club
  console.log("Creating Losby Golf Club...");
  const losbyGolf = await prisma.course.create({
    data: {
      slug: "losby-golf-club",
      name: "Losby Golf Club",
      addressStreet: "Losbyveien 7",
      postalCode: "1472",
      city: "Fjellhamar",
      municipality: "Lørenskog",
      region: "Østlandet",
      country: "Norway",
      latitude: 59.95,
      longitude: 10.99,
      coordinateAccuracy: "precise",
      holes: 18,
      holesPlayed: 18,
      par: 72,
      parPerRound: 72,
      par3Count: 4,
      par4Count: 10,
      par5Count: 4,
      lengthMeters: 6124,
      lengthYards: 6700,
      terrain: "Forest and parkland",
      courseType: "Championship",
      designer: "Jeremy Turner & European Golf Design",
      yearBuilt: 2006,
      description:
        "Losby Golf Club is a championship course nestled in beautiful forest and parkland terrain, offering a challenging yet fair test of golf.",
      waterHazards: true,
      signatureHole: "Hole 18 - Par 5 finishing hole",
      phone: "+47 67 92 64 00",
      email: "post@losbygods.no",
      website: "https://www.losbygods.no",
      seasonStart: "April",
      seasonEnd: "November",
      visitorsWelcome: true,
      walkingAllowed: true,
      mountainViews: false,
      nearbyCity: "Oslo",
      distanceFromCenter: "20 km",
      scrapedAt: new Date(),
      dataQuality: "high",
      websiteQuality: "excellent",
      completenessPercentage: 92,
      pagesScraped: 12,
      facilities: {
        create: {
          drivingRange: true,
          drivingRangeLength: 300,
          puttingGreen: true,
          chippingArea: true,
          practiceBunker: true,
          clubhouse: true,
          proShop: true,
          restaurant: true,
          restaurantName: "Losby Restaurant",
          clubRental: true,
          cartRental: true,
          pullCartRental: true,
          golfLessons: true,
          teachingPro: true,
          clubFitting: true,
          lockerRooms: true,
          showers: true,
          conferenceRoom: true,
          eventVenue: true,
          eventCapacity: 200,
          simulator: true,
          bunkers: 84,
        },
      },
      pricing: {
        create: {
          year: 2025,
          currency: "NOK",
          greenFeeWeekday: 850,
          greenFeeWeekend: 1100,
          greenFeeSenior: 700,
          greenFeeJunior: 350,
          cartRental: 350,
          pullCartRental: 100,
          clubRental: 450,
        },
      },
      membershipPricing: {
        create: [
          {
            year: 2025,
            category: "senior",
            price: 16500,
            description: "Full membership for seniors 65+",
            ageRange: "65+",
          },
          {
            year: 2025,
            category: "junior",
            price: 3000,
            description: "Junior membership",
            ageRange: "0-19",
          },
        ],
      },
      ratings: {
        create: [
          {
            source: "google",
            rating: 4.7,
            reviewCount: 412,
            maxRating: 5.0,
            scrapedAt: new Date(),
          },
        ],
      },
      courseRatings: {
        create: [
          {
            teeColor: "Blue",
            gender: "men",
            courseRating: 73.8,
            slopeRating: 140,
            lengthMeters: 6124,
            par: 72,
          },
          {
            teeColor: "Red",
            gender: "women",
            courseRating: 75.1,
            slopeRating: 142,
            lengthMeters: 5280,
            par: 72,
          },
        ],
      },
    },
  });

  // Link courses as nearby
  console.log("Creating nearby course relationships...");
  await prisma.nearbyCourse.create({
    data: {
      courseId: osloGolf.id,
      nearbyCourseId: losbyGolf.id,
      distanceKm: 18.5,
    },
  });

  await prisma.nearbyCourse.create({
    data: {
      courseId: losbyGolf.id,
      nearbyCourseId: osloGolf.id,
      distanceKm: 18.5,
    },
  });

  console.log("✅ Seeding completed!");
  console.log(`Created ${2} courses with facilities, pricing, and ratings`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
