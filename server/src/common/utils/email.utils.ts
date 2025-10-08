export class EmailUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static generateEmailTemplate(
    title: string,
    content: string,
    actionUrl?: string,
    actionText?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Al-Abraar</h1>
              <h2>${title}</h2>
            </div>
            <div class="content">
              ${content}
              ${actionUrl && actionText ? `<div style="text-align: center;"><a href="${actionUrl}" class="button">${actionText}</a></div>` : ''}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Al-Abraar Online Modrasah. All rights reserved.</p>
              <p>If you have any questions, contact us at alabraaracademy.ng@gmail.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}