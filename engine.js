(function(root){
'use strict';
const EPS=1e-12;
function fees(gross,r){for(const k of ['commission','market','vatCommission','vatMarket','fixed'])if(!Number.isFinite(r[k])||r[k]<0)throw Error('Tarifa inválida');return gross/100*(r.commission*(1+r.vatCommission/100)+r.market*(1+r.vatMarket/100))+r.fixed;}
function calculate(ops){
 const lots=[],closed=[],factors=new Map();
 function leg(o,side,ticker,qty,usd,ars,factor=1,reason='Operación'){
  if(qty<=EPS)return;
  if(factors.has(ticker)&&factors.get(ticker)!==factor)throw Error('Usá una misma base de cotización para cada ticker.');factors.set(ticker,factor);
  if(side==='Compra'){lots.push({...o,ticker,factor,left:qty,unitARS:ars/qty,unitUSD:usd/qty});return;}
  const eligible=lots.filter(l=>l.ticker===ticker&&l.broker===o.broker&&l.left>EPS);
  if(eligible.reduce((s,l)=>s+l.left,0)+EPS<qty)throw Error('Saldo insuficiente de '+ticker+' en este broker. Cargá su tenencia inicial o compra antes de operar.');
  let remaining=qty;
  for(const l of eligible){if(remaining<=EPS)break;const n=Math.min(remaining,l.left);closed.push({ticker,broker:o.broker,buy:l.date,sell:o.date,qty:n,costARS:l.unitARS*n,costUSD:l.unitUSD*n,resultARS:ars*n/qty-l.unitARS*n,resultUSD:usd*n/qty-l.unitUSD*n,reason,reference:l.costMode==='Referencia'});l.left-=n;remaining-=n;}
 }
 for(const o of [...ops].sort((a,b)=>String(a.date).localeCompare(String(b.date))||a.order-b.order)){
  if(!o.id||!o.ticker||!o.broker||!/^\d{4}-\d{2}-\d{2}$/.test(o.date)||!['Compra','Venta','Inicial'].includes(o.side)||!['ARS','USD','USDT','USDC'].includes(o.currency)||![o.qty,o.price,o.fx,o.factor].every(x=>Number.isFinite(x)&&x>0)||!Number.isFinite(o.fee)||o.fee<0)throw Error('Operación inválida');
  const stable=['USDT','USDC'].includes(o.currency);
  if(stable&&(!Number.isFinite(o.quoteUSD)||o.quoteUSD<=0))throw Error('Indicá el valor en USD de la moneda cotizada.');
  const unitUSD=o.currency==='ARS'?1/o.fx:o.currency==='USD'?1:o.quoteUSD,gross=o.qty*o.price/o.factor;
  if(o.type==='Cripto'&&o.factor!==1)throw Error('Cripto se cotiza por una unidad.');
  if(o.side==='Inicial') {leg(o,'Compra',o.ticker,o.qty,gross*unitUSD,gross*unitUSD*o.fx,o.factor,'Tenencia inicial');continue;}
  const crypto=o.type==='Cripto';
  if(crypto&&o.ticker===o.currency)throw Error('El activo y la moneda cotizada deben ser distintos.');
  const mode=crypto?(o.feeMode||'Cotizada'):'Cotizada';
  if(!['Cotizada','Activo','BNB'].includes(mode))throw Error('Moneda de comisión inválida');
  const baseFee=mode==='Activo'?o.fee:0,quoteFee=mode==='Cotizada'?o.fee:0;
  let thirdUSD=0;
  if(mode==='BNB'&&o.fee>0){if(o.ticker==='BNB')throw Error('Para operar BNB, elegí comisión en activo o moneda cotizada.');if(!Number.isFinite(o.feeUSD)||o.feeUSD<=0)throw Error('Indicá el precio USD de BNB al pagar la comisión.');thirdUSD=o.fee*o.feeUSD;leg(o,'Venta','BNB',o.fee,thirdUSD,thirdUSD*o.fx,1,'Comisión BNB');}
  const buy=o.side==='Compra',qty=o.qty+(buy?-baseFee:baseFee);
  if(qty<=EPS||(!buy&&quoteFee>=gross))throw Error('La comisión supera el importe o cantidad de la operación.');
  const net=(gross+(buy?quoteFee:-quoteFee))*unitUSD+(buy?thirdUSD:-thirdUSD);
  if(net<0)throw Error('Gastos superiores al ingreso de la venta');
  if(crypto&&stable&&buy)leg(o,'Venta',o.currency,gross+quoteFee,(gross+quoteFee)*unitUSD,(gross+quoteFee)*unitUSD*o.fx,1,'Pago Spot');
  leg(o,buy?'Compra':'Venta',o.ticker,qty,net,net*o.fx,o.factor,'Operación');
  if(crypto&&stable&&!buy)leg(o,'Compra',o.currency,gross-quoteFee,(gross-quoteFee)*unitUSD,(gross-quoteFee)*unitUSD*o.fx,1,'Cobro Spot');
 }
 return {lots:lots.filter(l=>l.left>EPS),closed};
}
if(typeof module!=='undefined')module.exports={calculate,fees};else root.Engine={calculate,fees};
})(globalThis);
