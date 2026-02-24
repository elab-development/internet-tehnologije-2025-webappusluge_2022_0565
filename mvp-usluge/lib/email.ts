import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'MVP Usluge <noreply@mvp-usluge.com>';

/**
 * Helper funkcija za slanje email-a
 */
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

/**
 * 1. Welcome email nakon registracije
 */
export async function sendWelcomeEmail(to: string, firstName: string) {
  const subject = 'Dobrodošli na MVP Usluge! 🎉';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Dobrodošli na MVP Usluge!</h1>
          </div>
          <div class="content">
            <p>Zdravo ${firstName},</p>
            <p>Hvala što ste se registrovali na našu platformu! 🎉</p>
            <p>Sada možete:</p>
            <ul>
              <li>🔍 Pretraživati usluge u vašem gradu</li>
              <li>📅 Zakazivati termine kod najboljih pružalaca</li>
              <li>⭐ Ocenjivati usluge i deliti iskustva</li>
              <li>💼 Upravljati svojim rezervacijama</li>
            </ul>
            <a href="${process.env.NEXTAUTH_URL}/services" class="button" style="color: white;">
              Pregledaj usluge
            </a>
            <p>Ako imate bilo kakvih pitanja, slobodno nas kontaktirajte.</p>
            <p>Srdačan pozdrav,<br>MVP Usluge Tim</p>
          </div>
          <div class="footer">
            <p>© 2024 MVP Usluge. Sva prava zadržana.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(to, subject, html);
}

/**
 * 2. Notifikacija pružaocu o novoj rezervaciji
 */
