import { getTeamStatus, getAllTasks, type TeamMemberStatus, type Task } from '@/lib/team-status';
import { Header } from '@/components/Header';

export const revalidate = 30; // Refresh every 30 seconds

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function TeamMemberCard({ member }: { member: TeamMemberStatus }) {
  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const statusText = {
    working: 'Working',
    idle: 'Idle',
    unresponsive: 'Unresponsive',
  };

  return (
    <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-900/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{member.displayName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-3 h-3 rounded-full ${statusColors[member.color]}`} />
            <span className="text-sm text-neutral-400">{statusText[member.status]}</span>
          </div>
        </div>
        {member.unreadMessages > 0 && (
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {member.unreadMessages} unread
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-neutral-500 mb-1">CURRENT TASK</div>
          <div className="text-sm text-white">
            {member.currentTask || <span className="text-neutral-500">No active task</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-neutral-500">LAST ACTIVE</div>
            <div className="text-white">{formatRelativeTime(member.lastActivity)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">COMPLETED TODAY</div>
            <div className="text-white">{member.completedToday}</div>
          </div>
        </div>

        {member.recentMessages.length > 0 && (
          <details className="mt-4">
            <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400">
              Recent messages ({member.recentMessages.length})
            </summary>
            <div className="mt-2 space-y-2">
              {member.recentMessages.slice(-3).reverse().map((msg, i) => (
                <div key={i} className="text-xs border-l-2 border-neutral-700 pl-2">
                  <div className="text-neutral-500">{formatRelativeTime(new Date(msg.timestamp))}</div>
                  <div className="text-neutral-300">{msg.summary}</div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function TaskQueueView({ tasks }: { tasks: Task[] }) {
  const groupedByOwner = tasks.reduce((acc, task) => {
    const owner = task.subject || 'unassigned';
    if (!acc[owner]) acc[owner] = [];
    acc[owner].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const members = ['engineer', 'course-instructor', 'team-lead'];

  return (
    <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-900/50">
      <h2 className="text-2xl font-bold text-white mb-6">Task Queue</h2>
      <div className="space-y-6">
        {members.map(owner => {
          const memberTasks = groupedByOwner[owner] || [];
          const inProgress = memberTasks.filter(t => t.status === 'in_progress');
          const pending = memberTasks.filter(t => t.status === 'pending');

          return (
            <div key={owner}>
              <h3 className="text-lg font-semibold text-white mb-3 capitalize">
                {owner.replace('-', ' ')}
              </h3>
              <div className="space-y-2">
                {inProgress.map(task => (
                  <div key={task.id} className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded p-3">
                    <div className="text-blue-400 text-xs font-bold mt-1">IN PROGRESS</div>
                    <div className="flex-1 text-sm text-white">{task.description}</div>
                  </div>
                ))}
                {pending.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-start gap-3 border border-neutral-700 rounded p-3">
                    <div className="text-neutral-500 text-xs mt-1">PENDING</div>
                    <div className="flex-1 text-sm text-neutral-300">{task.description}</div>
                  </div>
                ))}
                {inProgress.length === 0 && pending.length === 0 && (
                  <div className="text-sm text-neutral-500">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityTimeline({ teamStatus }: { teamStatus: TeamMemberStatus[] }) {
  const allActivity = teamStatus.flatMap(member =>
    member.recentMessages.map(msg => ({
      member: member.displayName,
      ...msg,
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-900/50">
      <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
      <div className="space-y-3">
        {allActivity.slice(0, 20).map((activity, i) => (
          <div key={i} className="flex items-start gap-4 border-b border-neutral-800 pb-3">
            <div className="text-xs text-neutral-500 w-20 shrink-0">
              {formatRelativeTime(new Date(activity.timestamp))}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{activity.member}</div>
              <div className="text-sm text-neutral-300">{activity.summary}</div>
            </div>
          </div>
        ))}
        {allActivity.length === 0 && (
          <div className="text-sm text-neutral-500">No recent activity</div>
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const teamStatus = getTeamStatus();
  const tasks = getAllTasks();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Team Dashboard</h1>
          <p className="text-neutral-400">Real-time visibility into team operations</p>
        </div>

        {/* Team Status Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {teamStatus.map(member => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </div>

        {/* Task Queue */}
        <div className="mb-12">
          <TaskQueueView tasks={tasks} />
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline teamStatus={teamStatus} />
      </div>
    </div>
  );
}
