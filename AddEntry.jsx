import React, { useEffect, useMemo, useState } from 'react';
import { fmtMoney, isoToday } from '../utils/format.js';
import { addTx, getMeta } from '../lib/db.js';

const DEFAULT_CATS = ['Food & Drink','Travel','Shopping','Bills','Transport','Entertainment','Health','Other'];

function Keypad({ onKey }) {
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
  return (
    <div className="kb" aria-label="Keypad">
      {keys.map(k => (
        <button key={k} onClick={() => onKey(k)} aria-label={`Key ${k}`}>{k}</button>
      ))}
      <button className="wide" onClick={() => onKey('clear')}>Clear</button>
    </div>
  );
}

export default function AddEntry({ onAdded }) {
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(DEFAULT_CATS[0]);
  const [note, setNote] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [categories, setCategories] = useState(DEFAULT_CATS);

  useEffect(() => {
    (async () => {
      setCurrency(await getMeta('currency', 'USD'));
      setCategories(await getMeta('categories', DEFAULT_CATS));
    })();
  }, []);

  const amount = useMemo(() => Number(amountStr || '0'), [amountStr]);

  const onKey = (k) => {
    if (k === '⌫') setAmountStr(s => s.slice(0, -1));
    else if (k === 'clear') setAmountStr('');
    else if (k === '.' && amountStr.includes('.')) return;
    else setAmountStr(s => (s==='0' ? k : (s + k)));
  };

  const save = async () => {
    if (!amount || amount <= 0) return alert('Enter an amount.');
    const tx = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      type,
      amount,
      currency,
      category,
      note,
      date: isoToday()
    };
    await addTx(tx);
    setAmountStr(''); setNote('');
    onAdded?.(tx);
  };

  return (
    <section className="grid" aria-label="Add Entry">
      <div className="card grid" style={{gap:'12px'}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>
            <div className="small">{type==='expense' ? 'Expense' : 'Income'}</div>
            <div className="title mono">{fmtMoney(amount || 0, currency)}</div>
          </div>
          <div className="row">
            <button className={`btn ${type==='expense'?'':'ghost'}`} onClick={()=>setType('expense')}>Expense</button>
            <button className={`btn ${type==='income'?'':'ghost'}`} onClick={()=>setType('income')}>Income</button>
          </div>
        </div>

        <label>
          <div className="small">Category</div>
          <div className="chips">
            {categories.map(c => (
              <button key={c} className={`chip ${category===c?'active':''}`} onClick={()=>setCategory(c)}>{c}</button>
            ))}
          </div>
        </label>

        <label>
          <div className="small">Note (optional)</div>
          <input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g., Café with Anna" />
        </label>

        <Keypad onKey={onKey} />

        <div className="row" style={{justifyContent:'space-between'}}>
          <select value={currency} onChange={e=>setCurrency(e.target.value)}>
            {['USD','EUR','GBP','JPY','AUD','CAD','INR'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={save} aria-label="Save entry">Save</button>
        </div>
      </div>
    </section>
  );
}