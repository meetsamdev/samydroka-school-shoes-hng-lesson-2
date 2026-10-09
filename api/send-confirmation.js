import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Server-side environment variables only.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const mailgunKey = process.env.MAILGUN_API_KEY;
    const mailgunDomain = process.env.MAILGUN_DOMAIN;
    const mailgunFrom = process.env.MAILGUN_FROM;

    const missing = [];

    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!mailgunKey) missing.push('MAILGUN_API_KEY');
    if (!mailgunDomain) missing.push('MAILGUN_DOMAIN');
    if (!mailgunFrom) missing.push('MAILGUN_FROM');

    if (missing.length > 0) {
      return res.status(500).json({
        error: `Missing environment variables: ${missing.join(', ')}`
      });
    }

    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing authentication token.'
      });
    }

    const token = authHeader.slice(7);

    // Verify the signed-in Supabase user.
    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/user`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`
        }
      }
    );

    const userResponseText = await userResponse.text();

    if (!userResponse.ok) {
      return res.status(401).json({
        error: `Supabase user verification failed (${userResponse.status}): ${userResponseText}`
      });
    }

    const user = JSON.parse(userResponseText);

    const order = req.body?.order;

    if (!order) {
      return res.status(400).json({
        error: 'Order data was not received.'
      });
    }

    if (order.customer_email !== user.email) {
      return res.status(400).json({
        error: 'Order/customer mismatch.'
      });
    }

    const itemRows = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding:8px 0">${escapeHtml(item.name)}</td>
            <td style="padding:8px 0">× ${Number(item.qty || 0)}</td>
            <td style="padding:8px 0;text-align:right">
              ${money(Number(item.price || 0) * Number(item.qty || 0))}
            </td>
          </tr>
        `
      )
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111827">
        <div style="background:#111827;color:white;padding:24px;border-radius:14px 14px 0 0">
          <h1 style="margin:0;font-size:24px">Samydroka School Shoes</h1>
          <p style="margin:6px 0 0;color:#c7cbd2">Order confirmation</p>
        </div>

        <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 14px 14px">
          <p>Hi ${escapeHtml(user.user_metadata?.full_name || 'there')},</p>

          <p>
            Thanks for your order. We've received it and marked it as confirmed.
          </p>

          <table width="100%" cellspacing="0" cellpadding="0">
            ${itemRows}

            <tr>
              <td colspan="2" style="padding-top:16px;font-weight:bold">
                Total
              </td>
              <td style="padding-top:16px;text-align:right;font-weight:bold">
                ${money(Number(order.total || 0))}
              </td>
            </tr>
          </table>

          <hr style="border:0;border-top:1px solid #e5e7eb;margin:22px 0">

          <p>
            <strong>Delivery address</strong><br>
            ${escapeHtml(order.address || '')}<br>
            ${escapeHtml(order.phone || '')}
          </p>

          <p style="color:#667085;font-size:13px">
            Order reference: ${escapeHtml(order.id || '')}
          </p>
        </div>
      </div>
    `;

    const body = new URLSearchParams({
      from: mailgunFrom,
      to: user.email,
      subject: `Samydroka order ${(order.id || '').slice(0, 8).toUpperCase()} confirmed`,
      html
    });

    const mailgunUrl =
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`;

    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        Authorization:
          `Basic ${Buffer.from(`api:${mailgunKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    const mailgunText = await mailgunResponse.text();

    if (!mailgunResponse.ok) {
      console.error(
        'MAILGUN ERROR:',
        mailgunResponse.status,
        mailgunText
      );

      return res.status(502).json({
        error: `Mailgun ${mailgunResponse.status}: ${mailgunText}`
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Confirmation email sent.'
    });

  } catch (error) {
    console.error('SEND CONFIRMATION CRASH:', error);

    return res.status(500).json({
      error: `Function crashed: ${error?.message || String(error)}`
    });
  }
}

function money(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function escapeHtml(value = '') {
  return String(value).replace(
    /[&<>'"]/g,
    (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[character])
  );
}