export async function sendNewBookingNotification(
  providerEmail: string,
  providerName: string,
  bookingDetails: {
    clientName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    clientNotes?: string;
    bookingId: string;
  }
) {
  const subject = '🔔 Nova rezervacija!';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .info-box { background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .button-danger { background: #ef4444; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nova rezervacija! 🎉</h1>
          </div>
          <div class="content">
            <p>Zdravo ${providerName},</p>
            <p>Imate novu rezervaciju koja čeka potvrdu:</p>
            
            <div class="info-box">
              <p><strong>Klijent:</strong> ${bookingDetails.clientName}</p>
              <p><strong>Usluga:</strong> ${bookingDetails.serviceName}</p>
              <p><strong>Datum:</strong> ${bookingDetails.scheduledDate}</p>
              <p><strong>Vreme:</strong> ${bookingDetails.scheduledTime}</p>
              ${bookingDetails.clientNotes ? `<p><strong>Napomena:</strong> ${bookingDetails.clientNotes}</p>` : ''}
            </div>

            <p>Molimo vas da potvrdite ili odbijete rezervaciju:</p>
            
            <a href="${process.env.NEXTAUTH_URL}/dashboard?bookingId=${bookingDetails.bookingId}" class="button" style="color: white;">
              Potvrdi rezervaciju
            </a>
            <a href="${process.env.NEXTAUTH_URL}/dashboard?bookingId=${bookingDetails.bookingId}" class="button button-danger" style="color: white; background: #ef4444;">
              Odbij rezervaciju
            </a>

            <p>Srdačan pozdrav,<br>MVP Usluge Tim</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(providerEmail, subject, html);
}

/**
 * 3. Potvrda rezervacije klijentu
 */
export async function sendBookingConfirmation(
  clientEmail: string,
  clientName: string,
  bookingDetails: {
    providerName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    providerPhone?: string;
    providerAddress?: string;
  }
) {
  const subject = '✅ Rezervacija potvrđena!';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rezervacija potvrđena! ✅</h1>
          </div>
          <div class="content">
            <p>Zdravo ${clientName},</p>
            <p>Vaša rezervacija je uspešno potvrđena!</p>
            
            <div class="info-box">
              <p><strong>Pružalac:</strong> ${bookingDetails.providerName}</p>
              <p><strong>Usluga:</strong> ${bookingDetails.serviceName}</p>
              <p><strong>Datum:</strong> ${bookingDetails.scheduledDate}</p>
              <p><strong>Vreme:</strong> ${bookingDetails.scheduledTime}</p>
              ${bookingDetails.providerPhone ? `<p><strong>Telefon:</strong> ${bookingDetails.providerPhone}</p>` : ''}
              ${bookingDetails.providerAddress ? `<p><strong>Adresa:</strong> ${bookingDetails.providerAddress}</p>` : ''}
            </div>

            <p>Dobićete podsetnik 24h pre zakazanog termina.</p>
            
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button" style="color: white;">
              Pogledaj rezervacije
            </a>

            <p>Srdačan pozdrav,<br>MVP Usluge Tim</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(clientEmail, subject, html);
}

/**
 * 4. Notifikacija o otkazivanju rezervacije
 */
export async function sendBookingCancellation(
  to: string,
  recipientName: string,
  bookingDetails: {
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    cancelledBy: 'client' | 'provider';
    reason?: string;
  }
) {
  const subject = '❌ Rezervacija otkazana';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .info-box { background: white; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rezervacija otkazana</h1>
          </div>
          <div class="content">
            <p>Zdravo ${recipientName},</p>
            <p>Obaveštavamo vas da je sledeća rezervacija otkazana:</p>
            
            <div class="info-box">
              <p><strong>Usluga:</strong> ${bookingDetails.serviceName}</p>
              <p><strong>Datum:</strong> ${bookingDetails.scheduledDate}</p>
              <p><strong>Vreme:</strong> ${bookingDetails.scheduledTime}</p>
              <p><strong>Otkazao:</strong> ${bookingDetails.cancelledBy === 'client' ? 'Klijent' : 'Pružalac'}</p>
              ${bookingDetails.reason ? `<p><strong>Razlog:</strong> ${bookingDetails.reason}</p>` : ''}
            </div>

            <p>Srdačan pozdrav,<br>MVP Usluge Tim</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(to, subject, html);
}

/**
 * 5. Podsetnik 24h pre termina
 */
export async function sendBookingReminder(
  clientEmail: string,
  clientName: string,
  bookingDetails: {
    providerName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    providerPhone?: string;
    providerAddress?: string;
  }
) {
  const subject = '⏰ Podsetnik: Sutra imate zakazanu uslugu';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .info-box { background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Podsetnik ⏰</h1>
          </div>
          <div class="content">
            <p>Zdravo ${clientName},</p>
            <p>Podsetnik: Sutra imate zakazanu uslugu!</p>
            
            <div class="info-box">
              <p><strong>Pružalac:</strong> ${bookingDetails.providerName}</p>
              <p><strong>Usluga:</strong> ${bookingDetails.serviceName}</p>
              <p><strong>Datum:</strong> ${bookingDetails.scheduledDate}</p>
              <p><strong>Vreme:</strong> ${bookingDetails.scheduledTime}</p>
              ${bookingDetails.providerPhone ? `<p><strong>Telefon:</strong> ${bookingDetails.providerPhone}</p>` : ''}
              ${bookingDetails.providerAddress ? `<p><strong>Adresa:</strong> ${bookingDetails.providerAddress}</p>` : ''}
            </div>

            <p>Vidimo se sutra! 😊</p>
            <p>Srdačan pozdrav,<br>MVP Usluge Tim</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(clientEmail, subject, html);
}

/**
 * 6. Notifikacija pružaocu o novoj oceni
 */
export async function sendNewReviewNotification(
  providerEmail: string,
  providerName: string,
  reviewDetails: {
    clientName: string;
    serviceName: string;
    rating: number;
    comment?: string;
    reviewId: string;
  }
) {
  const subject = '⭐ Nova ocena!';

  const stars = '⭐'.repeat(reviewDetails.rating);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .info-box { background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nova ocena! ⭐</h1>
          </div>
          <div class="content">
            <p>Zdravo ${providerName},</p>
            <p>Dobili ste novu ocenu!</p>
            
            <div class="info-box">
              <p><strong>Klijent:</strong> ${reviewDetails.clientName}</p>
              <p><strong>Usluga:</strong> ${reviewDetails.serviceName}</p>
              <p><strong>Ocena:</strong> ${stars} (${reviewDetails.rating}/5)</p>
              ${reviewDetails.comment ? `<p><strong>Komentar:</strong> "${reviewDetails.comment}"</p>` : ''}
            </div>

            <p>Možete odgovoriti na komentar:</p>
            
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button" style="color: white;">
              Odgovori na ocenu
            </a>

            <p>Srdačan pozdrav,<br>MVP Usluge Tim</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(providerEmail, subject, html);
}

/**
 * 7. Verifikacija email adrese
 */
export async function sendEmailVerification(to: string, firstName: string, token: string) {
  const subject = 'Potvrda email adrese';
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Potvrdite vašu email adresu</h1>
          </div>
          <div class="content">
            <p>Zdravo ${firstName},</p>
            <p>Kliknite na dugme ispod kako biste potvrdili vašu email adresu i aktivirali nalog.</p>
            <a href="${verificationUrl}" class="button" style="color: white;">Potvrdi Email</a>
            <p>Ako niste kreirali nalog na našoj platformi, možete ignorisati ovu poruku.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(to, subject, html);
}

/**
 * 8. Resetovanje lozinke
 */
export async function sendPasswordReset(to: string, firstName: string, token: string) {
  const subject = 'Resetovanje lozinke';
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Resetovanje lozinke</h1>
          </div>
          <div class="content">
            <p>Zdravo ${firstName},</p>
            <p>Zatražili ste resetovanje lozinke. Kliknite na dugme ispod da biste postavili novu lozinku.</p>
            <a href="${resetUrl}" class="button" style="color: white;">Resetuj lozinku</a>
            <p>Link prestaje da važi za 1 sat.</p>
            <p>Ako niste zatražili resetovanje lozinke, možete ignorisati ovu poruku.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(to, subject, html);
}
