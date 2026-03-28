import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "AiUseStore <info@aiusestore.com>";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendSellerApprovedEmail(email: string, fullName: string) {
  const safeName = escapeHtml(fullName);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "【AiUseStore】出品者アカウントが承認されました",
    html: `
      <div style="font-family: 'Helvetica Neue', 'Hiragino Sans', 'Meiryo', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; color: #111;">AiUseStore</h1>
        </div>
        <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
          <h2 style="font-size: 18px; font-weight: bold; color: #111; margin: 0 0 16px;">
            出品者アカウントが承認されました
          </h2>
          <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            ${safeName} 様
          </p>
          <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            出品者審査が完了し、アカウントが承認されました。<br>
            記事の投稿が可能になりました。
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://aiusestore.com/sell/new"
               style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold;">
              記事を投稿する
            </a>
          </div>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          &copy; AiUseStore - AI活用ノウハウマーケット
        </p>
      </div>
    `,
  });
}

export async function sendSellerRejectedEmail(
  email: string,
  fullName: string,
  reason: string
) {
  const safeName = escapeHtml(fullName);
  const safeReason = escapeHtml(reason);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "【AiUseStore】出品者申請について",
    html: `
      <div style="font-family: 'Helvetica Neue', 'Hiragino Sans', 'Meiryo', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; color: #111;">AiUseStore</h1>
        </div>
        <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
          <h2 style="font-size: 18px; font-weight: bold; color: #111; margin: 0 0 16px;">
            出品者申請について
          </h2>
          <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            ${safeName} 様
          </p>
          <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            審査の結果、現時点では承認を見送らせていただきました。
          </p>
          <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
            <p style="color: #991b1b; font-size: 13px; margin: 0;">
              <strong>理由:</strong> ${safeReason}
            </p>
          </div>
          <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0;">
            内容を修正の上、再度お申し込みいただくことが可能です。
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          &copy; AiUseStore - AI活用ノウハウマーケット
        </p>
      </div>
    `,
  });
}
