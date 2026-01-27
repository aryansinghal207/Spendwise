import React from 'react'

// Small SVG chart showing incomes (green) and expenses (red) for last 6 months
export default function FinanceChart({incomes = [], expenses = []}){
  function monthKey(d){
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0');
  }

  const now = new Date()
  const keys = []
  for(let i=5;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
    keys.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'))
  }

  const incomesBy = {}
  const expensesBy = {}
  keys.forEach(k=>{ incomesBy[k]=0; expensesBy[k]=0 })

  incomes.forEach(i=>{
    const k = monthKey(i.date) || monthKey(new Date())
    if(keys.includes(k)) incomesBy[k] = incomesBy[k] + Number(i.amount||0)
  })
  expenses.forEach(e=>{
    const k = monthKey(e.date) || monthKey(new Date())
    if(keys.includes(k)) expensesBy[k] = expensesBy[k] + Number(e.amount||0)
  })

  const incomeVals = keys.map(k=>incomesBy[k]||0)
  const expenseVals = keys.map(k=>expensesBy[k]||0)
  const maxVal = Math.max(1, ...incomeVals, ...expenseVals)

  const width = 520, height = 200, padding = 28
  const innerH = height - padding*2
  const barSlot = Math.floor((width - padding*2) / keys.length)
  const barWidth = Math.max(8, Math.floor(barSlot * 0.36))
  const gap = Math.floor((barSlot - barWidth*2))

  return (
    <div style={{overflow:'auto'}}>
      <svg width={width} height={height} style={{maxWidth:'100%'}}>
        <rect x={0} y={0} width={width} height={height} fill="#fff" rx={8} />

        {/* legends */}
        <g>
          <rect x={padding} y={8} width={12} height={12} fill="#48bb78" rx={3} />
          <text x={padding+18} y={18} fontSize={12} fill="#333">Income</text>
          <rect x={padding+90} y={8} width={12} height={12} fill="#f87171" rx={3} />
          <text x={padding+108} y={18} fontSize={12} fill="#333">Expense</text>
        </g>

        {/* baseline */}
        <line x1={padding} y1={height - padding} x2={width-padding} y2={height - padding} stroke="#eee" />

        {keys.map((k, idx)=>{
          const x0 = padding + idx*barSlot + Math.floor(gap/2)
          const inc = incomesBy[k]||0
          const exp = expensesBy[k]||0
          const incH = (inc / maxVal) * (innerH*0.6)
          const expH = (exp / maxVal) * (innerH*0.6)
          const incX = x0
          const expX = x0 + barWidth + 6
          return (
            <g key={k}>
              <rect x={incX} y={(height - padding) - incH} width={barWidth} height={incH} fill="#48bb78" rx={3}>
                <title>{k.slice(5)}: Income ₹{inc.toFixed(2)}</title>
              </rect>
              <rect x={expX} y={(height - padding)} width={barWidth} height={expH} fill="#f87171" rx={3}>
                <title>{k.slice(5)}: Expense ₹{exp.toFixed(2)}</title>
              </rect>
              <text x={x0 + Math.floor(barWidth)} y={height - 6} fontSize={11} textAnchor="middle" fill="#666">{k.slice(5)}</text>
            </g>
          )
        })}

      </svg>
    </div>
  )
}
