export const fmtMoney = (n, currency='USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency}).format(n);

export const isoToday = () => new Date().toISOString();

export const startOfWeek = (d=new Date()) => {
  const dt = new Date(d); const day = (dt.getDay()+6)%7; dt.setDate(dt.getDate()-day); dt.setHours(0,0,0,0); return dt;
};
export const startOfMonth = (d=new Date()) => { const dt=new Date(d); dt.setDate(1); dt.setHours(0,0,0,0); return dt; };
export const sameMonth = (a,b)=> a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth();
export const ymKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;