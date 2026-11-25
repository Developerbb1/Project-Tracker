//import { Project as PrismaProject } from "@prisma/client";
//export type Project = PrismaProject;

import type { Project } from "@prisma/client";

export type { Project } from "@prisma/client";
export const PROJECTS_PER_PAGE = 9;

export enum ProjectStatus {
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  PENDING = "Pending",
}

export interface ProjectFormData {
  name: string;
  client: string;
  description: string;
  value: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
}

export interface ProjectPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export interface ProjectListPageProps {
  status?: ProjectStatus;
  search?: string;
}

export interface EditProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export interface ProjectDetailsProps {
  projectId?: string;
  initialData?: Partial<ProjectFormData>;
}

export interface ProjectFormProps {
  projectId?: string;
  initialData?: Partial<ProjectFormData>;
  submitLabel?: string;
}

export interface ApiErrorResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

/* =========================
   Project List Response
========================= */

export interface ProjectResponse {
  success: boolean;
  projects: Project[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProjects: number;
    projectsPerPage: number;
  };
  error?: string;
}

/* =========================
   Single Project Response
========================= */

export interface SingleProjectResponse {
  success: boolean;
  project: Project;
  error?: string;
}

/* =========================
   Delete Response
========================= */

export interface DeleteProjectResponse {
  success: boolean;
  error?: string;
}

/* =========================
   Handle API Response
========================= */

async function handleApiResponse<T>(response: Response): Promise<T> {
  let data: T | ApiErrorResponse;

  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned an invalid response (${response.status})`);
  }

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    switch (response.status) {
      case 400:
        throw new Error(errorData.error || errorData.message || "Invalid request.");

      case 404:
        throw new Error(errorData.error || errorData.message || "Project not found.");

      case 500:
        throw new Error(errorData.error || errorData.message || "Internal server error. Please try again later.");

      default:
        throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}.`);
    }
  }

  return data as T;
}

/* =========================
   Fetch All Projects
========================= */

export async function fetchProjects(
  status?: ProjectStatus,
  search?: string,
  page: number = 1
): Promise<ProjectResponse> {
  const params = new URLSearchParams();

  if (status) params.set("status", status);

  if (search?.trim()) params.set("search", search.trim());

  params.set("page", String(page));

  const queryString = params.toString();

  const url = queryString ? `/api/projects?${queryString}` : "/api/projects";

  const response = await fetch(url, {
    cache: "no-store",
  });

  console.log("HTTP status:", response.status);
  console.log("Fetching projects with status:", status);
  console.log("Searching projects with:", search);
  console.log("Fetching page:", page);
  console.log("URL:", url);

  const data = await handleApiResponse<ProjectResponse>(response);

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch projects.");
  }

  console.log("Response data:", data);

  return data;
}

/* =========================
   Fetch Single Project
========================= */

export async function fetchProject(id: string): Promise<Project | null> {
  const response = await fetch(`/api/projects/${encodeURIComponent(id)}`);

  console.log("HTTP status:", response.status);

  if (response.status === 404) {
    return null;
  }

  const data = await handleApiResponse<SingleProjectResponse>(response);

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch project.");
  }

  return data.project;
}

/* =========================
   Create Project
========================= */

export async function createProject(project: ProjectFormData): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  console.log("HTTP status:", response.status);

  const data = await handleApiResponse<SingleProjectResponse>(response);

  if (!data.success) {
    throw new Error(data.error || "Failed to create project.");
  }

  return data.project;
}

/* =========================
   Update Project
========================= */

export async function updateProject(id: string, project: ProjectFormData): Promise<Project> {
  const status = project.progress === 100 ? ProjectStatus.COMPLETED : project.status;

  const progress = status === ProjectStatus.COMPLETED ? 100 : project.progress;

  const updatedProject = {
    ...project,
    status,
    progress,
  };

  const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedProject),
  });

  console.log("HTTP status:", response.status);

  const data = await handleApiResponse<SingleProjectResponse>(response);

  if (!data.success) {
    throw new Error(data.error || "Failed to update project.");
  }

  return data.project;
}

/* =========================
   Delete Project
========================= */

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  console.log("HTTP status:", response.status);

  const data = await handleApiResponse<DeleteProjectResponse>(response);

  if (!data.success) {
    throw new Error(data.error || "Failed to delete project.");
  }
}
