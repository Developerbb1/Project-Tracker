import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import type { Project } from "@prisma/client";
export async function GET() {
  try {
    const projects = await prisma.project.findMany();

    const totalProjects = projects.length;

    const inProgress = projects.filter((project: Project) => project.status === "In Progress").length;

    const completed = projects.filter((project: Project) => project.status === "Completed").length;

    const totalValue = projects.reduce((total: number, project: Project) => total + project.value, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects,
        inProgress,
        completed,
        totalValue,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard statistics.",
      },
      { status: 500 }
    );
  }
}
