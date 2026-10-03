import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLDS,TOTAL_ROUNDS,TOTAL_STARS} from '../www/js/content.js';
import {mod,digitSum,alternatingSum,rootTrail,digitalRoot,lcm,consecutive,signVariants,parseAnswer,starScore,cryptoCheck,cryptoLetters,answerCorrect} from '../www/js/math.js';
import {createStore} from '../www/js/state.js';
const all=WORLDS.flatMap(w=>w.rounds),byId=id=>all.find(q=>q.id===id);
test('six coherent cases and 36 original investigations',()=>{
 assert.equal(WORLDS.length,6);assert.equal(TOTAL_ROUNDS,36);assert.equal(TOTAL_STARS,18);assert.equal(new Set(all.map(q=>q.id)).size,36);
 for(const w of WORLDS){assert.equal(w.rounds.length,6);assert.equal(w.chapter,5);assert.ok(w.guide.length>=4);for(const q of w.rounds){for(const key of ['title','prompt','hint','solution','why'])assert.ok(q[key]?.length>8,`${q.id}: ${key}`);const solution=q.type==='order'?q.steps:q.type==='digit'?q.answer[0]:q.answer;assert.ok(answerCorrect(q,solution),q.id);if(q.type==='choice'){assert.ok(q.options.includes(q.answer));assert.equal(new Set(q.options).size,q.options.length);for(const option of q.options)assert.equal(answerCorrect(q,option),option===q.answer);}}}
});
test('all eight sign patterns preserve parity, including negatives',()=>{
 for(let start=-100;start<=100;start++){const ns=consecutive(start,4),variants=signVariants(ns);assert.equal(variants.length,8);assert.equal(new Set(variants.map(v=>v.signs.join(''))).size,8);for(const v of variants)assert.equal(mod(v.total,2),0);assert.ok(variants.some(v=>v.total===0));}
 for(const v of signVariants([2,5,8,10]))assert.equal(mod(v.total,2),1);
});
test('digit tests and signed remainders agree with ordinary division',()=>{
 for(let n=0;n<100000;n++){for(const d of [3,9])assert.equal(mod(digitSum(n),d),n%d);assert.equal(mod(alternatingSum(n),11),n%11);assert.equal(n%4,(n%100)%4);assert.equal(n%8,(n%1000)%8);assert.equal(n%24===0,n%3===0&&n%8===0);assert.equal(digitalRoot(n),n===0?0:1+(n-1)%9);}
 assert.equal(alternatingSum(5082),-11);assert.equal(mod(-3,11),8);assert.equal(lcm(4,6),12);assert.equal(lcm(3,8),24);assert.deepEqual(rootTrail(68759),[68759,35,8]);
});
test('every missing-digit key is exhaustive, not a single guessed answer',()=>{
 for(const q of all.filter(q=>q.type==='digit')){const valid=Array.from({length:10},(_,i)=>i).filter(i=>Number(q.template.replace('□',i))%q.divisor===0);assert.deepEqual(q.answer,valid,q.id);}
});
test('cryptarithms accept every valid solution and reject invalid letters',()=>{
 const expected={'cipher-add':1,'cipher-mirror':8,'cipher-multiply':2,'cipher-triple':2};
 for(const q of all.filter(q=>q.type==='crypto')){const ls=cryptoLetters(q),found=[];const visit=(i,v)=>{if(i<ls.length){for(let d=0;d<=9;d++)visit(i+1,{...v,[ls[i]]:d});return;}const nums=[...q.operands,q.result].map(w=>[...w].map(c=>ls.includes(c)?v[c]:c).join(''));const unique=new Set(ls.map(l=>v[l])).size===ls.length,noZero=nums.every(n=>n.length===1||n[0]!=='0');const vals=nums.map(Number),result=vals.pop(),total=q.op==='+'?vals.reduce((a,b)=>a+b):vals.reduce((a,b)=>a*b);const valid=unique&&noZero&&result===total;assert.equal(answerCorrect(q,v),valid);if(valid)found.push(v);};visit(0,{});assert.equal(found.length,expected[q.id]);assert.equal(cryptoCheck(q,{}).valid,false);assert.equal(cryptoCheck(q,Object.fromEntries(ls.map(l=>[l,10]))).valid,false);}
 assert.equal(cryptoCheck(byId('cipher-mirror'),{A:0,B:9}).valid,false);
 assert.equal(cryptoCheck(byId('cipher-add'),{A:3,B:3}).valid,false);
});
test('number entry is strict and scoring rewards independent completion',()=>{
 for(const s of ['',' ','3.5','1e2','NaN','Infinity','2+3','9007199254740992'])assert.equal(parseAnswer(s),null);
 assert.equal(parseAnswer(' -11 '),-11);assert.equal(parseAnswer('0'),0);
 assert.deepEqual(Array.from({length:7},(_,i)=>starScore(i,6)),[1,1,1,1,2,2,3]);
});
test('remainder and guaranteed-even puzzles have sound answers',()=>{
 assert.equal(Array.from({length:60},(_,n)=>n).find(n=>n>0&&n%3===2&&n%4===3&&n%5===4),59);
 assert.deepEqual(byId('pairs-four').options.filter(x=>(14+Number(x))%4===0),byId('pairs-four').answer);
 assert.deepEqual(byId('root-family').options.filter(x=>digitalRoot(Number(x))===5),byId('root-family').answer);
 assert.deepEqual(byId('six-detector').options.filter(x=>Number(x)%6===0),byId('six-detector').answer);
 for(let n=-50;n<=50;n++){for(const v of [2*n+4,n*(n+1),n*n+n])assert.equal(mod(v,2),0);for(let b=-20;b<=20;b++)assert.equal(mod(6*n-2*b,2),0);}
});
test('saved progress, best scores, unlocks and reset remain isolated',()=>{
 const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};const s=createStore(storage);assert.equal(s.total(),0);assert.equal(s.unlocked(1,WORLDS),false);s.saveRun('signs',{index:2,hits:1,missed:true});assert.deepEqual(createStore(storage).run('signs'),{index:2,hits:1,missed:true});s.finish('signs',3);s.finish('signs',1);assert.equal(s.stars('signs'),3);assert.equal(s.run('signs'),null);assert.equal(s.unlocked(1,WORLDS),true);s.toggleMute();s.reset();assert.equal(s.total(),0);assert.equal(s.muted(),true);assert.deepEqual([...memory.keys()],['number-bureau-v1']);
});
test('storage denial and malformed saves do not prevent play',()=>{
 const blocked=createStore({getItem(){throw Error();},setItem(){throw Error();}});assert.equal(blocked.persistent(),false);blocked.finish('signs',3);assert.equal(blocked.total(),3);assert.equal(createStore(undefined).persistent(),false);
 const malformed=createStore({getItem:()=>'{bad'});assert.equal(malformed.total(),0);
 const tampered=createStore({getItem:()=>JSON.stringify({stars:{signs:99,roots:-1,digits:2},runs:{signs:{index:-1,hits:5}}})});assert.equal(tampered.total(),2);assert.equal(tampered.run('signs'),null);
});
