import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {WORLDS} from '../www/js/content.js';
const arg=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
const {chromium}=await import(arg('playwright')||'playwright');
const browser=await chromium.launch({headless:true,...(arg('chromium')?{executablePath:arg('chromium')}:{})});
const base=arg('url')||'http://localhost:8170/';
const context=await browser.newContext({viewport:{width:1440,height:1050},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await mkdir('test-results',{recursive:true});
const shot=name=>page.screenshot({path:`test-results/${name}.png`,fullPage:true});
const heading=title=>page.getByRole('heading',{name:title,exact:true}).waitFor();
const click=name=>page.getByRole('button',{name,exact:true}).click();
async function noOverflow(){const result=await page.evaluate(()=>({ok:document.documentElement.scrollWidth<=innerWidth+1,width:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('main *,header *,footer *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className?.baseVal??e.className,right:e.getBoundingClientRect().right})).slice(0,12)}));assert.ok(result.ok,JSON.stringify(result));}
async function setDial(label,n){const input=page.getByRole('slider',{name:label,exact:true}),min=Number(await input.getAttribute('min')),step=Number(await input.getAttribute('step'))||1;await input.focus();await input.press('Home');for(let i=min;i<n;i+=step)await input.press('ArrowRight');assert.equal(await input.inputValue(),String(n));}
async function solve(q){
 if(q.type==='choice')await click(q.answer);
 else if(q.type==='number'){await page.getByRole('textbox',{name:'Your answer'}).fill(String(q.answer));await click('Check answer');}
 else{
  if(q.type==='select')for(const n of q.answer)await click(n);
  if(q.type==='sequence')await setDial('First number',q.answer);
  if(q.type==='remainder')await setDial('Remainder',q.answer);
  if(q.type==='signs')for(const [i,s] of q.answer.entries())if(s!==q.initial[i])await click(`Subtract ${q.numbers[i+1]}`);
  if(q.type==='digit')await click(`Digit ${q.answer[0]}`);
  if(q.type==='crypto')for(const [l,d] of Object.entries(q.answer))await page.getByLabel(`Digit for ${l}`,{exact:true}).selectOption(String(d));
  if(q.type==='order')for(const step of q.steps)await page.locator('.proof-bank').getByRole('button',{name:step,exact:true}).click();
  await click('Check answer');
 }
 await page.locator('.feedback.success').waitFor();
}
try{
 await page.goto(base);await heading(/Every number/);await shot('desktop-home');await noOverflow();
 await page.setViewportSize({width:Number(arg('width'))||390,height:844});await shot('mobile-home');await noOverflow();
 assert.equal(await page.locator('.world-card:disabled').count(),5);
 await click('Start your adventure');await click('Open the case');await heading(WORLDS[0].rounds[0].title);await shot('sequence-machine');
 if(process.argv.includes('--full')){
  await click('Check answer');await click('Check answer');await click('Show me how');assert.ok((await page.locator('.hint-panel').innerText()).includes('5 + 6 + 7 + 8'));
  await click('Map');await page.reload();await click('Continue adventure');await click('Resume case file');
  let count=0;
  for(const [wi,w] of WORLDS.entries()){
   if(wi){await click(`Next: ${w.name}`);await click('Open the case');}
   for(const [qi,q] of w.rounds.entries()){
    await heading(q.title);await noOverflow();
    if(['switch-zero','parity-proof','leftovers','missing-nine','cipher-triple','final-evidence'].includes(q.id))await shot(q.id);
    if(q.id==='cipher-add'){await click('Check answer');await page.locator('.feedback.note').waitFor();assert.equal(await page.locator('.feedback.retry').count(),0);}
    await solve(q);count++;
    if(wi===0&&qi===0){await page.reload();continue;}
    await click(qi===5?'Collect discovery':'Next discovery');
   }
   await page.locator('.results-card').waitFor();console.log(`✓ ${w.name}: six investigations`);
  }
  assert.equal(count,36);await heading('A brilliant number detective.');await shot('completed');
  assert.equal(await page.locator('.star-total').getAttribute('aria-label'),'17 of 18 stars');
  await click('Back to the adventure');assert.equal(await page.locator('.world-card:disabled').count(),0);
  await page.getByRole('button',{name:/The Sign Studio\./}).click();await click('Open the case');
  for(const [i,q] of WORLDS[0].rounds.entries()){await solve(q);await click(i===5?'Collect discovery':'Next discovery');}
  assert.equal(await page.locator('.star-total').getAttribute('aria-label'),'18 of 18 stars');await click('Adventure');
 }else{await solve(WORLDS[0].rounds[0]);await click('Next discovery');await heading(WORLDS[0].rounds[1].title);}
 await click('Field notes');await page.locator('summary').first().click();await noOverflow();await shot('field-notes');
 await click('Play lab');await setDial('First number',-4);assert.equal(await page.locator('.pattern-table tbody tr').count(),8);assert.equal(await page.locator('.pattern-table td').filter({hasText:/^Even$/}).count(),8);await shot('sign-lab');await noOverflow();
 await click('Remainder lab');await setDial('Counters',0);assert.equal(await page.locator('.lab-equation').innerText(),'0 = 0 × 5 + 0');await setDial('Counters',37);await setDial('Tray size',6);assert.equal(await page.locator('.lab-equation').innerText(),'37 = 6 × 6 + 1');await shot('remainder-lab');await noOverflow();
 await click('Digit scanner');await page.getByLabel('Number to investigate').fill('5082');assert.ok((await page.locator('.alternating-scan').innerText()).includes('= -11'));assert.equal(await page.locator('.scan-stats b').allTextContents().then(x=>x.join(',')),'15,6,6');await shot('digit-scanner');await noOverflow();
 await page.getByLabel('Number to investigate').fill('999999999999');assert.equal(await page.locator('.scan-stats b').allTextContents().then(x=>x.join(',')),'108,9,0');await noOverflow();
 await page.getByLabel('Number to investigate').fill('0');assert.equal(await page.locator('.divides').count(),9);await page.getByLabel('Number to investigate').fill('abc');await page.locator('.invalid-note').waitFor();
 const scope=await page.evaluate(async()=>(await navigator.serviceWorker.ready).scope);assert.equal(scope,new URL('./',base).href);
 await context.setOffline(true);await page.reload();await heading('Follow your own hunch.');await click('Digit scanner');await page.getByLabel('Number to investigate').fill('99');assert.equal(await page.locator('.scan-stats b').allTextContents().then(x=>x.join(',')),'18,9,0');await context.setOffline(false);
 console.log('✓ All three labs, 12-digit/zero/invalid inputs, field notes, service worker and offline reload');
 for(const width of [320,768]){await page.setViewportSize({width,height:1000});await click('Adventure');await noOverflow();await shot(`home-${width}`);await click('Play lab');await noOverflow();await click('Digit scanner');await noOverflow();}
 await click('Adventure');await click('Adventure settings');await page.getByLabel('Classroom mode').check();await click('Done');await page.locator('.classroom-banner').waitFor();assert.equal(await page.locator('.world-card:disabled').count(),0);
 await click('Adventure settings');await click('Reset this device’s progress');await click('Keep my progress');await click('Close settings');await click('Mute sound');await page.reload();await page.getByRole('button',{name:'Turn sound on',exact:true}).waitFor();
 await click('Adventure settings');await click('Reset this device’s progress');await click('Yes, reset progress');assert.equal(await page.locator('.star-total').getAttribute('aria-label'),'0 of 18 stars');assert.equal(await page.locator('.world-card:disabled').count(),5);
 assert.deepEqual(errors,[]);console.log('✓ Responsive layouts, classroom controls, reset confirmation and sound persistence; no runtime errors');
}catch(error){console.error('Browser errors:',errors);console.error('Current page:',await page.locator('body').innerText());await shot('failure');throw error;}finally{await browser.close();}
