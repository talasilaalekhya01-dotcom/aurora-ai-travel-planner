import type { TripInput, Plan, SavedTrip, DemoBooking } from './types'
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)
export const num=(value:number)=>new Intl.NumberFormat('en-IN').format(value)
export const today=()=>new Date(Date.now()+330*60000).toISOString().slice(0,10)
export const addDays=(date:string,n:number)=>new Date(Date.parse(date+'T00:00:00Z')+n*86400000).toISOString().slice(0,10)
export const formatDate=(date:string,full=false)=>new Date(date+'T12:00:00Z').toLocaleDateString('en-IN',full?{day:'numeric',month:'long',year:'numeric'}:{day:'numeric',month:'short'})
export const initialInput=():TripInput=>({city:'Hyderabad',startDate:addDays(today(),1),days:3,travellers:2,budget:15000,interests:['history','nature'],pace:'balanced',useAI:false,hours:8,startHour:9,roomRate:1500,foodRate:600,transportRate:700,activityRate:150,intercity:0,bufferPercent:10,rooms:1,diet:'any',request:'',action:'',seed:0,excludedPlaceIds:[]})
export const safeURL=(raw?:string)=>{try{const u=new URL(raw||'');return u.protocol==='https:'?u.href:undefined}catch{return undefined}}
export function directions(day:Plan['days'][number],city:string){
  const stops=day.entries.filter(e=>e.type==='attraction');
  if(!stops.length)return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city)}`;
  if(stops.length===1)return safeURL(stops[0].mapUrl)||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0].title+' '+city)}`;
  const query=new URLSearchParams({api:'1',origin:stops[0].title+' '+city,destination:stops.at(-1)!.title+' '+city,travelmode:'driving'});
  if(stops.length>2)query.set('waypoints',stops.slice(1,-1).map(e=>e.title+' '+city).join('|'));
  return `https://www.google.com/maps/dir/?${query}`;
}
export function isPlan(value:unknown):value is Plan {
  // Imported JSON is untrusted: validate nested display values before React or calendar export uses them.
  try {
    if(!value||typeof value!=='object')return false;
    const p=value as Plan;
    const string=(x:unknown,max=10000)=>typeof x==='string'&&x.length<=max;
    const finite=(x:unknown)=>typeof x==='number'&&Number.isFinite(x);
    const date=(x:unknown)=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
    const strings=(x:unknown,max=100)=>Array.isArray(x)&&x.length<=max&&x.every(y=>string(y));
    const weatherDay=(d:Plan['weather']['days'][number])=>!!d&&date(d.date)&&typeof d.available==='boolean'&&(!d.available||(finite(d.high)&&finite(d.low)&&string(d.description)&&(d.rain===null||d.rain===undefined||finite(d.rain))));
    if(![1,2].includes(p.version)||!string(p.id,100)||!/^[-a-zA-Z0-9_]+$/.test(p.id)||!string(p.title)||!string(p.summary)||!string(p.createdAt)||!string(p.limitations)||!string(p.hotelSearch)||!string(p.restaurantSearch))return false;
    const i=p.input;
    if(!i||!['Hyderabad','Jaipur','Goa'].includes(i.city)||!Number.isInteger(i.days)||i.days<1||i.days>3||!date(i.startDate)||!strings(i.interests,6)||!['balanced','relaxed'].includes(i.pace)||!['any','vegetarian','vegan'].includes(i.diet)||typeof i.useAI!=='boolean'||!string(i.request)||!string(i.action)||!finite(i.seed))return false;
    for(const key of ['travellers','budget','hours','startHour','roomRate','foodRate','transportRate','activityRate','intercity','bufferPercent','rooms'] as const)if(!finite(i[key])||i[key]<0)return false;
    if(i.travellers<1||i.travellers>8||!Number.isInteger(i.travellers)||(i.arrivalHour!==undefined&&!finite(i.arrivalHour))||(i.departureHour!==undefined&&!finite(i.departureHour))||(i.excludedPlaceIds!==undefined&&!strings(i.excludedPlaceIds,30)))return false;
    if(!p.ai||!string(p.ai.mode)||!string(p.ai.note)||!string(p.ai.summary)||!p.weather||!string(p.weather.message)||!string(p.weather.status)||!Array.isArray(p.weather.days)||p.weather.days.length!==i.days||!p.weather.days.every(weatherDay))return false;
    if(!Array.isArray(p.days)||p.days.length!==i.days||!p.days.every(d=>d&&date(d.date)&&Number.isInteger(d.number)&&d.number>=1&&d.number<=i.days&&weatherDay(d.weather)&&Array.isArray(d.entries)&&d.entries.length<=30&&d.entries.every(e=>e&&['attraction','meal','transfer','free'].includes(e.type)&&string(e.title)&&string(e.details)&&string(e.start)&&string(e.end)&&finite(e.startMinutes)&&finite(e.endMinutes)&&e.startMinutes>=0&&e.endMinutes<=1440&&e.endMinutes>e.startMinutes&&(!e.tags||strings(e.tags,10))&&[e.placeId,e.area,e.source,e.mapUrl].every(x=>x===undefined||string(x)))))return false;
    const b=p.budget;
    return !!b&&finite(b.total)&&b.total>=0&&finite(b.cap)&&finite(b.remaining)&&finite(b.perPerson)&&typeof b.withinBudget==='boolean'&&Array.isArray(b.items)&&b.items.length<=10&&b.items.every(item=>item&&string(item.key)&&string(item.label)&&string(item.calculation)&&finite(item.amount)&&item.amount>=0)&&strings(p.warnings)&&strings(p.packing,40)&&strings(p.workflow);
  } catch {return false;}
}
export function readSaved():SavedTrip[]{try{const raw=JSON.parse(localStorage.getItem('aurora-trips-v2')||'[]');return Array.isArray(raw)?raw.filter((s:SavedTrip)=>typeof s?.name==='string'&&typeof s?.savedAt==='string'&&isPlan(s?.plan)).slice(0,20):[]}catch{return []}}
export function readBookings():DemoBooking[]{try{const raw=JSON.parse(localStorage.getItem('aurora-bookings-v2')||'[]');return Array.isArray(raw)?raw.filter((b:DemoBooking)=>typeof b?.id==='string'&&typeof b.tripId==='string'&&typeof b.title==='string'&&typeof b.startDate==='string'&&typeof b.endDate==='string'&&typeof b.note==='string'&&['Hyderabad','Jaipur','Goa'].includes(b.city)&&['Stay','Transport','Activity'].includes(b.type)&&['Demo recorded','Cancelled'].includes(b.status)).slice(0,100):[]}catch{return []}}
export function persist(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
export function download(name:string,text:string,mime='text/plain;charset=utf-8'){
  const url=URL.createObjectURL(new Blob([text],{type:mime}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
export function planText(p:Plan){
  return ['AURORA TRAVEL',p.title,p.summary,`Start: ${p.input.startDate} | Travellers: ${p.input.travellers}`,`Mode: ${p.ai.mode}`,p.ai.note,'',...p.days.flatMap(d=>[`DAY ${d.number} - ${d.date}`,...d.entries.map(e=>`${e.start}-${e.end} | ${e.title}${e.area?' | '+e.area:''}${e.mapUrl?'\n  '+e.mapUrl:''}`),'']), 'ESTIMATED GROUP BUDGET',...p.budget.items.map(i=>`${i.label}: ${money(i.amount)} (${i.calculation})`),`Total: ${money(p.budget.total)} | Budget: ${money(p.budget.cap)}`,`Remaining: ${money(p.budget.remaining)}`,'','PACKING',...p.packing.map(x=>'[ ] '+x),'','IMPORTANT LIMITATIONS',...p.warnings.map(x=>'- '+x),'No payment, real booking or guaranteed price is included.'].join('\n');
}
const escapeICS=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r/g,'')
export function planICS(p:Plan){
  const stamp=(date:string,mins:number)=>new Date(Date.parse(date+'T00:00:00Z')+(mins-330)*60000).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
  const now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Aurora Travel//Itinerary Demo//EN','CALSCALE:GREGORIAN',...p.days.flatMap(d=>d.entries.filter(e=>e.type==='attraction').flatMap((e,i)=>['BEGIN:VEVENT',`UID:${p.id}-${d.number}-${i}@aurora.local`,`DTSTAMP:${now}`,`DTSTART:${stamp(d.date,e.startMinutes)}`,`DTEND:${stamp(d.date,e.endMinutes)}`,`SUMMARY:${escapeICS(e.title+' (proposed visit)')}`,`LOCATION:${escapeICS(e.title+', '+p.input.city)}`,'STATUS:TENTATIVE',`DESCRIPTION:${escapeICS('Planning suggestion only. Verify hours and access. No reservation. '+(e.mapUrl||''))}`,'END:VEVENT'])),'END:VCALENDAR'];
  // Fold by UTF-8 byte length; RFC 5545 lines must not exceed 75 octets.
  return lines.map(line=>{let out='',part='';for(const ch of line){if(new TextEncoder().encode(part+ch).length>73){out+=part+'\r\n';part=' ';}part+=ch;}return out+part;}).join('\r\n')+'\r\n';
}
export async function api<T>(path:string,input?:unknown,signal?:AbortSignal):Promise<T>{
  const response=await fetch(path,{method:input?'POST':'GET',headers:input?{'Content-Type':'application/json'}:undefined,body:input?JSON.stringify(input):undefined,signal});
  let result;try{result=await response.json()}catch{throw new Error('The server did not return JSON. Run the Node backend and try again.')}
  if(!response.ok)throw new Error(result.error||`Request failed (${response.status}).`);return result as T;
}
