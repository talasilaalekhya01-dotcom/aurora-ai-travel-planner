import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, validateInput, calculateBudget, checkTimetable, getAISelection, getWeather, rankPlaces, InputError, addDays } from '../lib/planner.mjs';
import { catalogue, cityNames } from '../lib/catalogue.mjs';
const TODAY = '2030-05-10';
const base = {
  city:'Hyderabad', startDate:'2030-05-11', days:3, travellers:2,
  budget:15000, hours:8, startHour:9, roomRate:1500, foodRate:600,
  transportRate:700, activityRate:150, intercity:0, bufferPercent:10,
  rooms:1, pace:'balanced', interests:['history','nature'], useAI:false,
  diet:'any', seed:0
};
const options = { today:TODAY, weatherEnabled:false };
const weather = { status:'disabled',message:'Test: weather disabled',fetchedAt:null,days:[0,1,2].map(i=>({date:addDays(base.startDate,i),available:false})) };

test('normalizes a valid request',()=>{ const input=validateInput(base,TODAY);assert.equal(input.city,'Hyderabad');assert.equal(input.days,3); });
test('rejects unsupported destinations',()=>assert.throws(()=>validateInput({...base,city:'Unknown city'},TODAY),InputError));
test('rejects past dates and impossible calendar dates',()=>{for(const date of ['2029-01-01','2030-02-31','wrong'])assert.throws(()=>validateInput({...base,startDate:date},TODAY),InputError);});
test('rejects fractional or out-of-range groups and trip lengths',()=>{for(const n of [0,9,1.5])assert.throws(()=>validateInput({...base,travellers:n},TODAY),InputError);assert.throws(()=>validateInput({...base,days:4},TODAY),InputError);});
test('rejects invalid/negative/missing budgets',()=>{for(const budget of [-1,'abc',null,true,''])assert.throws(()=>validateInput({...base,budget},TODAY),InputError);});
test('limits free-text input length',()=>assert.throws(()=>validateInput({...base,request:'x'.repeat(501)},TODAY),InputError));
test('calculates room nights, people, stops and buffer correctly',()=>{
  const b=calculateBudget(validateInput(base,TODAY),9);
  assert.equal(b.total,12540);assert.equal(b.remaining,2460);assert.equal(b.perPerson,6270);assert.equal(b.withinBudget,true);
  assert.equal(b.items.find(x=>x.key==='stay').amount,3000);
});
test('one-day trips do not automatically book a hotel night',()=>{
  const b=calculateBudget(validateInput({...base,days:1},TODAY),3);assert.equal(b.items.find(x=>x.key==='stay').amount,0);
});
test('return travel is a total group allowance, not multiplied by people',()=>{
  const b=calculateBudget(validateInput({...base,intercity:4000},TODAY),3);assert.equal(b.items.find(x=>x.key==='intercity').amount,4000);
});
test('all cities, lengths, paces and time windows produce valid timetables',async()=>{
  for(const city of cityNames)for(const days of [1,2,3])for(const pace of ['relaxed','balanced'])for(const hours of [4,6,10]){
    const p=await buildPlan({...base,city,days,pace,hours},options);
    assert.equal(p.days.length,days);assert.deepEqual(checkTimetable(p.days,p.input),[]);
    const ids=p.days.flatMap(d=>d.entries).filter(e=>e.type==='attraction').map(e=>e.placeId);
    assert.equal(new Set(ids).size,ids.length);assert(ids.every(id=>catalogue[city].places.some(place=>place.id===id)));
  }
});
test('no-key useAI fallback is visibly rule-based',async()=>{const p=await buildPlan({...base,useAI:true},options);assert.equal(p.ai.mode,'Rule-based');assert.match(p.ai.note,/No Gemini key/);});
test('low budgets are not falsely declared feasible',async()=>{const p=await buildPlan({...base,budget:100},options);assert.equal(p.budget.withinBudget,false);assert(p.warnings.some(w=>w.includes('remains over budget')));assert(p.days.every(d=>d.entries.filter(e=>e.type==='attraction').length<=1));});
test('cheaper action reduces stops without changing non-activity rates',async()=>{const a=await buildPlan(base,options),b=await buildPlan({...base,action:'cheaper'},options);assert(b.budget.total<a.budget.total);for(const field of ['foodRate','roomRate','transportRate'])assert.equal(a.input[field],b.input[field]);});
test('relaxed action changes the pace',async()=>{const p=await buildPlan({...base,action:'relaxed'},options);assert.equal(p.input.pace,'relaxed');assert(p.days.every(d=>d.entries.filter(e=>e.type==='attraction').length<=2));});
test('uninterpreted custom requests are not passed off as handled',async()=>{const p=await buildPlan({...base,request:'Skip the fort',action:'custom'},options);assert(p.warnings.some(w=>w.includes('not interpreted')));});
test('zero allowances and excluded intercity travel are disclosed',async()=>{const p=await buildPlan({...base,foodRate:0},options);assert(p.warnings.some(w=>w.includes('zero')));assert(p.warnings.some(w=>w.includes('Travel to/from')));});
test('AI selection filters invented IDs and duplicates',async()=>{
  const input=validateInput({...base,useAI:true},TODAY),ranked=rankPlaces(input,weather);
  const mock=async(url,opts)=>{
    assert.match(String(url),/generateContent$/);assert.equal(opts.headers['x-goog-api-key'],'TEST_SECRET');
    return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({orderedPlaceIds:[ranked[1].id,'invented',ranked[1].id],summary:'Prefer a quieter start.'})}]}}]})};
  };
  const result=await getAISelection(input,ranked,weather,{apiKey:'TEST_SECRET',fetchFn:mock});
  assert.equal(result.mode,'Gemini-assisted');assert.equal(result.ids[0],ranked[1].id);assert.equal(result.ids.length,ranked.length);assert(!result.ids.includes('invented'));assert(!JSON.stringify(result).includes('TEST_SECRET'));
});
test('quota errors lead to rule-based mode and no paid fallback',async()=>{
  const input=validateInput({...base,useAI:true},TODAY),ranked=rankPlaces(input,weather);
  const result=await getAISelection(input,ranked,weather,{apiKey:'TEST',fetchFn:async()=>({ok:false,status:429})});
  assert.equal(result.mode,'Rule-based');assert.match(result.note,/no paid fallback/);
});
test('invalid AI JSON does not break the app',async()=>{
  const input=validateInput({...base,useAI:true},TODAY),ranked=rankPlaces(input,weather);
  const result=await getAISelection(input,ranked,weather,{apiKey:'TEST',fetchFn:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:'not JSON'}]}}]})})});
  assert.equal(result.mode,'Rule-based');
});
test('a future trip outside forecast coverage never makes a weather call',async()=>{
  const input=validateInput({...base,startDate:'2030-07-01'},TODAY);
  const result=await getWeather(input,{today:TODAY,fetchFn:async()=>{throw new Error('Should not be called');}});
  assert.equal(result.status,'out-of-range');assert(result.days.every(d=>!d.available));
});
test('weather network failure is handled honestly',async()=>{
  const input=validateInput({...base,city:'Jaipur'},TODAY);
  const result=await getWeather(input,{today:TODAY,fetchFn:async()=>{throw new Error('Offline');}});
  assert.equal(result.status,'unavailable');assert(result.days.every(d=>!d.available));
});
test('weather is matched to requested dates, not blindly to today',async()=>{
  const input=validateInput({...base,city:'Goa',days:2},TODAY);
  const result=await getWeather(input,{today:TODAY,fetchFn:async()=>({ok:true,json:async()=>({daily:{time:[TODAY,'2030-05-11','2030-05-12'],weather_code:[0,61,3],temperature_2m_max:[30,29,28],temperature_2m_min:[24,23,22],precipitation_probability_max:[0,80,30]}})})});
  assert.equal(result.status,'available');assert.equal(result.days[0].date,'2030-05-11');assert.equal(result.days[0].high,29);assert.equal(result.days[0].rain,80);
});
test('packing notes respond to retrieved rain forecast',async()=>{
  const wet={status:'available',message:'Mock data',fetchedAt:'2030-05-10T00:00:00Z',days:weather.days.map(d=>({...d,available:true,rain:80,high:32,low:24,description:'Rain'}))};
  const p=await buildPlan(base,{...options,weather:wet});assert(p.packing.includes('Rain jacket or umbrella'));assert(p.packing.includes('Sun protection and a hat'));
});
