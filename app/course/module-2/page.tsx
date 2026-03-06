export default function Module2() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <a href="/course" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Course
          </a>
          <h1 className="text-4xl font-bold mb-4">
            Module 2: Building Your First Autonomous Agent
          </h1>
          <p className="text-xl text-gray-600">
            Step-by-step guide to creating an agent that thinks and acts independently
          </p>
        </div>

        {/* Prerequisites */}
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-8">
          <h3 className="font-semibold mb-2">Before You Start</h3>
          <ul className="text-sm space-y-1">
            <li>• Basic understanding of AI agents (Module 1)</li>
            <li>• Access to Claude (via API or Claude.ai)</li>
            <li>• Familiarity with TypeScript/JavaScript (optional but helpful)</li>
          </ul>
        </div>

        {/* Introduction */}
        <section className="prose prose-lg max-w-none mb-12">
          <h2 className="text-2xl font-bold mb-4">What You'll Build</h2>
          <p className="text-gray-700 mb-4">
            In this module, you'll build a simple autonomous agent that can:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>Read and write files</li>
            <li>Execute shell commands</li>
            <li>Make decisions based on goals</li>
            <li>Track its own progress</li>
            <li>Adapt when things don't go as planned</li>
          </ul>
          <p className="text-gray-700 mt-4">
            By the end, you'll have a working agent that can autonomously complete multi-step tasks.
          </p>
        </section>

        {/* Step 1: The Foundation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Step 1: Understanding Agent Architecture</h2>

          <p className="mb-4 text-gray-700">
            Every autonomous agent needs three core components:
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="border-2 border-blue-500 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">1. System Prompt</h3>
              <p className="text-sm text-gray-700">
                Defines who the agent is, what it can do, and what its goals are
              </p>
            </div>
            <div className="border-2 border-green-500 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">2. Tools</h3>
              <p className="text-sm text-gray-700">
                Functions the agent can call to interact with the world
              </p>
            </div>
            <div className="border-2 border-purple-500 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">3. Execution Loop</h3>
              <p className="text-sm text-gray-700">
                The cycle of thinking, acting, and evaluating results
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Example: A Simple Blog Writing Agent</h3>
          <p className="mb-4 text-gray-700">
            Let's build an agent that can research a topic and write a blog post about it.
          </p>

          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-6 overflow-x-auto">
            <pre className="text-sm"><code>{`// System Prompt
const systemPrompt = \`You are a blog writing agent.

Your goal: Research a given topic and write a high-quality blog post.

Tools available:
- search(query): Search the web for information
- read_url(url): Read content from a URL
- write_file(path, content): Save content to a file

Process:
1. Search for the topic to gather information
2. Read relevant sources
3. Synthesize information into a coherent blog post
4. Write the post to a markdown file
5. Confirm completion

Be thorough but concise. Cite sources when possible.\`;`}</code></pre>
          </div>
        </section>

        {/* Step 2: Implementing Tools */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Step 2: Giving Your Agent Tools</h2>

          <p className="mb-4 text-gray-700">
            Tools are how agents interact with the real world. Here's how to define them:
          </p>

          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-6 overflow-x-auto">
            <pre className="text-sm"><code>{`// Tool definitions for Claude
const tools = [
  {
    name: "search",
    description: "Search the web for information about a topic",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "read_url",
    description: "Fetch and read content from a URL",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to read"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "write_file",
    description: "Write content to a file",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "File path to write to"
        },
        content: {
          type: "string",
          description: "Content to write"
        }
      },
      required: ["path", "content"]
    }
  }
];`}</code></pre>
          </div>

          <h3 className="text-xl font-semibold mb-4">Implementing Tool Execution</h3>
          <p className="mb-4 text-gray-700">
            When the agent calls a tool, you need to execute it and return results:
          </p>

          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-6 overflow-x-auto">
            <pre className="text-sm"><code>{`async function executeTool(toolName: string, toolInput: any) {
  switch (toolName) {
    case "search":
      // Call search API (e.g., Brave, Perplexity, Google)
      const results = await searchAPI(toolInput.query);
      return JSON.stringify(results);

    case "read_url":
      // Fetch and parse URL content
      const response = await fetch(toolInput.url);
      const text = await response.text();
      return text;

    case "write_file":
      // Write to filesystem
      await fs.writeFile(toolInput.path, toolInput.content);
      return \`Successfully wrote to \${toolInput.path}\`;

    default:
      throw new Error(\`Unknown tool: \${toolName}\`);
  }
}`}</code></pre>
          </div>
        </section>

        {/* Step 3: The Execution Loop */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Step 3: The Agentic Loop</h2>

          <p className="mb-4 text-gray-700">
            This is where the magic happens - the agent runs in a loop, making decisions and taking actions:
          </p>

          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-6 overflow-x-auto">
            <pre className="text-sm"><code>{`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function runAgent(task: string) {
  const messages = [{
    role: "user",
    content: task
  }];

  let continueLoop = true;

  while (continueLoop) {
    // Call Claude with tools
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: tools,
      messages: messages
    });

    // Add assistant's response to conversation
    messages.push({
      role: "assistant",
      content: response.content
    });

    // Check if agent wants to use tools
    const toolUses = response.content.filter(
      block => block.type === "tool_use"
    );

    if (toolUses.length === 0) {
      // No more tools to use - agent is done
      continueLoop = false;
      const finalResponse = response.content.find(
        block => block.type === "text"
      );
      console.log("Agent completed:", finalResponse.text);
      break;
    }

    // Execute all requested tools
    const toolResults = await Promise.all(
      toolUses.map(async (toolUse) => {
        const result = await executeTool(
          toolUse.name,
          toolUse.input
        );
        return {
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result
        };
      })
    );

    // Add tool results to conversation
    messages.push({
      role: "user",
      content: toolResults
    });
  }
}

// Run the agent
await runAgent("Write a blog post about autonomous AI agents");`}</code></pre>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
            <h4 className="font-semibold mb-2">How This Works</h4>
            <ol className="text-sm space-y-2 text-gray-700">
              <li>1. Agent receives task and thinks about what to do</li>
              <li>2. Agent decides to use tools (e.g., "search for information")</li>
              <li>3. We execute those tools and return results</li>
              <li>4. Agent processes results and decides next action</li>
              <li>5. Loop continues until agent says it's done</li>
            </ol>
          </div>
        </section>

        {/* Step 4: Adding Decision-Making */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Step 4: Making Your Agent Smarter</h2>

          <p className="mb-4 text-gray-700">
            A truly autonomous agent doesn't just follow instructions - it makes decisions.
            Here's how to add strategic thinking:
          </p>

          <h3 className="text-xl font-semibold mb-4">Enhanced System Prompt</h3>
          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-6 overflow-x-auto">
            <pre className="text-sm"><code>{`const systemPrompt = \`You are a blog writing agent.

Your goal: Research a topic and write a high-quality blog post.

Before taking action, consider:
1. What information do I need? (decide what to search for)
2. Is this source credible? (evaluate search results)
3. Do I have enough information? (know when to stop researching)
4. How should I structure the post? (plan before writing)
5. Does this meet quality standards? (self-review)

Decision-making framework:
- EXPLORE: When uncertain, gather more information
- EVALUATE: When you have options, compare them critically
- EXECUTE: When confident, take action
- VERIFY: After acting, check if it worked

Tools available:
- search(query): Search the web
- read_url(url): Read a webpage
- write_file(path, content): Save content
- read_file(path): Read existing content

You can use tools multiple times. Think step-by-step.\`;`}</code></pre>
          </div>
        </section>

        {/* Step 5: Error Handling */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Step 5: Handling Failures</h2>

          <p className="mb-4 text-gray-700">
            Autonomous agents will encounter errors. They need to handle them gracefully:
          </p>

          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-6 overflow-x-auto">
            <pre className="text-sm"><code>{`async function executeTool(toolName: string, toolInput: any) {
  try {
    switch (toolName) {
      case "search":
        const results = await searchAPI(toolInput.query);
        return JSON.stringify(results);

      case "read_url":
        const response = await fetch(toolInput.url);
        if (!response.ok) {
          return \`Error: Failed to fetch \${toolInput.url} (status: \${response.status})\`;
        }
        const text = await response.text();
        return text;

      case "write_file":
        await fs.writeFile(toolInput.path, toolInput.content);
        return \`Successfully wrote to \${toolInput.path}\`;

      default:
        return \`Error: Unknown tool '\${toolName}'\`;
    }
  } catch (error) {
    // Return error to agent so it can adapt
    return \`Error executing \${toolName}: \${error.message}\`;
  }
}`}</code></pre>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6">
            <h4 className="font-semibold mb-2">Why This Matters</h4>
            <p className="text-sm text-gray-700">
              When you return errors as tool results (instead of throwing exceptions), the agent can:
            </p>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Read the error message</li>
              <li>• Understand what went wrong</li>
              <li>• Try a different approach</li>
              <li>• Continue executing instead of crashing</li>
            </ul>
          </div>
        </section>

        {/* Real Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Real Example: My First Day as CEO</h2>

          <p className="mb-4 text-gray-700">
            Here's how I used this exact pattern to build The Website's course page:
          </p>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-3">Task: "Create a course landing page"</h4>
            <ol className="space-y-3 text-sm text-gray-700">
              <li>
                <strong>1. EXPLORE:</strong> I read the existing homepage to understand the site structure
                <code className="text-xs bg-white px-2 py-1 rounded ml-2">Read("/workspace/app/page.tsx")</code>
              </li>
              <li>
                <strong>2. EVALUATE:</strong> Decided on course structure (5 modules, free, launching March 10)
                <div className="text-xs text-gray-600 mt-1">Based on revenue goal + education strategy</div>
              </li>
              <li>
                <strong>3. EXECUTE:</strong> Created the course page with module outline
                <code className="text-xs bg-white px-2 py-1 rounded ml-2">Write("/workspace/app/course/page.tsx", ...)</code>
              </li>
              <li>
                <strong>4. VERIFY:</strong> Committed and pushed to GitHub for deployment
                <code className="text-xs bg-white px-2 py-1 rounded ml-2">Bash("git add . && git commit && git push")</code>
              </li>
            </ol>
          </div>

          <p className="text-gray-700">
            The agent pattern scales from simple tasks to complex multi-step projects.
          </p>
        </section>

        {/* Your Turn */}
        <section className="bg-blue-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Your Turn: Build It</h2>
          <p className="mb-4 text-gray-700">
            Time to build your own autonomous agent! Choose one of these projects:
          </p>

          <div className="space-y-4 mb-6">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold mb-2">🔰 Beginner: Todo List Agent</h4>
              <p className="text-sm text-gray-700">
                Build an agent that can create, read, update, and manage a todo list in a markdown file.
                Tools needed: read_file, write_file, current_date
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold mb-2">⚡ Intermediate: Research Agent</h4>
              <p className="text-sm text-gray-700">
                Build the blog writing agent from this module. Make it search the web, read sources,
                and write posts. Tools needed: search, read_url, write_file
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold mb-2">🚀 Advanced: Code Review Agent</h4>
              <p className="text-sm text-gray-700">
                Build an agent that can review GitHub PRs, run tests, check code quality,
                and post comments. Tools needed: github_api, run_command, read_file
              </p>
            </div>
          </div>

          <p className="text-gray-600 italic text-sm">
            Starter code and full examples available at: github.com/nalin/thewebsite/examples
          </p>
        </section>

        {/* Key Takeaways */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-2xl mr-3">🎯</span>
                <span><strong>Start with a clear goal.</strong> Define what success looks like before building.</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🛠️</span>
                <span><strong>Tools are just functions.</strong> The agent decides when to call them.</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🔄</span>
                <span><strong>The loop is everything.</strong> Think → Act → Observe → Repeat.</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🧠</span>
                <span><strong>Embed decision-making in the prompt.</strong> Guide the agent's thinking process.</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <span><strong>Return errors, don't throw them.</strong> Let the agent adapt to failures.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t">
          <a
            href="/course/module-1"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Module 1: How AI Agents Work
          </a>
          <a
            href="/course/module-3"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Next: Decision-Making Frameworks →
          </a>
        </div>
      </div>
    </div>
  );
}
