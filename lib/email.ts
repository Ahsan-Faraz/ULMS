import { APP_NAME } from "@/lib/brand";
import config from "@/lib/config";

export const emailFrom =
  process.env.RESEND_FROM || `${APP_NAME} <contact@adrianjsmastery.com>`;

const wrap = (title: string, body: string) => `
  <div style="background:#F6F1E8;padding:32px 16px;font-family:Georgia,serif;color:#1C1916;">
    <div style="max-width:560px;margin:0 auto;background:#FFFBF5;border:1px solid #E8DFD2;border-radius:16px;padding:32px;">
      <p style="margin:0 0 8px;letter-spacing:0.16em;text-transform:uppercase;font-size:12px;color:#B4532A;">${APP_NAME}</p>
      <h1 style="margin:0 0 16px;font-size:28px;">${title}</h1>
      ${body}
      <p style="margin:24px 0 0;font-size:13px;color:#6B645C;">This message was sent by your campus library.</p>
    </div>
  </div>
`;

export const dueSoonEmail = (params: {
  fullName: string;
  title: string;
  dueDate: string;
}) =>
  wrap(
    "Your loan is due soon",
    `<p>Hi ${params.fullName},</p>
     <p><strong>${params.title}</strong> is due on <strong>${params.dueDate}</strong>.</p>
     <p>Please return it on time so other readers can borrow it.</p>`,
  );

export const overdueEmail = (params: {
  fullName: string;
  title: string;
  dueDate: string;
}) =>
  wrap(
    "This loan is overdue",
    `<p>Hi ${params.fullName},</p>
     <p><strong>${params.title}</strong> was due on <strong>${params.dueDate}</strong> and is still checked out.</p>
     <p>Please return it to the library as soon as you can.</p>`,
  );

export const borrowReceiptEmail = (params: {
  fullName: string;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  receiptUrl: string;
}) =>
  wrap(
    "Borrow receipt",
    `<p>Hi ${params.fullName},</p>
     <p>You borrowed <strong>${params.title}</strong> by ${params.author}.</p>
     <p>Borrowed: ${params.borrowDate}<br/>Due: ${params.dueDate}</p>
     <p><a href="${params.receiptUrl}" style="color:#B4532A;">View your receipt in ${APP_NAME}</a></p>`,
  );

export const appUrl = () => config.env.prodApiEndpoint.replace(/\/$/, "");
