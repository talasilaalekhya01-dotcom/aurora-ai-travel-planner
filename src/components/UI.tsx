import { createContext, useContext, useId, useEffect, useRef, type CSSProperties, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
export const text=(size=14,weight=400,color='var(--text)'):CSSProperties=>({fontFamily:"'Inter', sans-serif",fontSize:size,fontWeight:weight,lineHeight:1.65,color})
export const heading=(size:number|string=32):CSSProperties=>({fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:size,fontWeight:500,lineHeight:1.15,letterSpacing:'-.045em',color:'var(--ivory)'})
export function H({children,size=32,as='h2',className='',style={}}:{children:ReactNode;size?:number|string;as?:'h1'|'h2'|'h3'|'h4';className?:string;style?:CSSProperties}){const Tag=as;return <Tag className={className} style={{...heading(size),...style}}>{children}</Tag>}
export function P({children,size=14,className='',style={}}:{children:ReactNode;size?:number;className?:string;style?:CSSProperties}){return <p className={className} style={{...text(size,400,'var(--muted)'),...style}}>{children}</p>}
export function Eyebrow({children}:{children:ReactNode}){return <span className="eyebrow" style={{...text(10,600,'var(--mint)'),letterSpacing:'.17em',textTransform:'uppercase'}}>{children}</span>}
export type IconName='arrow'|'up-right'|'pin'|'calendar'|'users'|'sparkles'|'wallet'|'clock'|'check'|'close'|'save'|'download'|'sun'|'cloud'|'rain'|'food'|'car'|'leaf'|'museum'|'globe'|'chevron'|'play'|'menu'|'plus'|'trash'|'refresh'|'info'|'bed'|'route'|'bag'|'print'|'upload'|'shield'|'settings'|'history'|'edit'|'copy'
const paths:Record<IconName,ReactNode>={
 arrow:<><path d="M4 12h16M14 6l6 6-6 6"/></>,
 'up-right':<path d="M6 18 18 6M6 6h12v12"/>,
 pin:<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
 calendar:<><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3m4 0h3m-10 3h3"/></>,
 users:<><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2"/></>,
 sparkles:<><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4M18 4h4"/></>,
 wallet:<><path d="M21 7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16V7M21 11h-6v6h6"/><circle cx="17" cy="14" r=".5"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
 check:<path d="m5 12 4 4L19 6"/>,close:<path d="m6 6 12 12M18 6 6 18"/>,
 save:<path d="M6 3h12v18l-6-4-6 4V3Z"/>,download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
 sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/></>,
 cloud:<path d="M7 19a5 5 0 1 1 .5-10A7 7 0 0 1 21 12a4 4 0 0 1-1 7H7Z"/>,
 rain:<><path d="M6 15a4 4 0 1 1 1-8 6 6 0 0 1 12 2 4 4 0 0 1 1 7M8 18l-1 3m6-3-1 3m6-3-1 3"/></>,
 food:<><path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M17 3v18m0-18c5 4 5 8 0 8"/></>,
 car:<><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11 1 11.9 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></>,
 leaf:<><path d="M20 3C8 1 1 9 5 16s16 5 15-13ZM4 21l11-12"/></>,
 museum:<><path d="m2 8 10-6 10 6H2ZM4 10v9m5-9v9m6-9v9m5-9v9M2 22h20M2 19h20"/></>,
 globe:<><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
 chevron:<path d="m6 9 6 6 6-6"/>,play:<path d="m8 4 12 8-12 8V4Z"/>,menu:<path d="M4 6h16M4 12h16M4 18h16"/>,plus:<path d="M12 5v14M5 12h14"/>,
 trash:<><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></>,refresh:<><path d="M20 7a9 9 0 1 0 1 9M20 3v5h-5"/></>,
 info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,bed:<><path d="M3 3v18M3 15h18v6M3 9h6v6M9 8h9a3 3 0 0 1 3 3v4"/></>,
 route:<><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M5 7v8a4 4 0 0 0 4 4h8M7 5h8a4 4 0 0 1 0 8h-3"/></>,
 bag:<><path d="M5 7h14l2 14H3L5 7ZM8 7V5a4 4 0 0 1 8 0v2"/></>,
 print:<><path d="M7 8V3h10v5M7 17H3V9h18v8h-4M7 14h10v7H7Z"/></>,
 upload:<><path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/></>,
 shield:<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-5 10 3 3 7-7"/>,
 settings:<><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></>,
 history:<><path d="M3 10a9 9 0 1 1 1 7M3 4v6h6M12 7v6l3 2"/></>,
 edit:<><path d="m15 3 6 6L9 21H3v-6L15 3ZM12 6l6 6"/></>,
 copy:<><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>
}
export function Icon({name,size=18,className=''}:{name:IconName;size?:number;className?:string}){return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>}
type ButtonProps=ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'ghost'|'light';icon?:IconName;small?:boolean}
export function Button({children,variant='secondary',icon,small=false,className='',...props}:ButtonProps){return <motion.button type="button" className={`btn btn-${variant} ${small?'btn-small':''} ${className}`} style={text(small?12:13,500)} whileHover={props.disabled?{}:{scale:1.015}} whileTap={props.disabled?{}:{scale:.975}} {...props as object}>{icon&&<Icon name={icon} size={small?15:17}/>} {children}</motion.button>}
const FieldContext=createContext<{label:string;hint?:string}|null>(null)
export function Field({label,hint,children,className=''}:{label:string;hint?:string;children:ReactNode;className?:string}){const id=useId();return <FieldContext.Provider value={{label:`${id}-label`,hint:hint?`${id}-hint`:undefined}}><label className={`field ${className}`}><span id={`${id}-label`} style={text(12,500)}>{label}</span>{children}{hint&&<span id={`${id}-hint`} style={text(10,400,'var(--muted)')}>{hint}</span>}</label></FieldContext.Provider>}
export function Input(props:InputHTMLAttributes<HTMLInputElement>){const field=useContext(FieldContext);return <input aria-labelledby={field?.label} aria-describedby={field?.hint} {...props} style={{...text(13),...props.style}}/>}
export function Select({children,...props}:SelectHTMLAttributes<HTMLSelectElement>){const field=useContext(FieldContext);return <select aria-labelledby={field?.label} aria-describedby={field?.hint} {...props} style={{...text(13),...props.style}}>{children}</select>}
export function Badge({children,kind='neutral'}:{children:ReactNode;kind?:'green'|'amber'|'neutral'}){return <span className={`badge badge-${kind}`} style={text(10,500,kind==='green'?'var(--mint)':kind==='amber'?'var(--amber)':'var(--muted)')}>{children}</span>}
export function Modal({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const d=ref.current;if(d&&!d.open)d.showModal();return()=>{if(d?.open)d.close();previous?.focus()}},[]);
  return <dialog ref={ref} className={`modal ${wide?'modal-wide':''}`} aria-label={title} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal-inner"><header className="modal-header"><H size={24}>{title}</H><button className="icon-btn" aria-label="Close dialog" onClick={onClose}><Icon name="close"/></button></header>{children}</div></dialog>
}
export function External({href,children,className=''}:{href?:string;children:ReactNode;className?:string}){if(!href)return null;return <a href={href} target="_blank" rel="noopener noreferrer" className={`text-link ${className}`} style={text(11,500,'var(--mint)')}>{children}<Icon name="up-right" size={12}/></a>}
