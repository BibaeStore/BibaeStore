import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendClientWelcomeEmail = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  return await resend.emails.send({
    from: 'Bibaé Store <onboarding@resend.dev>',
    to: email,
    subject: `Your Bibaé Journey Begins, ${name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #fcfcfc; }
          .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #f0f0f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
          .header { background-color: #C5A059; padding: 60px 40px; text-align: center; color: white; }
          .brand { font-size: 24px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
          .content { padding: 50px 40px; text-align: center; }
          .title { font-size: 28px; font-weight: 800; color: #1a1a1a; margin-bottom: 24px; line-height: 1.2; }
          .subtitle { color: #666; font-size: 16px; margin-bottom: 32px; }
          .cta { display: inline-block; padding: 18px 44px; background-color: #1a1a1a; color: #ffffff !important; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; }
          .features { margin-top: 50px; padding: 30px; background: #fafafa; border-radius: 20px; text-align: left; }
          .feature { display: flex; align-items: center; margin-bottom: 15px; font-size: 14px; color: #444; }
          .dot { width: 6px; height: 6px; background: #C5A059; border-radius: full; margin-right: 12px; }
          .footer { padding: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #f8f8f8; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1 class="brand">BIBAÉ</h1>
          </div>
          <div class="content">
            <h2 class="title">Welcome to the Inner Circle, ${name}</h2>
            <p class="subtitle">Experience the pinnacle of boutique shopping. Your new account is active and ready for your first collection discovery.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bibaestore.com'}" class="cta">Explore Collections</a>
            <div class="features">
              <div class="feature"><div class="dot"></div> Exclusive first-access to limited drops</div>
              <div class="feature"><div class="dot"></div> Personalized style recommendations</div>
              <div class="feature"><div class="dot"></div> Dedicated member support concierge</div>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BIBAÉ STORE PREMIUM. ALL RIGHTS RESERVED.</p>
            <p>200 E. BIG BEAVER RD. TROY, MI 48083 USA</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendAdminNewUserEmail = async ({
  email,
  name,
  phone,
}: {
  email: string;
  name: string;
  phone: string;
}) => {
  return await resend.emails.send({
    from: 'Bibaé System <onboarding@resend.dev>',
    to: 'bibaestore@gmail.com',
    subject: `✨ New Client Registration: ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f4f4f4; padding: 20px; }
          .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; border-left: 6px solid #C5A059; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .tag { display: inline-block; padding: 4px 12px; background: #fcf9f2; color: #C5A059; font-size: 10px; font-weight: 800; text-transform: uppercase; border-radius: 100px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
          .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
          .btn { display: block; text-align: center; padding: 15px; background: #1a1a1a; color: #fff !important; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="tag">System Notification</div>
          <h2 class="title">New Client Aboard</h2>
          <div class="info-row">
            <span class="label">Name</span>
            <span class="value">${name}</span>
          </div>
          <div class="info-row">
            <span class="label">Email</span>
            <span class="value">${email}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone</span>
            <span class="value">${phone}</span>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/customers" class="btn">View in Dashboard</a>
        </div>
      </body>
      </html>
    `,
  });
};
