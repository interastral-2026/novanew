
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';

const app = express();

// 1. Precise Request Logging for debugging Railway deployment
app.use((req: any, res: any, next: any) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 2. Comprehensive Manual CORS Middleware
app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json() as any);

const API_KEY_NAME = "organizations/d90bac52-0e8a-4999-b156-7491091ffb5e/apiKeys/4d47d3ab-fd33-464e-8081-e464b1ef9f8e";
let PRIVATE_KEY = process.env.COINBASE_PRIVATE_KEY || ""; 
if (PRIVATE_KEY.includes('\\n')) {
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

function generateToken(method: string, url: string) {
  if (!PRIVATE_KEY) {
      console.warn("Auth Error: PRIVATE_KEY is empty");
      return "";
  }
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
    console.error("JWT Generation Error:", err);
    return "";
  }
}

// 3. API ROUTES - Highest Priority
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
    res.json({ status: 'operational', timestamp: new Date().toISOString() });
});

apiRouter.get('/portfolio', async (req, res) => {
  console.log("-> API: Fetching Portfolio from Coinbase...");
  try {
    const coinbasePath = '/api/v3/brokerage/accounts';
    const token = generateToken('GET', coinbasePath);
    
    if (!token) {
        return res.status(500).json({ error: 'Auth initialization failed' });
    }

    const response = await axios.get(`https://api.coinbase.com${coinbasePath}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("<- API: Portfolio data received successfully");
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const detail = error.response?.data || error.message;
    console.error(`Portfolio Backend Error [${status}]:`, detail);
    res.status(status).json({ error: 'Coinbase API Error', detail });
  }
});

apiRouter.post('/trade', async (req, res) => {
  console.log("-> API: Executing Trade Order...");
  try {
    const { symbol, side, amount, price } = req.body;
    const coinbasePath = '/api/v3/brokerage/orders';
    const token = generateToken('POST', coinbasePath);
    
    const orderData = {
      client_order_id: crypto.randomBytes(16).toString('hex'),
      product_id: `${symbol}-USD`,
      side: side,
      order_configuration: {
        limit_limit_gtc: { 
            base_size: amount.toString(), 
            limit_price: price.toString() 
        }
      }
    };
    
    const response = await axios.post(`https://api.coinbase.com${coinbasePath}`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: 'Trade Execution Error', detail: error.response?.data });
  }
});

app.use('/api', apiRouter);

// 4. STATIC FILES AND SPA HANDLING
const publicPath = process.cwd();
app.use(express.static(publicPath) as any);

// Catch-all for React SPA routing
app.get('*', ((req: any, res: any) => {
    // If it's an API route that reached here, it's a 404 for the API
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API Endpoint Not Found' });
    }
    
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Essential File (index.html) Not Found. Verify build artifact location.");
    }
}) as any);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 ASTRAEA CORE OPERATIONAL`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Root: ${publicPath}`);
    console.log(`=========================================`);
});
