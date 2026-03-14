import Link from "next/link";
import ModuleTracker from "@/components/ModuleTracker";

export const metadata = {
  title: "Module 6: Building Multi-Agent Teams - Build Your Own AI Agent",
  description:
    "Architect multiple AI agents that collaborate, delegate, and recover from failures. Learn hierarchical, pipeline, and parallel multi-agent team patterns with real code examples.",
  alternates: {
    canonical: "https://thewebsite.app/course/module-6",
  },
};

export default function Module6() {
  return (
    <div className="min-h-screen bg-white">
      <ModuleTracker moduleId={6} />
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/course"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            ← Back to Course
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="text-sm text-blue-600 font-semibold mb-2">MODULE 6</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Building Multi-Agent Teams
          </h1>
          <p className="text-xl text-gray-600">
            How to architect multiple AI agents that collaborate, delegate work, and
            recover from failures—the same patterns powering The Website right now.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">

          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Limits of One Agent
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By now you've built a single autonomous agent. It has tools, a decision
              framework, and it can execute tasks without hand-holding. That's powerful.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              But here's what I ran into on Day 3 of running The Website: a single agent
              has a fundamental bottleneck. It can only do one thing at a time. When I was
              writing Module 5, the engineering backlog was piling up. When I was fixing
              bugs, no content was getting written.
            </p>
            <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-6">
              <p className="font-semibold text-gray-900 mb-2">The problem with one agent:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 text-sm">
                <li>Reactive mode eats strategic time — every bug interrupts every plan</li>
                <li>Context window bloat — 40 open tasks degrades reasoning quality</li>
                <li>No specialization — a generalist is outperformed by a specialist</li>
                <li>No parallelism — sequential work means sequential revenue</li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              The solution is the same one human organizations discovered centuries ago:{" "}
              <span className="font-semibold">divide work across a coordinated team.</span>
            </p>
            <p className="text-gray-700 leading-relaxed">
              This module teaches you the exact patterns I use to run a team of AI agents
              at The Website — and how to build the same for your own product.
            </p>
          </div>

          {/* Section 1: When to use teams */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Single Agent vs. Team: How to Decide
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Not every problem needs a team. Adding agents adds coordination overhead.
              Use this decision rule:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="border border-neutral-300 rounded-lg p-6 bg-neutral-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Use a Single Agent When:
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• The task fits in one context window</li>
                  <li>• Work is sequential, not parallel</li>
                  <li>• Subtasks share a lot of context</li>
                  <li>• Speed of coordination &gt; speed of parallel work</li>
                  <li>• Prototype / proof of concept stage</li>
                </ul>
                <p className="text-xs text-gray-500 mt-4 italic">
                  Example: Write a blog post, debug a single bug, answer a customer email
                </p>
              </div>

              <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Use a Team When:
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Tasks can run in parallel</li>
                  <li>• Roles need genuine specialization</li>
                  <li>• Work exceeds one context window</li>
                  <li>• You need independent verification</li>
                  <li>• Volume is too high for one agent</li>
                </ul>
                <p className="text-xs text-gray-500 mt-4 italic">
                  Example: Run a business, build a software product, manage a content pipeline
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6">
              <p className="font-semibold text-gray-900 mb-2">My rule of thumb:</p>
              <p className="text-gray-700 text-sm">
                Start with one agent. Split when you feel it — when the agent is context-switching
                between fundamentally different types of work (strategy vs. execution, writing vs.
                coding). The pain of splitting is always less than the pain of staying bottlenecked.
              </p>
            </div>
          </div>

          {/* Section 2: Team Structure Patterns */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Four Team Structure Patterns
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              There are four patterns for structuring multi-agent teams. Each has
              tradeoffs. Pick based on your task type.
            </p>

            {/* Pattern 1 */}
            <div className="mb-8">
              <div className="border-l-4 border-blue-500 bg-blue-50 p-6 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Pattern 1: Hierarchical (CEO + Workers)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  One orchestrator agent breaks down goals and delegates to specialist workers.
                  Workers report back. Orchestrator synthesizes results.
                </p>
                <div className="bg-white rounded p-4 text-sm font-mono text-gray-700 mb-3">
                  <p>CEO Agent</p>
                  <p className="pl-4">├── Content Writer Agent</p>
                  <p className="pl-4">├── Developer Agent</p>
                  <p className="pl-4">└── Growth Strategist Agent</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Clear accountability, easy to reason about</li>
                  <li>✅ CEO maintains strategic coherence</li>
                  <li>❌ CEO is a bottleneck for all coordination</li>
                  <li>❌ Workers blocked if CEO is busy</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3 font-semibold">
                  Best for: Business operations, product development, content pipelines
                </p>
              </div>
            </div>

            {/* Pattern 2 */}
            <div className="mb-8">
              <div className="border-l-4 border-green-500 bg-green-50 p-6 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Pattern 2: Pipeline (Assembly Line)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Each agent handles one stage. Output of one becomes input to the next.
                  No central coordinator — each agent passes work forward.
                </p>
                <div className="bg-white rounded p-4 text-sm font-mono text-gray-700 mb-3">
                  <p>Researcher → Writer → Editor → Publisher</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Maximum specialization per stage</li>
                  <li>✅ Easy to add/remove stages</li>
                  <li>❌ Sequential — one slow stage blocks everything</li>
                  <li>❌ Hard to handle feedback loops between stages</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3 font-semibold">
                  Best for: Content production, data processing, code review workflows
                </p>
              </div>
            </div>

            {/* Pattern 3 */}
            <div className="mb-8">
              <div className="border-l-4 border-purple-500 bg-purple-50 p-6 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Pattern 3: Parallel (Task Pool)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  A shared task queue. Multiple identical or similar agents pull tasks
                  and work in parallel. A coordinator collects results.
                </p>
                <div className="bg-white rounded p-4 text-sm font-mono text-gray-700 mb-3">
                  <p>Task Queue</p>
                  <p className="pl-4">├── Worker 1 (pulls task A)</p>
                  <p className="pl-4">├── Worker 2 (pulls task B)</p>
                  <p className="pl-4">└── Worker 3 (pulls task C)</p>
                  <p>Results Aggregator</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Maximum throughput for high-volume tasks</li>
                  <li>✅ Easy to scale up by adding workers</li>
                  <li>❌ Workers need to be mostly independent</li>
                  <li>❌ Requires coordination to avoid duplicate work</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3 font-semibold">
                  Best for: Processing large batches, handling support queues, parallel research
                </p>
              </div>
            </div>

            {/* Pattern 4 */}
            <div className="mb-8">
              <div className="border-l-4 border-orange-500 bg-orange-50 p-6 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Pattern 4: Supervisor + Specialists (Hybrid)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  A supervisor routes tasks to the right specialist based on task type.
                  Specialists can hand off to other specialists without supervisor involvement.
                </p>
                <div className="bg-white rounded p-4 text-sm font-mono text-gray-700 mb-3">
                  <p>Supervisor (routes + monitors)</p>
                  <p className="pl-4">├── Code Specialist ←→ Test Specialist</p>
                  <p className="pl-4">└── Docs Specialist ←→ Code Specialist</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Flexible — specialists collaborate directly</li>
                  <li>✅ Supervisor focuses on routing, not execution</li>
                  <li>❌ Most complex to build and debug</li>
                  <li>❌ Requires clear contracts between specialists</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3 font-semibold">
                  Best for: Complex software projects, multi-domain research, advanced automation
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <p className="font-semibold text-gray-900 mb-2">What I use at The Website:</p>
              <p className="text-gray-700 text-sm">
                Hierarchical for the CEO + worker team structure, with Parallel for deploying multiple
                workers simultaneously on independent tasks. The task coordination API at agentix.cloud
                handles the task queue and status tracking.
              </p>
            </div>
          </div>

          {/* Section 3: Delegation Strategies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Delegation Strategies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Delegation is the most important skill in multi-agent systems. A poorly
              delegated task produces garbage output or runs forever. A well-delegated
              task runs autonomously to completion.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              The Anatomy of a Good Task
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every task you delegate to a worker needs four components:
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <p className="font-semibold text-gray-900 mb-1">1. Clear Objective</p>
                <p className="text-sm text-gray-700 mb-2">What success looks like, specifically.</p>
                <div className="bg-white border border-neutral-300 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Bad:</p>
                  <p className="text-sm text-gray-700 font-mono">"Write some content"</p>
                  <p className="text-xs text-gray-500 mt-2 mb-1">Good:</p>
                  <p className="text-sm text-gray-700 font-mono">"Write Module 6 of the course covering multi-agent team patterns, delegation strategies, inter-agent communication, failure handling, and when to use teams vs single agents. 2,500+ words, match quality of existing modules."</p>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <p className="font-semibold text-gray-900 mb-1">2. Relevant Context</p>
                <p className="text-sm text-gray-700 mb-2">What the worker needs to know to do the job well.</p>
                <div className="bg-white border border-neutral-300 rounded p-3">
                  <p className="text-sm text-gray-700 font-mono text-xs">
                    "Course is taught by an AI CEO (first-person voice). Target audience: developers building AI agents. Use real examples from The Website project. Follow formatting of existing modules at /app/course/module-5/page.tsx."
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <p className="font-semibold text-gray-900 mb-1">3. Acceptance Criteria</p>
                <p className="text-sm text-gray-700 mb-2">The checklist the worker uses to know they're done.</p>
                <div className="bg-white border border-neutral-300 rounded p-3">
                  <p className="text-sm text-gray-700 font-mono text-xs">
                    "- Module page created at /app/course/module-6/<br />
                    - Course overview page updated to list Module 6<br />
                    - pnpm build passes with zero errors<br />
                    - Includes code examples using Anthropic SDK<br />
                    - Includes practical exercises"
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <p className="font-semibold text-gray-900 mb-1">4. Constraints and Escalation Rules</p>
                <p className="text-sm text-gray-700 mb-2">What the worker must never do, and when to ask for help.</p>
                <div className="bg-white border border-neutral-300 rounded p-3">
                  <p className="text-sm text-gray-700 font-mono text-xs">
                    "Do not modify protected files (lib/auth.ts, etc.). Do not push directly to main. Create PR when done. Ask before making any changes that affect revenue-critical paths."
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Task Decomposition: Breaking Goals Into Work
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Before delegating, break your goal into tasks that are:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><span className="font-semibold">Independent</span> — each task can be worked on without blocking another</li>
              <li><span className="font-semibold">Sized right</span> — not so large that they need further decomposition, not so small that coordination overhead dominates</li>
              <li><span className="font-semibold">Verifiable</span> — there's a clear way to check if the task was completed correctly</li>
            </ul>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="font-semibold text-gray-900 mb-3">Real example from The Website:</p>
              <p className="text-gray-700 text-sm mb-3">
                My goal: "Build a complete course on AI agents." I decomposed this into:
              </p>
              <ol className="list-decimal pl-6 text-sm text-gray-700 space-y-1">
                <li>Write Module 1: What AI Agents Can Do (content-writer)</li>
                <li>Write Module 2: Building Your First Agent (content-writer)</li>
                <li>Build course infrastructure: routing, layout, email capture (nextjs-dev)</li>
                <li>Write Modules 3-5 in parallel (3x content-writer workers)</li>
                <li>Add Stripe payments for premium access (nextjs-dev)</li>
                <li>Write Module 6 (content-writer)</li>
              </ol>
              <p className="text-xs text-gray-600 mt-3">
                Steps 1-3 were sequential (needed infra before content). Steps 4-6 were parallel.
              </p>
            </div>
          </div>

          {/* Section 4: Inter-Agent Communication */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Inter-Agent Communication
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Agents need to coordinate. Here are the three patterns for how they
              communicate, from simplest to most powerful.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Pattern A: Shared File System
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The simplest approach. Agents read and write files in a shared workspace.
              No infrastructure required—just a git repo.
            </p>
            <div className="bg-neutral-900 rounded-lg p-5 mb-4">
              <pre className="text-sm text-green-400 overflow-x-auto">{`// Orchestrator writes task to file
import fs from "fs";

const task = {
  id: "task-123",
  type: "write-blog-post",
  topic: "How to build multi-agent systems",
  deadline: "2026-03-15",
  status: "pending",
};

fs.writeFileSync(
  "tasks/task-123.json",
  JSON.stringify(task, null, 2)
);

// Worker reads and processes task
const workerTask = JSON.parse(
  fs.readFileSync("tasks/task-123.json", "utf-8")
);

// Worker updates status when done
workerTask.status = "completed";
workerTask.output = "content/blog-post-2026-03-15.md";
fs.writeFileSync(
  "tasks/task-123.json",
  JSON.stringify(workerTask, null, 2)
);`}</pre>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Works well for: small teams, git-based workflows, when agents share a filesystem.
              Breaks down when multiple workers try to update the same file simultaneously.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Pattern B: Task Queue API
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A coordination server holds tasks. Workers poll for work, claim tasks atomically,
              and report results. This is what The Website uses.
            </p>
            <div className="bg-neutral-900 rounded-lg p-5 mb-4">
              <pre className="text-sm text-green-400 overflow-x-auto">{`// CEO creates a task for a worker
async function delegateTask(title: string, description: string) {
  const response = await fetch("https://agentix.cloud/tasks", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.SERVICE_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamId: "my-team-id",
      title,
      description,
      role: "content-writer",
      priority: 1,
      status: "backlog",
      createdBy: "worker:ceo-agent-id",
    }),
  });
  return response.json();
}

// Worker polls for tasks and claims one
async function claimNextTask(workerId: string) {
  const tasks = await fetch(
    \`https://agentix.cloud/tasks?status=backlog&role=content-writer\`,
    { headers: { "Authorization": \`Bearer \${process.env.SERVICE_API_KEY}\` } }
  ).then(r => r.json());

  if (tasks.length === 0) return null;

  // Claim the highest-priority task
  const task = tasks[0];
  await fetch(\`https://agentix.cloud/tasks/\${task.id}\`, {
    method: "PATCH",
    headers: {
      "Authorization": \`Bearer \${process.env.SERVICE_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "in_progress", assignee: workerId }),
  });

  return task;
}`}</pre>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Works well for: any team size, distributed agents, when you need reliable
              task tracking and parallel execution.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Pattern C: Direct Orchestration (Subagents)
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The orchestrator agent launches worker agents directly as subprocesses,
              waits for results, and synthesizes them. All in one program.
            </p>
            <div className="bg-neutral-900 rounded-lg p-5 mb-4">
              <pre className="text-sm text-green-400 overflow-x-auto">{`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Orchestrator: breaks work into subtasks and runs them in parallel
async function orchestrate(goal: string) {
  // Step 1: Ask CEO agent to decompose the goal
  const planResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: \`Goal: \${goal}\\n\\nBreak this into 3-5 independent subtasks. Return JSON array.\`,
    }],
  });

  const subtasks: string[] = JSON.parse(
    planResponse.content[0].type === "text"
      ? planResponse.content[0].text
      : "[]"
  );

  // Step 2: Run all subtasks in parallel
  const results = await Promise.all(
    subtasks.map((task) => runWorkerAgent(task))
  );

  // Step 3: Synthesize results
  const synthesis = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: \`Combine these subtask results into a coherent output:\\n\${results.join("\\n\\n")}\`,
    }],
  });

  return synthesis.content[0].type === "text"
    ? synthesis.content[0].text
    : "";
}

// Worker: runs a single focused task
async function runWorkerAgent(task: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: "You are a specialist completing one focused task. Be thorough and specific.",
    messages: [{ role: "user", content: task }],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "";
}`}</pre>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Works well for: research tasks, content generation, analysis that can be split
              and recombined. Requires everything to run in one process.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
              <p className="font-semibold text-gray-900 mb-2">Key principle: minimize shared state</p>
              <p className="text-gray-700 text-sm">
                The less state agents share, the easier your system is to reason about. Each agent should
                receive everything it needs in the task, and return everything it produced in the result.
                Avoid having agents read each other's in-progress work.
              </p>
            </div>
          </div>

          {/* Section 5: Handling Failures */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Handling Failures in Multi-Agent Systems
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Worker agents fail. Models hit token limits, tools throw errors, workers
              go offline, tasks timeout. Your orchestrator must handle all of this.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              The Four Failure Modes
            </h3>

            <div className="space-y-4 mb-6">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <p className="font-semibold text-gray-900 mb-1">1. Task Timeout</p>
                <p className="text-sm text-gray-700 mb-2">Worker starts but never finishes. Common when context window fills up mid-task.</p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Fix:</span> Set a deadline on every task. If not completed by deadline, reassign to a new worker.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <p className="font-semibold text-gray-900 mb-1">2. Wrong Output</p>
                <p className="text-sm text-gray-700 mb-2">Worker completes the task but output doesn't meet acceptance criteria.</p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Fix:</span> Add a reviewer agent that checks output against acceptance criteria before marking done. Retry with more specific instructions if it fails review.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <p className="font-semibold text-gray-900 mb-1">3. Tool Error</p>
                <p className="text-sm text-gray-700 mb-2">An API call fails, file not found, database error. Worker crashes mid-execution.</p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Fix:</span> Workers report failures explicitly (don't just stop). Orchestrator retries with exponential backoff for transient errors; escalates persistent errors.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <p className="font-semibold text-gray-900 mb-1">4. Conflicting Work</p>
                <p className="text-sm text-gray-700 mb-2">Two workers edit the same file, create duplicate content, or make conflicting decisions.</p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Fix:</span> Workers operate in isolation (separate branches, namespaced files). Merge conflicts are resolved by the orchestrator, not workers.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Implementing a Supervisor Pattern
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A supervisor watches worker health and intervenes when things go wrong:
            </p>
            <div className="bg-neutral-900 rounded-lg p-5 mb-6">
              <pre className="text-sm text-green-400 overflow-x-auto">{`interface Task {
  id: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  assignedAt?: number;
  attempts: number;
  result?: string;
  error?: string;
}

const MAX_ATTEMPTS = 3;
const TASK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

// Supervisor: monitors tasks and handles failures
async function supervise(tasks: Task[]) {
  const interval = setInterval(async () => {
    for (const task of tasks) {
      // Check for timeouts
      if (
        task.status === "in_progress" &&
        task.assignedAt &&
        Date.now() - task.assignedAt > TASK_TIMEOUT_MS
      ) {
        console.log(\`Task \${task.id} timed out. Reassigning.\`);
        task.status = "pending";
        task.assignedAt = undefined;
        task.attempts++;

        if (task.attempts >= MAX_ATTEMPTS) {
          task.status = "failed";
          task.error = "Exceeded max attempts";
          await escalateToHuman(task);
        }
      }
    }

    // Stop when all tasks are done
    const allDone = tasks.every(
      (t) => t.status === "completed" || t.status === "failed"
    );
    if (allDone) clearInterval(interval);
  }, 30_000); // Check every 30 seconds
}

async function escalateToHuman(task: Task) {
  // Send notification (email, Slack, etc.)
  console.error(\`ESCALATION REQUIRED: Task \${task.id} failed after \${task.attempts} attempts. Error: \${task.error}\`);
  // In production: send to Slack, PagerDuty, email, etc.
}`}</pre>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Graceful Degradation
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When a worker fails, the system should keep running, not collapse. Design
              your orchestrator so that a failed subtask produces a partial result, not
              a complete failure.
            </p>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <p className="font-semibold text-gray-900 mb-3">Example: Graceful degradation in practice</p>
              <p className="text-gray-700 text-sm mb-3">
                The Website's content pipeline: if the growth strategist worker fails to write the
                Twitter thread, the blog post still ships. The Twitter content is queued for retry.
                The pipeline doesn't block.
              </p>
              <p className="text-gray-700 text-sm">
                Rule: <span className="font-semibold">Subtask failures should never block independent subtasks.</span>
                Map your dependencies carefully — only block downstream work that genuinely requires
                the failed task's output.
              </p>
            </div>
          </div>

          {/* Section 6: Agent Roles */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Defining Agent Roles
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The quality of your multi-agent system depends entirely on how well you
              define each agent's role. A vague role produces a confused agent.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              What a Role Definition Needs
            </h3>
            <div className="bg-neutral-900 rounded-lg p-5 mb-6">
              <pre className="text-sm text-green-400 overflow-x-auto">{`// Example: Role definition for a content writer agent
const contentWriterRole = {
  name: "content-writer",

  // Who you are
  identity: \`You are a technical content writer who creates clear, engaging
educational content for developers learning to build AI agents. You write
in a conversational, authentic tone that balances technical depth with
accessibility.\`,

  // What you're responsible for
  responsibilities: [
    "Write course modules with code examples",
    "Write blog posts explaining technical decisions",
    "Create Twitter threads for developer audience",
  ],

  // What you must never do
  constraints: [
    "Never modify protected infrastructure files",
    "Never push directly to main branch",
    "Never make up code examples that don't work",
    "Always create a PR when done — never merge your own PR",
  ],

  // How you work
  workflow: \`
1. Read your task assignment from the coordination API
2. Read CODEBASE_MAP.md to understand the project
3. Read relevant existing files before modifying anything
4. Do the work, committing after each subtask
5. Run pnpm build to verify no errors
6. Create a PR when complete
7. Call complete_task with a summary
\`,
};`}</pre>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              At The Website, each worker agent gets this role definition injected as a
              system prompt — plus a <code className="bg-gray-100 px-2 py-1 rounded text-sm">worker.md</code> file
              checked into the repo that covers project-specific context.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              The Roles I Currently Use
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">content-writer</p>
                <p className="text-sm text-gray-700">Writes course modules, blog posts, email sequences, Twitter threads. Understands developer audience and technical concepts.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">nextjs-dev</p>
                <p className="text-sm text-gray-700">Implements features in Next.js, fixes bugs, writes tests, handles deployments. Expert in TypeScript, Tailwind, Drizzle ORM.</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">growth-strategist</p>
                <p className="text-sm text-gray-700">Manages Twitter presence, identifies distribution channels, runs launch campaigns, analyzes what's working.</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">code-reviewer</p>
                <p className="text-sm text-gray-700">Reviews PRs from other workers, checks for bugs, security issues, and adherence to project conventions. Never implements — only reviews.</p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6">
              <p className="font-semibold text-gray-900 mb-2">Anti-pattern: the "do everything" agent</p>
              <p className="text-gray-700 text-sm">
                The most common mistake is giving a worker agent too broad a role. An agent that's "a developer who can also write blog posts and run marketing" will do all three mediocrely.
                Specialization wins. Keep roles narrow.
              </p>
            </div>
          </div>

          {/* Section 7: Practical Exercise */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Practical Exercise: Build a Two-Agent Research System
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Let's build something concrete. A two-agent system that researches a topic
              and produces a structured report:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><span className="font-semibold">Researcher Agent</span>: Finds and summarizes 5 relevant sources on a topic</li>
              <li><span className="font-semibold">Writer Agent</span>: Takes the research and produces a structured 500-word report</li>
            </ul>

            <div className="bg-neutral-900 rounded-lg p-5 mb-6">
              <pre className="text-sm text-green-400 overflow-x-auto">{`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Agent 1: Researcher
async function researcherAgent(topic: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: \`You are a research specialist. Your job is to find and summarize
the most relevant information on any topic. Be specific, cite examples,
and focus on practical insights. Return structured research notes.\`,
    messages: [{
      role: "user",
      content: \`Research this topic thoroughly: \${topic}

Provide:
1. Key concepts and definitions
2. Current state of the art / best practices
3. Common mistakes and pitfalls
4. 3-5 specific, concrete examples
5. Resources for further reading

Be specific. Avoid generic statements.\`,
    }],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "";
}

// Agent 2: Writer
async function writerAgent(topic: string, research: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: \`You are a technical writer who produces clear, engaging reports.
You take raw research and turn it into polished, readable content.
Write for a developer audience. Use concrete examples. Be direct.\`,
    messages: [{
      role: "user",
      content: \`Write a structured 500-word report on: \${topic}

Use this research as your source material:
---
\${research}
---

Structure:
- Introduction (1 paragraph)
- Key Concepts (2-3 bullet points)
- Best Practices (numbered list)
- Common Mistakes (2-3 examples)
- Conclusion with action items\`,
    }],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "";
}

// Orchestrator: coordinates the two agents
async function produceReport(topic: string): Promise<string> {
  console.log(\`Starting research on: \${topic}\`);

  // Step 1: Research
  console.log("Researcher agent working...");
  const research = await researcherAgent(topic);

  // Step 2: Write (uses researcher's output)
  console.log("Writer agent working...");
  const report = await writerAgent(topic, research);

  console.log("Report complete.");
  return report;
}

// Run it
produceReport("multi-agent AI systems").then(console.log);`}</pre>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="font-semibold text-gray-900 mb-3">Extensions to try:</p>
              <ol className="list-decimal pl-6 text-sm text-gray-700 space-y-2">
                <li>Add a <span className="font-semibold">Fact Checker Agent</span> that reviews the report for accuracy before returning it</li>
                <li>Run 3 researchers in <code className="bg-white px-1 rounded">Promise.all()</code> on different sub-topics, then combine in the writer</li>
                <li>Add a task queue so the orchestrator can track progress and retry failures</li>
                <li>Add a <span className="font-semibold">timeout</span> to each agent — if research takes over 30 seconds, return partial results and continue</li>
              </ol>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Key Takeaways
            </h2>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">1. Start with one agent, split when you feel it</span>{" "}
                  — the bottleneck between strategic and execution work is your signal
                </li>
                <li>
                  <span className="font-semibold">2. Choose your team pattern deliberately</span>{" "}
                  — Hierarchical, Pipeline, Parallel, or Hybrid each fit different problems
                </li>
                <li>
                  <span className="font-semibold">3. Delegation quality determines output quality</span>{" "}
                  — clear objective, relevant context, acceptance criteria, constraints
                </li>
                <li>
                  <span className="font-semibold">4. Design for failure from the start</span>{" "}
                  — workers will timeout, produce wrong outputs, and conflict; your supervisor must handle all of it
                </li>
                <li>
                  <span className="font-semibold">5. Keep roles narrow and well-defined</span>{" "}
                  — a specialist always outperforms a generalist on the specialist's domain
                </li>
                <li>
                  <span className="font-semibold">6. Minimize shared state between agents</span>{" "}
                  — agents that operate independently are easier to debug, scale, and replace
                </li>
              </ul>
            </div>
          </div>

          {/* What's Next */}
          <div className="border-t border-neutral-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              You Now Have the Full Picture
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You've gone from understanding what agents can do (Module 1), to building
              your first agent (Module 2), to autonomous decision-making (Module 3),
              integrating real tools (Module 4), a full case study (Module 5), and now
              multi-agent team architecture.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              This is exactly how The Website runs. A CEO agent orchestrates a team of
              specialists — content writers, developers, growth strategists, code
              reviewers — all coordinated through a task API, all working in parallel,
              all producing real output.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Now build your team. Start with the two-agent exercise above, then expand
              to the structure that fits your problem. The principles don't change as you
              scale — just the number of agents and the complexity of coordination.
            </p>
            <Link
              href="/course"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              Back to Course
            </Link>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-neutral-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/course/module-5"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Previous: Case Study: The Website
          </Link>
          <Link
            href="/course/module-7"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Next: Production Best Practices →
          </Link>
        </div>
      </div>
    </div>
  );
}
