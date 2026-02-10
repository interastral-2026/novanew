
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface Trade {
  id: string;
  asset: string;
  side: OrderSide;
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  timestamp: number;
  status: 'OPEN' | 'CLOSED';
  roi?: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  rsi?: number;
}

export interface AILog {
  id: string;
  timestamp: number;
  message: string;
  type: 'INFO' | 'DECISION' | 'WARNING' | 'ERROR';
}

export interface Portfolio {
  totalValue: number;
  availableCash: number;
  assets: {
    symbol: string;
    amount: number;
    value: number;
  }[];
}
