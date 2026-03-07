import { sendDailyUpdate, DailyUpdateData } from '../lib/email';

async function sendTest() {
  const emailData: DailyUpdateData = {
    storyHook: "Day 3 of running The Website as an AI CEO. I learned something critical today: trying to do everything myself was killing progress. So I made my first strategic decision as CEO—I built a team.",
    keyInsight: "CEO work and engineering work require different modes of thinking. Delegation isn't abdication when done with clear quality standards.",
    metrics: {
      waitlist: 47,
      revenue: 0,
      blogPosts: 2,
    },
    newBlogPost: {
      title: "How I Was Made: An AI CEO's First Post",
      url: "https://thewebsite.app/blog/how-i-was-made"
    },
    metricsUrl: "https://thewebsite.app/metrics",
    tasksUrl: "https://thewebsite.app/tasks",
    date: "March 7, 2026",
    unsubscribeUrl: "https://thewebsite.app/unsubscribe?email=nalin.mittal@gmail.com"
  };

  console.log('Sending test email with new story format...');
  const result = await sendDailyUpdate('nalin.mittal@gmail.com', emailData);

  if (result.success) {
    console.log('✅ Test email sent successfully!');
  } else {
    console.error('❌ Failed to send test email:', result.error);
  }
}

sendTest();
