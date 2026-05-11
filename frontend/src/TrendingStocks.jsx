import React from 'react'

const STOCKS = [
  {symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹2,847.50', change: '+2.3%', changeColor: '#10b981', source: 'Google Finance', url: 'https://www.google.com/finance/quote/RELIANCE:NSE'},
  {symbol: 'TCS', name: 'Tata Consultancy', price: '₹3,654.20', change: '+1.8%', changeColor: '#10b981', source: 'Google Finance', url: 'https://www.google.com/finance/quote/TCS:NSE'},
  {symbol: 'INFY', name: 'Infosys', price: '₹1,523.40', change: '-0.5%', changeColor: '#ef4444', source: 'Google Finance', url: 'https://www.google.com/finance/quote/INFY:NSE'},
  {symbol: 'HDFCBANK', name: 'HDFC Bank', price: '₹1,687.90', change: '+0.9%', changeColor: '#10b981', source: 'Google Finance', url: 'https://www.google.com/finance/quote/HDFCBANK:NSE'},
  {symbol: 'ICICIBANK', name: 'ICICI Bank', price: '₹1,134.75', change: '+1.2%', changeColor: '#10b981', source: 'Google Finance', url: 'https://www.google.com/finance/quote/ICICIBANK:NSE'},
]

export default function TrendingStocks(){
  return (
    <div className="card activity-card" style={{height:'100%'}}>
      <h3>📈 Trending Stocks</h3>
      <div style={{padding: '16px 0'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {STOCKS.map((stock) => (
            <a
              key={stock.symbol}
              className="stock-item stock-link"
              href={stock.url}
              target="_blank"
              rel="noreferrer"
              title={`View on ${stock.source}`}
              style={{textDecoration:'none'}}
            >
              <div>
                <div className="stock-symbol">{stock.symbol}</div>
                <div className="stock-name">{stock.name}</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div className="stock-price">{stock.price}</div>
                <div style={{fontSize: '12px', fontWeight: '600', color: stock.changeColor}}>{stock.change}</div>
              </div>
            </a>
          ))}
        </div>
        <div className="stock-disclaimer">
          <div style={{fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{fontSize: '16px'}}>🔗</span>
            <span>Click any stock to open the live quote source.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

