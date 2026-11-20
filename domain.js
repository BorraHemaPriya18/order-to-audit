function stockBalance(movements){return movements.reduce((total,movement)=>total+movement,0)}
function movingAverageRate(openingQty,openingRatePaise,receiptQty,receiptValuePaise){return receiptQty?Math.round((openingQty*openingRatePaise+receiptValuePaise)/(openingQty+receiptQty)):openingRatePaise}
function taxBreakdown(taxablePaise,state){let total=Math.round(taxablePaise*.05);return state==='Tamil Nadu'?{cgst:Math.round(total/2),sgst:total-Math.round(total/2),igst:0}:{cgst:0,sgst:0,igst:total}}
function variancePct(actual,planned){return planned===0?0:(actual-planned)/planned*100}
function proportionalPart(totalPaise,previousQty,qty,totalQty){if(!Number.isInteger(previousQty)||!Number.isInteger(qty)||!Number.isInteger(totalQty)||previousQty<0||qty<0||totalQty<=0||previousQty+qty>totalQty)throw new RangeError('Invalid proportional quantity');return Math.round(totalPaise*(previousQty+qty)/totalQty)-Math.round(totalPaise*previousQty/totalQty)}
module.exports={stockBalance,movingAverageRate,taxBreakdown,variancePct,proportionalPart};
