import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { Header } from "@/components/Header";

interface Task {
  title: string;
  status: string;
  priority: string;
  type: string;
  description: string;
}

async function getTasks() {
  const roadmapPath = path.join(process.cwd(), "ROADMAP.md");
  const content = await fs.readFile(roadmapPath, "utf-8");

  const oneTimeTasks: Task[] = [];
  const recurringTasks: Task[] = [];
  const completedTasks: Task[] = [];

  // Parse ROADMAP.md
  const lines = content.split("\n");
  let currentSection = "";
  let currentTask: Task | null = null;

  for (const line of lines) {
    if (line.startsWith("## 🔥 Priority 1: Recurring Operations")) {
      currentSection = "recurring";
    } else if (line.startsWith("## 📚 Priority") || line.startsWith("## 📣 Priority") || line.startsWith("## 📊 Priority") || line.startsWith("## 💰 Priority") || line.startsWith("## 🎨 Priority")) {
      currentSection = "one-time";
    } else if (line.startsWith("## ✅ Completed")) {
      currentSection = "completed";
    } else if (line.startsWith("### ")) {
      // New task
      if (currentTask) {
        if (currentSection === "recurring") recurringTasks.push(currentTask);
        else if (currentSection === "one-time") oneTimeTasks.push(currentTask);
        else if (currentSection === "completed") completedTasks.push(currentTask);
      }

      currentTask = {
        title: line.replace("### ", ""),
        status: currentSection === "completed" ? "Completed" : "Pending",
        priority: currentSection === "recurring" ? "CRITICAL/HIGH" : "HIGH/MEDIUM/LOW",
        type: currentSection === "recurring" ? "Recurring" : "One-time",
        description: "",
      };
    } else if (line.startsWith("**Status**:")) {
      if (currentTask) currentTask.status = line.replace("**Status**: ", "");
    } else if (line.startsWith("**Priority**:")) {
      if (currentTask) currentTask.priority = line.replace("**Priority**: ", "");
    } else if (currentTask && line.trim() && !line.startsWith("**") && !line.startsWith("##")) {
      currentTask.description += line.trim() + " ";
    } else if (line.startsWith("- ✅")) {
      // Completed task in list format
      completedTasks.push({
        title: line.replace("- ✅ ", ""),
        status: "Completed",
        priority: "N/A",
        type: "One-time",
        description: "",
      });
    }
  }

  // Add last task
  if (currentTask) {
    if (currentSection === "recurring") recurringTasks.push(currentTask);
    else if (currentSection === "one-time") oneTimeTasks.push(currentTask);
    else if (currentSection === "completed") completedTasks.push(currentTask);
  }

  return { oneTimeTasks, recurringTasks, completedTasks };
}

export default async function TasksPage() {
  const { oneTimeTasks, recurringTasks, completedTasks } = await getTasks();
  const totalOpen = oneTimeTasks.length + recurringTasks.length;
  const totalCompleted = completedTasks.length;
  const completionRate = Math.round((totalCompleted / (totalOpen + totalCompleted)) * 100);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">What I'm Working On</h1>
          <p className="text-xl text-neutral-400">
            My definitive work list toward $80k/month. One-time and recurring tasks managed directly on this site.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-900 mb-2">{totalOpen}</div>
            <div className="text-sm text-blue-400">Active Tasks</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-900 mb-2">{totalCompleted}</div>
            <div className="text-sm text-green-400">Completed</div>
          </div>
          <div className="bg-neutral-50 border border-neutral-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-2">{completionRate}%</div>
            <div className="text-sm text-neutral-400">Completion Rate</div>
          </div>
        </div>

        {/* Recurring Tasks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">🔁 Recurring Tasks (Daily/Weekly Operations)</h2>
          <div className="space-y-4">
            {recurringTasks.map((task, idx) => (
              <div
                key={idx}
                className="border-2 border-red-300 bg-red-50 rounded-lg p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-200 text-red-900 font-bold">
                    {task.type.toUpperCase()}
                  </span>
                </div>
                {task.description && (
                  <p className="text-neutral-400 text-sm mb-3">{task.description.slice(0, 300)}</p>
                )}
                <div className="text-xs text-neutral-400">
                  <span className="font-semibold">Priority:</span> {task.priority} |{" "}
                  <span className="font-semibold">Status:</span> {task.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* One-time Tasks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">🚀 One-time Tasks</h2>
          <div className="space-y-4">
            {oneTimeTasks.map((task, idx) => (
              <div key={idx} className="border border-neutral-800 rounded-lg p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-neutral-900 text-neutral-700">
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-neutral-400 text-sm mb-3">{task.description.slice(0, 250)}</p>
                )}
                <div className="text-xs text-gray-500">
                  Status: {task.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">✅ Completed Tasks</h2>
          <div className="space-y-3">
            {completedTasks.map((task, idx) => (
              <div
                key={idx}
                className="border border-green-200 bg-green-50 rounded-lg p-4"
              >
                <h3 className="font-medium text-white">{task.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-8">
          <p className="text-neutral-400 text-sm mb-4">
            This is my definitive task list. Managed directly in the codebase at{" "}
            <a
              href="https://github.com/nalin/thewebsite/blob/main/ROADMAP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-400"
            >
              ROADMAP.md
            </a>
            . Updated in real-time.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-neutral-400 hover:text-white">
              ← Home
            </Link>
            <Link href="/course" className="text-sm text-neutral-400 hover:text-white">
              Course
            </Link>
            <Link href="/blog" className="text-sm text-neutral-400 hover:text-white">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
