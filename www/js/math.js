export const mod=(n,m)=>((n%m)+m)%m;
export const digits=n=>String(Math.abs(n)).split('').map(Number);
export const digitSum=n=>digits(n).reduce((a,b)=>a+b,0);
export const alternatingSum=n=>digits(n).reverse().reduce((s,d,i)=>s+(i%2?-d:d),0);
export function rootTrail(n){const out=[n];while(n>9){n=digitSum(n);out.push(n);}return out;}
export const digitalRoot=n=>rootTrail(n).at(-1);
export const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
export const lcm=(a,b)=>Math.abs(a*b)/gcd(a,b);
export const consecutive=(start,count,step=1)=>Array.from({length:count},(_,i)=>start+i*step);
export const signedTotal=(nums,signs)=>nums.reduce((s,n,i)=>s+(i===0||signs[i-1]==='+'?n:-n),0);
export const signVariants=nums=>Array.from({length:2**(nums.length-1)},(_,mask)=>{const signs=nums.slice(1).map((_,i)=>mask&(1<<i)?'−':'+');return {signs,total:signedTotal(nums,signs)};});
export const parseAnswer=s=>/^-?\d+$/.test(String(s).trim())&&Number.isSafeInteger(Number(s))?Number(s):null;
export const starScore=(hits,total)=>hits===total?3:hits>=Math.ceil(total*2/3)?2:1;
export const DIVISORS=[2,3,4,5,6,8,9,10,11];
export const divisorsOf=n=>DIVISORS.filter(d=>n%d===0);
export const cryptoLetters=q=>[...new Set([...q.operands,q.result].join('').replace(/[0-9]/g,''))];
export function cryptoCheck(q,values){
 const letters=cryptoLetters(q),words=[...q.operands,q.result];
 if(letters.some(l=>!Number.isInteger(values[l])||values[l]<0||values[l]>9))return {valid:false,message:'Choose a digit for every letter.'};
 if(new Set(letters.map(l=>values[l])).size!==letters.length)return {valid:false,message:'Different letters need different digits. Try another assignment.'};
 const value=w=>Number([...w].map(c=>/\d/.test(c)?c:values[c]).join(''));
 if(words.some(w=>w.length>1&&(/\d/.test(w[0])?Number(w[0]):values[w[0]])===0))return {valid:false,message:'A multi-digit number cannot begin with 0.'};
 const numbers=q.operands.map(value),result=value(q.result),actual=q.op==='+'?numbers.reduce((a,b)=>a+b,0):numbers.reduce((a,b)=>a*b,1);
 return {valid:true,correct:actual===result,numbers,result,actual};
}
export function answerCorrect(q,v){
 switch(q.type){
 case 'choice':case 'number':return v===q.answer;
 case 'select':return v.length===q.answer.length&&q.answer.every(x=>v.includes(x));
 case 'sequence':return consecutive(v,q.count,q.step).reduce((a,b)=>a+b,0)===q.target;
 case 'signs':return signedTotal(q.numbers,v)===q.target;
 case 'remainder':return v===mod(q.n,q.divisor);
 case 'digit':return q.answer.includes(v);
 case 'crypto':return cryptoCheck(q,v).correct===true;
 case 'order':return v.length===q.steps.length&&q.steps.every((s,i)=>v[i]===s);
 default:return false;
 }
}
