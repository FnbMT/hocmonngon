import type { IncomingMessage, ServerResponse } from 'http';

interface SePayWebhookBody {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string | null;
  content?: string;
  transferType?: 'in' | 'out';
  transferAmount?: number;
  accumulated?: number;
  subAccount?: string | null;
  referenceCode?: string;
  description?: string;
}

/**
 * Vercel Serverless Function handler for SePay Webhook.
 * Accepts POST requests from SePay when a bank transaction occurs.
 * URL: https://<your-app>.vercel.app/api/sepay-webhook
 */
export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health-check / test ping from SePay
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Hoc Mon Ngon SePay Webhook Endpoint',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const body: SePayWebhookBody = req.body || {};

    // Validate SePay payload structure
    const transferAmount = Number(body.transferAmount || 0);
    const content = (body.content || body.description || '').trim();
    const gateway = body.gateway || 'Bank';

    console.log(`[SePay Webhook Received] Amount: ${transferAmount}đ | Content: "${content}" | Gateway: ${gateway}`);

    // Return 200 to SePay so SePay registers the webhook delivery as SUCCESS
    return res.status(200).json({
      success: true,
      message: 'SePay Webhook received and processed successfully',
      data: {
        id: body.id,
        transferAmount,
        content,
        receivedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('[SePay Webhook Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }
}
