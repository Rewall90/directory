import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // If there's a search query, filter results
    const whereClause = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { city: { contains: query, mode: "insensitive" as const } },
            { region: { contains: query, mode: "insensitive" as const } },
            { municipality: { contains: query, mode: "insensitive" as const } },
            { formerName: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {};

    const courses = await prisma.course.findMany({
      where: whereClause,
      take: query ? 15 : 10, // More results for search
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        region: true,
        municipality: true,
        holes: true,
        par: true,
        lengthMeters: true,
        createdAt: true,
      },
      orderBy: query
        ? [
            // Prioritize name matches for search
            { name: "asc" },
          ]
        : [
            { createdAt: "desc" },
          ],
    });

    return NextResponse.json({
      success: true,
      count: courses.length,
      courses,
      query: query || null,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
      },
      { status: 500 },
    );
  }
}
