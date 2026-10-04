export function calculateSavings({units,before,after,rate}) {
 const inputs=[units,before,after,rate];
 if(inputs.some(v=>!Number.isFinite(v)||v<0)) return null;
 if(units>10000000 || !Number.isInteger(units) || before>100000 || after>100000 || rate>100000) return null;
 const minutes=before-after;
 const hours=units*minutes/60;
 return {hours, money:hours*rate, percent:before>0?minutes/before*100:null, currentHours:units*before/60, trialHours:units*after/60};
}
