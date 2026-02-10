
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';

const app = express();

// ۱. تنظیمات CORS - اجازه به لوکال‌هاست و خود ریلی‌وی
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}) as any);

app.use(express.json() as any);

const API_KEY_NAME = "organizations/d90bac52-0e8a-4999-b156-7491091ffb5e/apiKeys/4d47d3ab-fd33-464e-8081-e464b1ef9f8e";
let PRIVATE_KEY = process.env.COINBASE_PRIVATE_KEY || ""; 
if (PRIVATE_KEY.includes('\\n')) {
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

function generateToken(method: string, url: string) {
  if (!PRIVATE_KEY) return "";
  const algorithm = 'ES256';
  const uri = `ANY ${url}`;
  try {
    return jwt.sign(
      {
        iss: 'coinbase-cloud',
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
        sub: API_KEY_NAME,
        uri: uri,
      },
      PRIVATE_KEY,
      { 
        algorithm: algorithm as jwt.Algorithm, 
        header: { kid: API_KEY_NAME, typ: 'JWT', alg: algorithm } as any
      }
    );
  } catch (err) {
    console.error("JWT Error:", err);
    return "";
  }
}

// اولویت اول: مسیرهای API (باید قبل از استاتیک باشند)
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.get('/api/portfolio', async (req, res) => {
  console.log("Portfolio request received");
  try {
    const coinbasePath = '/api/v3/brokerage/accounts';
    const token = generateToken('GET', coinbasePath);
    if (!token) throw new Error("Auth token generation failed");

    const response = await axios.get(`https://api.coinbase.com${coinbasePath}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Portfolio Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'API Error', detail: error.response?.data });
  }
});

app.post('/api/trade', async (req, res) => {
  try {
    const { symbol, side, amount, price } = req.body;
    const coinbasePath = '/api/v3/brokerage/orders';
    const token = generateToken('POST', coinbasePath);
    const orderData = {
      client_order_id: crypto.randomBytes(16).toString('hex'),
      product_id: `${symbol}-USD`,
      side: side,
      order_configuration: {
        limit_limit_gtc: { base_size: amount.toString(), limit_price: price.toString() }
      }
    };
    const response = await axios.post(`https://api.coinbase.com${coinbasePath}`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Trade Error', detail: error.response?.data });
  }
});

// اولویت دوم: فایل‌های استاتیک
// استفاده از process.cwd() برای اطمینان از ریشه پروژه در ریلی‌وی
const publicPath = process.cwd();
app.use(express.static(publicPath) as any);

// اولویت آخر: هندلر تمام مسیرهای دیگر (SPA Routing)
app.get('*', ((req: any, res: any) => {
    // اگر درخواست برای API بود و تا اینجا نرسیده، یعنی پیدا نشده
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("index.html not found. Deployment error.");
    }
}) as any);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Astraea Server running on port ${PORT}`);
});
