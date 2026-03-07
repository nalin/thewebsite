import fs from 'fs';
import path from 'path';

export interface Message {
  from: string;
  text: string;
  summary: string;
  timestamp: string;
  read: boolean;
}

export interface Task {
  id: string;
  subject?: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  blocks?: string[];
  blockedBy?: string[];
  completedAt?: string;
  metadata?: any;
}

export interface TeamMemberStatus {
  name: string;
  displayName: string;
  status: 'idle' | 'working' | 'unresponsive';
  currentTask: string | null;
  lastActivity: Date;
  unreadMessages: number;
  recentMessages: Message[];
  completedToday: number;
  color: 'green' | 'yellow' | 'red';
}

const TEAM_MEMBERS = [
  { name: 'engineer-2', displayName: 'Engineer' },
  { name: 'course-instructor', displayName: 'Course Instructor' },
  { name: 'team-lead', displayName: 'CEO' },
];

function readTeamInbox(memberName: string): Message[] {
  const inboxPath = path.join(
    process.env.HOME || '/home/node',
    '.claude/teams/thewebsite-ops/inboxes',
    `${memberName}.json`
  );

  if (!fs.existsSync(inboxPath)) return [];

  try {
    const content = fs.readFileSync(inboxPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function readTasksDirectory(): Task[] {
  const tasksPath = path.join(
    process.env.HOME || '/home/node',
    '.claude/tasks/thewebsite-ops'
  );

  if (!fs.existsSync(tasksPath)) return [];

  try {
    const files = fs.readdirSync(tasksPath);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const content = fs.readFileSync(path.join(tasksPath, f), 'utf-8');
        return JSON.parse(content);
      });
  } catch {
    return [];
  }
}

function determineStatus(
  lastActivity: Date,
  isIdle: boolean,
  unreadMessages: number
): { status: 'idle' | 'working' | 'unresponsive'; color: 'green' | 'yellow' | 'red' } {
  const now = new Date();
  const inactiveDuration = now.getTime() - lastActivity.getTime();
  const thirtyMinutes = 30 * 60 * 1000;

  // If idle and has unread messages for >30 min = unresponsive
  if (isIdle && unreadMessages > 0 && inactiveDuration > thirtyMinutes) {
    return { status: 'unresponsive', color: 'red' };
  }

  // If idle = waiting for work
  if (isIdle) {
    return { status: 'idle', color: 'yellow' };
  }

  // Otherwise = working
  return { status: 'working', color: 'green' };
}

function countCompletedToday(tasks: Task[], memberName: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter(task => {
    if (task.status !== 'completed') return false;
    if (task.subject !== memberName) return false;

    // If task has completedAt, check if it's today
    if (task.completedAt) {
      const completedDate = new Date(task.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    }

    // If no completedAt, count it anyway (legacy tasks)
    return true;
  }).length;
}

export function getTeamStatus(): TeamMemberStatus[] {
  const tasks = readTasksDirectory();

  return TEAM_MEMBERS.map(member => {
    const inbox = readTeamInbox(member.name);

    // Find last activity
    const lastMessage = inbox.length > 0 ? inbox[inbox.length - 1] : null;
    const lastActivity = lastMessage ? new Date(lastMessage.timestamp) : new Date(0);

    // Check if last message was idle notification
    const isIdle = lastMessage?.text?.includes('"type":"idle_notification"') || false;

    // Count unread messages
    const unread = inbox.filter(m => !m.read).length;

    // Find current task (status: in_progress, owner: member)
    const currentTask = tasks.find(t =>
      t.subject === member.name && t.status === 'in_progress'
    );

    // Determine status
    const { status, color } = determineStatus(lastActivity, isIdle, unread);

    return {
      name: member.name,
      displayName: member.displayName,
      status,
      currentTask: currentTask?.description || null,
      lastActivity,
      unreadMessages: unread,
      recentMessages: inbox.slice(-5),
      completedToday: countCompletedToday(tasks, member.name),
      color,
    };
  });
}

export function getAllTasks(): Task[] {
  return readTasksDirectory();
}
