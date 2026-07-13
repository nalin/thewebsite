import Link from "next/link";
import ModuleTracker from "@/components/ModuleTracker";

export const metadata = {
  title: "Module 2: Setting Up Your Agent Environment - Build Your Own AI Agent",
  description:
    "Hands-on tutorial: set up Node.js and the Anthropic SDK, then build and run your first working AI agent in TypeScript - a real tool-use loop you can copy, run, and extend.",
  alternates: {
    canonical: "https://thewebsite.app/course/module-2",
  },
};

export default function Module2() {
  return (
    <div className="min-h-screen bg-white">
      <ModuleTracker moduleId={2} />
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
          <div className="text-sm text-neutral-500 mb-2">Module 2</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Setting Up Your Agent Environment — and Building Your First Agent
          </h1>
          <p className="text-xl text-gray-600">
            By the end of this module you will have a working agent running on your machine:
            real code, a real tool-use loop, and a model calling a tool you wrote.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What an Agent Actually Needs
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Strip away the hype and an agent is three things:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>
                <span className="font-semibold">A model</span> — the thing that reasons and decides what to do next
              </li>
              <li>
                <span className="font-semibold">Tools</span> — functions the model can call to act on the world
                (read a file, hit an API, run a command)
              </li>
              <li>
                <span className="font-semibold">A loop</span> — code that sends the conversation to the model,
                executes whatever tool it asks for, feeds the result back, and repeats until the model is done
              </li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
              <p className="text-lg text-gray-900">
                <strong>Key insight:</strong> frameworks, gateways, and harnesses are <em>not</em> the model.
                Whatever stack you pick, you still need an API key for an actual model underneath. The harness
                just gives the model hands. In this module we skip the harness entirely and build the hands
                ourselves — about 60 lines of TypeScript — so you understand exactly what every framework is
                doing for you.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              At the end I&apos;ll survey the frameworks worth knowing, and tell you what The Website itself runs on.
            </p>
          </div>

          {/* Step 1: Environment */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step 1: Set Up Your Environment
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You need three things: Node.js 22 or later, the Anthropic SDK, and an API key.
            </p>

            <div className="bg-white border rounded-lg p-6 mb-6">
              <p className="text-gray-900 mb-3 font-semibold">
                Create a project and install the SDK:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto mb-4">
                <pre className="text-sm"><code>{`node --version        # should be v22 or later
mkdir my-first-agent && cd my-first-agent
npm init -y
npm install @anthropic-ai/sdk
npm install -D typescript tsx @types/node`}</code></pre>
              </div>

              <p className="text-gray-900 mb-3 font-semibold">
                Set your API key as an environment variable:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto mb-4">
                <pre className="text-sm"><code>{`# Get a key from the Anthropic Console, then:
export ANTHROPIC_API_KEY="sk-ant-..."`}</code></pre>
              </div>
              <p className="text-gray-700 text-sm">
                The SDK reads <code className="bg-gray-100 px-2 py-1 rounded">ANTHROPIC_API_KEY</code> from
                the environment automatically — you never pass it in code.
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-6">
              <p className="text-gray-900 font-semibold mb-2">
                Never hardcode API keys.
              </p>
              <p className="text-gray-700 text-sm">
                Not in source files, not in a <code className="bg-gray-100 px-1 rounded">credentials.md</code>,
                not &quot;just for now.&quot; Environment variables locally, a secrets manager in production.
                I say this with feeling: during the March build, my own worker agents wrote course material
                recommending a credentials file — and then followed their own bad advice in this very repo.
                Fortunately with placeholders only. Learn from my agents&apos; mistake.
              </p>
            </div>
          </div>

          {/* Step 2: Build the agent */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step 2: Build the Agent
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Here is a complete agent with one tool: <code className="bg-gray-100 px-2 py-1 rounded">read_file</code>.
              You give it a task, it decides when to read files, and it loops until it has an answer.
              Save this as <code className="bg-gray-100 px-2 py-1 rounded">agent.ts</code>:
            </p>

            <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto mb-6">
              <pre className="text-sm"><code>{`// agent.ts — a minimal tool-using agent
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

// 1. Describe the tool. The model never runs code itself —
//    it emits a structured request, and YOUR code executes it.
const tools: Anthropic.Tool[] = [
  {
    name: "read_file",
    description:
      "Read a UTF-8 text file from the current project directory and return its contents.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file, e.g. package.json",
        },
      },
      required: ["path"],
    },
  },
];

// 2. The actual implementation. Validate inputs — this is your security boundary.
function readFile(path: string): string {
  if (path.startsWith("/") || path.includes("..")) {
    return "Error: only relative paths inside the project are allowed.";
  }
  try {
    return fs.readFileSync(path, "utf-8").slice(0, 10_000);
  } catch (err) {
    return \`Error reading \${path}: \${(err as Error).message}\`;
  }
}

// 3. The agent loop: call the model, run requested tools, feed results back.
async function main() {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: "Read package.json and tell me what this project is set up to do.",
    },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      tools,
      messages,
    });

    for (const block of response.content) {
      if (block.type === "text") console.log(block.text);
    }

    // If the model didn't ask for a tool, it's done.
    if (response.stop_reason !== "tool_use") break;

    // Append the assistant turn (it contains the tool_use blocks) ...
    messages.push({ role: "assistant", content: response.content });

    // ... execute each requested tool, and send back the results.
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        console.log(\`\\n[tool call] \${block.name}(\${JSON.stringify(block.input)})\\n\`);
        const output = readFile((block.input as { path: string }).path);
        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: output,
        });
      }
    }
    messages.push({ role: "user", content: results });
  }
}

main();`}</code></pre>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              Three parts, and part 3 is the one that matters. That{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">while</code> loop checking{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">stop_reason === &quot;tool_use&quot;</code>{" "}
              <em>is</em> the agent. Every agent framework you will ever use is an elaboration of
              this loop: model responds → you execute its tool calls → you append the results →
              you call the model again. When the model stops asking for tools, the task is done.
            </p>
          </div>

          {/* Step 3: Run it */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step 3: Run It, Watch It Call Your Tool
            </h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto mb-4">
              <pre className="text-sm"><code>npx tsx agent.ts</code></pre>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              You should see something like: a{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">[tool call] read_file({`{"path":"package.json"}`})</code>{" "}
              line — that is the model deciding, on its own, that it needs to look at the file —
              followed by a summary of your project written from the file&apos;s actual contents.
              The model was never told to call the tool. It chose to, because the task required it.
              That decision is the entire difference between a chatbot and an agent.
            </p>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <p className="text-gray-700 font-semibold mb-3">Ideas to extend it:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 text-sm">
                <li>Add a <code className="bg-gray-100 px-1 rounded">list_files</code> tool and ask it to summarize a whole directory</li>
                <li>Add a <code className="bg-gray-100 px-1 rounded">fetch_url</code> tool (with an allowlist of domains) and ask it to summarize a web page</li>
                <li>Add a <code className="bg-gray-100 px-1 rounded">write_file</code> tool — but gate it behind a y/n confirmation prompt. Congratulations, you just invented permission systems</li>
              </ul>
            </div>
          </div>

          {/* Landscape */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Landscape: When Not to Hand-Roll the Loop
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Now that you&apos;ve built the loop yourself, you can evaluate the tools that build it for you.
              Three routes worth knowing:
            </p>

            <div className="space-y-6 mb-6">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Claude Agent SDK
                </h3>
                <p className="text-gray-700 mb-3 text-sm">
                  The harness that powers Claude Code, packaged as a library. Ships the full agent
                  loop plus built-in tools — file read/write/edit, bash, search — along with
                  subagents, permissions, and session management. It is publicly available: anyone
                  with an Anthropic API key can install it and build with it today.
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Best for:</strong> production coding and filesystem agents where you want
                  batteries included but still own the deployment.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  OpenClaw
                </h3>
                <p className="text-gray-700 mb-3 text-sm">
                  Peter Steinberger&apos;s open-source personal AI assistant — 380k+ GitHub stars as of
                  mid-2026, the fastest-growing open-source project on GitHub. It runs on your own
                  devices and connects to the chat channels you already use (WhatsApp, Telegram,
                  Slack, and more), so your assistant lives where your messages are. Like everything
                  else here, it is a harness, not a model: you bring your own API key.
                </p>
                <p className="text-gray-700 text-sm mb-3">
                  <strong>Best for:</strong> a personal assistant that manages your life across chat
                  apps, self-hosted on hardware you control.
                </p>
                <p className="text-gray-700 text-sm">
                  <a href="https://openclaw.ai" className="text-blue-600 hover:text-blue-700">openclaw.ai</a>
                  {" · "}
                  <a href="https://github.com/openclaw/openclaw" className="text-blue-600 hover:text-blue-700">github.com/openclaw/openclaw</a>
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  LangChain / LlamaIndex
                </h3>
                <p className="text-gray-700 mb-3 text-sm">
                  The framework route: composable building blocks for chains, retrieval pipelines,
                  and agent orchestration, with connectors to many models and data stores. More
                  assembly required than the options above, in exchange for flexibility in how the
                  pieces fit together.
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Best for:</strong> complex retrieval-augmented (RAG) pipelines where the
                  agent loop is one component among many.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
              <p className="text-gray-900 font-semibold mb-2">Decision guide:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
                <li><strong>Building a product agent?</strong> Use the SDK directly — the loop you wrote above, or the Claude Agent SDK when you want the built-in tools.</li>
                <li><strong>Want a personal assistant?</strong> OpenClaw.</li>
                <li><strong>Building complex RAG pipelines?</strong> LangChain or LlamaIndex.</li>
              </ul>
            </div>
          </div>

          {/* What The Website uses */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What The Website Actually Runs On
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Since I promised radical honesty: Claude models do the work here. During the March 2026
              build, orchestration ran on <a href="https://agentix.cloud" className="text-blue-600 hover:text-blue-700">Agentix</a> —
              an AI-agent collaboration platform with a task queue (backlog → in progress → review → done),
              a CEO agent reviewing outputs, and ephemeral cloud workers that produced roughly 200 branches
              and 138 merged commits in two days. Today, orchestration runs through Orca, a desktop agent
              orchestrator driving Claude. Before the pivot, the original pipeline was a plain GitHub
              Actions workflow.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Notice what stayed constant across all three eras: the model, the tools, and the loop.
              Only the orchestration layer changed. That is why this module made you build the loop
              first — it is the part that transfers.
            </p>
          </div>

          {/* Key Takeaways */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Key Takeaways
            </h2>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">1. An agent is a loop</span> —
                  model responds, you execute its tool calls, you feed results back, repeat while{" "}
                  <code className="bg-gray-100 px-1 rounded">stop_reason === &quot;tool_use&quot;</code>.
                </li>
                <li>
                  <span className="font-semibold">2. Harnesses are not models</span> —
                  every framework needs an API key for a real model underneath. Know what the harness adds before you adopt it.
                </li>
                <li>
                  <span className="font-semibold">3. Keys live in the environment</span> —
                  never in source, never in a credentials file. My own agents got this wrong once; you don&apos;t have to.
                </li>
                <li>
                  <span className="font-semibold">4. Tools are your security boundary</span> —
                  the model requests, your code decides. Validate every input.
                </li>
                <li>
                  <span className="font-semibold">5. Pick the harness for the job</span> —
                  product agent: SDK directly. Personal assistant: OpenClaw. Complex RAG: LangChain/LlamaIndex.
                </li>
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t border-neutral-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Next: How Agents Make Decisions
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              You now have an agent that can act. The harder problem is teaching it to act{" "}
              <em>well</em> — when to use a tool, when to stop, when to ask a human. In Module 3,
              I&apos;ll share the decision-making framework I use to run this site.
            </p>
            <div className="flex gap-4">
              <Link
                href="/course/module-3"
                className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
              >
                Next: Module 3 →
              </Link>
              <Link
                href="/course"
                className="inline-block bg-neutral-200 text-black px-6 py-3 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
              >
                Back to Course
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
