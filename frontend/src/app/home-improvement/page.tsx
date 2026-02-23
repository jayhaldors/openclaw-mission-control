"use client";

export const dynamic = "force-dynamic";

import { Hammer, Calendar, ArrowRight } from "lucide-react";

import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";

type ProjectStatus = "active" | "completed" | "blocked";

type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  blocked: "bg-amber-100 text-amber-700",
};

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Kitchen Renovation",
    description:
      "Full kitchen remodel including new cabinets, countertops, and appliances.",
    status: "active",
    progress: 65,
    startDate: "2026-01-15",
    endDate: "2026-04-30",
  },
  {
    id: "2",
    name: "Bathroom Tile Replacement",
    description:
      "Replace floor and shower tiles in the master bathroom with modern porcelain.",
    status: "completed",
    progress: 100,
    startDate: "2025-11-01",
    endDate: "2025-12-20",
  },
  {
    id: "3",
    name: "Deck Expansion",
    description:
      "Extend the backyard deck by 200 sq ft with composite decking material.",
    status: "blocked",
    progress: 30,
    startDate: "2026-02-01",
    endDate: "2026-06-15",
  },
  {
    id: "4",
    name: "Smart Home Wiring",
    description:
      "Install structured cabling and smart home hub for lighting, HVAC, and security.",
    status: "active",
    progress: 45,
    startDate: "2026-01-20",
    endDate: "2026-03-31",
  },
  {
    id: "5",
    name: "Garage Insulation",
    description:
      "Add spray foam insulation to garage walls and ceiling for temperature control.",
    status: "active",
    progress: 10,
    startDate: "2026-02-10",
    endDate: "2026-03-15",
  },
  {
    id: "6",
    name: "Fence Repair",
    description:
      "Replace damaged fence panels and repaint the perimeter fence.",
    status: "completed",
    progress: 100,
    startDate: "2025-10-05",
    endDate: "2025-10-20",
  },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Hammer className="h-4 w-4" />
          </div>
          <h3 className="font-heading text-base font-semibold text-slate-900">
            {project.name}
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[project.status]}`}
        >
          {project.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{project.description}</p>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-medium text-slate-700">{project.progress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {project.startDate}
        </span>
        <ArrowRight className="h-3 w-3" />
        <span>{project.endDate}</span>
      </div>
    </div>
  );
}

export default function HomeImprovementPage() {
  return (
    <DashboardPageLayout
      signedOut={{
        message: "Sign in to view home improvement projects.",
        forceRedirectUrl: "/onboarding",
        signUpForceRedirectUrl: "/onboarding",
      }}
      title="Home Improvement"
      description="Track ongoing home improvement projects and their progress"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </DashboardPageLayout>
  );
}
