import jwt from "jsonwebtoken";
import { db } from "./db";
import { accounts } from "./schema";
import { eq } from "drizzle-orm";

const REPO_OWNER = "nalin";
const REPO_NAME = "thewebsite";
const API_BASE = "https://api.github.com";

// --- Installation Token (bot identity) ---

let cachedInstallationToken: { token: string; expiresAt: number } | null = null;

export async function getInstallationToken(): Promise<string> {
  if (
    cachedInstallationToken &&
    cachedInstallationToken.expiresAt > Date.now() + 60_000
  ) {
    return cachedInstallationToken.token;
  }

  const appId = process.env.GITHUB_APP_ID!;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID!;

  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now - 60, exp: now + 600, iss: appId };
  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

  const res = await fetch(
    `${API_BASE}/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get installation token: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedInstallationToken = {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  };

  return data.token;
}

// --- User Token ---

export async function getUserToken(userId: string): Promise<string | null> {
  const account = await db
    .select({
      accessToken: accounts.access_token,
      refreshToken: accounts.refresh_token,
      expiresAt: accounts.expires_at,
    })
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .get();

  if (!account?.accessToken) return null;

  // Check if token is expired (expires_at is in seconds)
  if (account.expiresAt && account.expiresAt * 1000 < Date.now()) {
    if (!account.refreshToken) return null;
    return refreshUserToken(userId, account.refreshToken);
  }

  return account.accessToken;
}

async function refreshUserToken(
  userId: string,
  refreshToken: string
): Promise<string | null> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.AUTH_GITHUB_ID,
      client_secret: process.env.AUTH_GITHUB_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (data.error) return null;

  // Update stored tokens
  await db
    .update(accounts)
    .set({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    })
    .where(eq(accounts.userId, userId));

  return data.access_token;
}

// --- GitHub Issues API ---

export async function createIssue(
  userToken: string,
  title: string,
  body: string,
  labels: string[]
): Promise<{ number: number; html_url: string }> {
  const res = await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ title, body, labels }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create issue: ${res.status} ${text}`);
  }

  return res.json();
}

export async function listIssues(): Promise<GitHubIssue[]> {
  const token = await getInstallationToken();
  const issues: GitHubIssue[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=100&page=${page}&labels=feature,bug`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!res.ok) break;

    const data = await res.json();
    if (data.length === 0) break;

    // Filter out pull requests (GitHub API returns PRs in issues endpoint)
    issues.push(...data.filter((i: GitHubIssue) => !i.pull_request));
    if (data.length < 100) break;
    page++;
  }

  return issues;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  labels: Array<{ name: string }>;
  reactions: {
    "+1": number;
    "-1": number;
    total_count: number;
  };
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  pull_request?: unknown;
}

// --- Reactions API ---

export async function addReaction(
  userToken: string,
  issueNumber: number,
  reaction: "+1" | "-1"
): Promise<{ id: number }> {
  const res = await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/reactions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ content: reaction }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to add reaction: ${res.status} ${text}`);
  }

  return res.json();
}

export async function removeReaction(
  userToken: string,
  issueNumber: number,
  reactionId: number
): Promise<void> {
  await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/reactions/${reactionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
}

export async function getUserReaction(
  userToken: string,
  issueNumber: number
): Promise<{ id: number; content: string } | null> {
  // Get the authenticated user's login
  const userRes = await fetch(`${API_BASE}/user`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  if (!userRes.ok) return null;
  const user = await userRes.json();

  // List reactions and find the user's
  const res = await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/reactions?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) return null;

  const reactions = await res.json();
  const userReaction = reactions.find(
    (r: { user: { login: string }; content: string; id: number }) =>
      r.user.login === user.login && (r.content === "+1" || r.content === "-1")
  );

  return userReaction
    ? { id: userReaction.id, content: userReaction.content }
    : null;
}

// --- Labels API (for bot actions) ---

export async function addLabel(
  issueNumber: number,
  label: string
): Promise<void> {
  const token = await getInstallationToken();
  await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/labels`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ labels: [label] }),
    }
  );
}

export async function addComment(
  issueNumber: number,
  body: string
): Promise<void> {
  const token = await getInstallationToken();
  await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ body }),
    }
  );
}
