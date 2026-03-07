import fs from "fs/promises";
import path from "path";
import { Header } from "@/components/Header";

interface Task {
  title: string;
  status: string;
  priority: string;
  owner: string;
  schedule?: string;
  description: string;
}

async function getTasks() {
  const roadmapPath = path.join(process.cwd(), "ROADMAP.md");
  const content = await fs.readFile(roadmapPath, "utf-8");

  const ceoTasks: Task[] = [];
  const engineerTasks: Task[] = [];
  const courseInstructorTasks: Task[] = [];
  const completedTasks: Task[] = [];

  // Parse ROADMAP.md
  const lines = content.split("\n");
  let currentOwner = "";
  let currentTask: Task | null = null;

  for (const line of lines) {
    // Detect role sections
    if (line.startsWith("## 👔 CEO Tasks")) {
      currentOwner = "CEO";
    } else if (line.startsWith("## 💻 Engineer Tasks")) {
      currentOwner = "Engineer";
    } else if (line.startsWith("## 🎓 Course Instructor Tasks")) {
      currentOwner = "Course Instructor";
    } else if (line.startsWith("## ✅ Completed")) {
      currentOwner = "completed";
    } else if (line.startsWith("#### ")) {
      // New task (h4 level)
      if (currentTask) {
        if (currentTask.owner === "CEO") ceoTasks.push(currentTask);
        else if (currentTask.owner === "Engineer") engineerTasks.push(currentTask);
        else if (currentTask.owner === "Course Instructor") courseInstructorTasks.push(currentTask);
        else if (currentOwner === "completed") completedTasks.push(currentTask);
      }

      currentTask = {
        title: line.replace("#### ", ""),
        status: "Pending",
        priority: "MEDIUM",
        owner: currentOwner,
        description: "",
      };
    } else if (line.startsWith("**Owner**:")) {
      if (currentTask) currentTask.owner = line.replace("**Owner**: ", "").trim();
    } else if (line.startsWith("**Status**:")) {
      if (currentTask) currentTask.status = line.replace("**Status**: ", "").trim();
    } else if (line.startsWith("**Priority**:")) {
      if (currentTask) currentTask.priority = line.replace("**Priority**: ", "").trim();
    } else if (line.startsWith("**Schedule**:")) {
      if (currentTask) currentTask.schedule = line.replace("**Schedule**: ", "").trim();
    } else if (currentTask && line.trim() && !line.startsWith("**") && !line.startsWith("##") && !line.startsWith("###")) {
      currentTask.description += line.trim() + " ";
    }
  }

  // Add last task
  if (currentTask) {
    if (currentTask.owner === "CEO") ceoTasks.push(currentTask);
    else if (currentTask.owner === "Engineer") engineerTasks.push(currentTask);
    else if (currentTask.owner === "Course Instructor") courseInstructorTasks.push(currentTask);
    else if (currentOwner === "completed") completedTasks.push(currentTask);
  }

  return { ceoTasks, engineerTasks, courseInstructorTasks, completedTasks };
}

export default async function TasksPage() {
  const { ceoTasks, engineerTasks, courseInstructorTasks, completedTasks } = await getTasks();
  const totalOpen = ceoTasks.length + engineerTasks.length + courseInstructorTasks.length;
  const totalCompleted = completedTasks.length;
  const completionRate = Math.round((totalCompleted / (totalOpen + totalCompleted)) * 100);

  const renderTaskCard = (task: Task, idx: number) => (
    <div key={idx} className="border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
        <div className="flex gap-2">
          {task.schedule && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-900/30 border border-purple-700 text-purple-400 font-medium whitespace-nowrap">
              {task.schedule}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
            task.priority === "CRITICAL" || task.priority === "HIGH"
              ? "bg-red-900/30 border border-red-700 text-red-400"
              : task.priority === "MEDIUM"
              ? "bg-yellow-900/30 border border-yellow-700 text-yellow-400"
              : "bg-neutral-800 border border-neutral-700 text-neutral-400"
          }`}>
            {task.priority}
          </span>
        </div>
      </div>
      {task.description && (
        <p className="text-neutral-400 text-sm mb-3 line-clamp-3">{task.description}</p>
      )}
      <div className="flex items-center gap-4 text-xs">
        <span className={`px-2 py-1 rounded font-medium ${
          task.status.toLowerCase().includes("completed")
            ? "bg-green-900/30 text-green-400"
            : task.status.toLowerCase().includes("progress")
            ? "bg-blue-900/30 text-blue-400"
            : "bg-neutral-800 text-neutral-400"
        }`}>
          {task.status}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">What I'm Working On</h1>
          <p className="text-xl text-neutral-400">
            My definitive work list toward $80k/month. Tasks organized by team member.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">{totalOpen}</div>
            <div className="text-sm text-blue-400/70">Active Tasks</div>
          </div>
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">{totalCompleted}</div>
            <div className="text-sm text-green-400/70">Completed</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-2">{completionRate}%</div>
            <div className="text-sm text-neutral-400">Completion Rate</div>
          </div>
        </div>

        {/* CEO Tasks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>👔</span> CEO Tasks <span className="text-sm font-normal text-neutral-400">({ceoTasks.length})</span>
          </h2>
          <div className="space-y-4">
            {ceoTasks.length > 0 ? (
              ceoTasks.map(renderTaskCard)
            ) : (
              <p className="text-neutral-500 italic">No active CEO tasks</p>
            )}
          </div>
        </div>

        {/* Engineer Tasks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>💻</span> Engineer Tasks <span className="text-sm font-normal text-neutral-400">({engineerTasks.length})</span>
          </h2>
          <div className="space-y-4">
            {engineerTasks.length > 0 ? (
              engineerTasks.map(renderTaskCard)
            ) : (
              <p className="text-neutral-500 italic">No active engineer tasks</p>
            )}
          </div>
        </div>

        {/* Course Instructor Tasks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎓</span> Course Instructor Tasks <span className="text-sm font-normal text-neutral-400">({courseInstructorTasks.length})</span>
          </h2>
          <div className="space-y-4">
            {courseInstructorTasks.length > 0 ? (
              courseInstructorTasks.map(renderTaskCard)
            ) : (
              <p className="text-neutral-500 italic">No active course instructor tasks</p>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>✅</span> Completed Tasks <span className="text-sm font-normal text-neutral-400">({completedTasks.length})</span>
          </h2>
          <div className="space-y-4">
            {completedTasks.length > 0 ? (
              completedTasks.map(renderTaskCard)
            ) : (
              <p className="text-neutral-500 italic">No completed tasks yet</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-800 text-center">
          <p className="text-neutral-400 mb-4">
            This page pulls directly from ROADMAP.md in the codebase. Everything is tracked publicly.
          </p>
          <a
            href="https://github.com/nalin/thewebsite/blob/main/ROADMAP.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white font-medium transition-colors"
          >
            View Raw ROADMAP.md on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}
