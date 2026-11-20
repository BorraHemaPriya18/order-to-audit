const test=require('node:test'),assert=require('node:assert/strict');
const {stockBalance,movingAverageRate,taxBreakdown,variancePct,proportionalPart}=require('./domain');
test('stock derives from opening, receipts and issues',()=>assert.equal(stockBalance([100,60,-40]),120));
test('same state tax splits 5 percent into CGST and SGST',()=>assert.deepEqual(taxBreakdown(750000,'Tamil Nadu'),{cgst:18750,sgst:18750,igst:0}));
test('interstate tax uses IGST',()=>assert.deepEqual(taxBreakdown(750000,'Karnataka'),{cgst:0,sgst:0,igst:37500}));
test('moving average includes purchased flour rate',()=>assert.equal(movingAverageRate(100,4200,60,60*4500),4313));
test('production variances are percentage based',()=>{assert.equal(variancePct(188,200),-6);assert.equal(variancePct(10.5,10),5)});
test('many partial credit notes reverse exactly the original tax paise',()=>{let sum=0;for(let previous=0;previous<150;previous++)sum+=proportionalPart(18750,previous,1,150);assert.equal(sum,18750)});
