const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Team mein add hone par
const sendTeamAddEmail = async (memberEmail, memberName, managerName) => {
  console.log("=== TEAM ADD EMAIL CALLED ===");
  console.log("To:", memberEmail);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
  try {
    await transporter.sendMail({
      from: `"TaskPrio" <${process.env.EMAIL_USER}>`,
      to: memberEmail,
      subject: "You have been added to a new team!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h1 style="color: #a78bfa;">⚡ TaskPrio</h1>
          <h2>Welcome to the team, ${memberName}!</h2>
          <p>You have been added to <strong style="color: #a78bfa;">${managerName}</strong>'s team on TaskPrio.</p>
          <p>You will now receive task assignments and notifications.</p>
          <a href="https://task-pro-ai.vercel.app/" 
             style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Dashboard
          </a>
          <p style="color: #6b7280; margin-top: 24px; font-size: 12px;">TaskPrio — AI Powered Task Management</p>
        </div>
      `,
    });
    console.log(`Team add email sent to ${memberEmail}`);
  } catch (error) {
    console.error(`Error sending team add email:`, error.message);
  }
};

// Task assign hone par
const sendTaskAssignEmail = async (memberEmail, memberName, taskTitle, deadline, managerName) => {
  console.log("=== TASK ASSIGN EMAIL CALLED ===");
  console.log("To:", memberEmail);
  try {
    const deadlineStr = new Date(deadline).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    await transporter.sendMail({
      from: `"TaskPrio" <${process.env.EMAIL_USER}>`,
      to: memberEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h1 style="color: #a78bfa;">⚡ TaskPrio</h1>
          <h2>New Task Assigned!</h2>
          <p>Hello <strong>${memberName}</strong>,</p>
          <p>You have been assigned a new task by <strong style="color: #a78bfa;">${managerName}</strong>.</p>
          <div style="background: #1e1e2e; border-left: 4px solid #7c3aed; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin-top: 0;">${taskTitle}</h3>
            <p style="margin: 0; color: #9ca3af;">📅 Deadline: <strong style="color:#fbbf24;">${deadlineStr}</strong></p>
          </div>
          <a href="https://task-pro-ai.vercel.app/" 
             style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Task
          </a>
          <p style="color: #6b7280; margin-top: 24px; font-size: 12px;">TaskPrio — AI Powered Task Management</p>
        </div>
      `,
    });
    console.log(`Task assignment email sent to ${memberEmail}`);
  } catch (error) {
    console.error(`Error sending task assignment email:`, error.message);
  }
};

// Deadline reminder — 1 din baaki
const sendDeadlineReminderEmail = async (memberEmail, memberName, taskTitle, deadline) => {
  try {
    const deadlineStr = new Date(deadline).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    await transporter.sendMail({
      from: `"TaskPrio" <${process.env.EMAIL_USER}>`,
      to: memberEmail,
      subject: `⚠️ Reminder: "${taskTitle}" is due tomorrow!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h1 style="color: #a78bfa;">⚡ TaskPrio</h1>
          <h2 style="color: #f87171;">⚠️ Deadline Reminder!</h2>
          <p>Hi <strong>${memberName}</strong>,</p>
          <p>Your task is due <strong style="color: #f87171;">tomorrow</strong>!</p>
          <div style="background: #450a0a; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="color: #fca5a5; margin: 0 0 8px 0;">${taskTitle}</h3>
            <p style="margin: 0; color: #fca5a5;">📅 Due: <strong>${deadlineStr}</strong></p>
          </div>
          <p>Please complete and submit your work as soon as possible.</p>
          <a href="https://task-pro-ai.vercel.app/" 
             style="display: inline-block; background: #ef4444; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Complete Task Now
          </a>
          <p style="color: #6b7280; margin-top: 24px; font-size: 12px;">TaskPrio — AI Powered Task Management</p>
        </div>
      `,
    });
    console.log(`Deadline reminder sent to ${memberEmail}`);
  } catch (err) {
    console.error("Deadline email error:", err.message);
  }
};

module.exports = { sendTeamAddEmail, sendTaskAssignEmail, sendDeadlineReminderEmail };