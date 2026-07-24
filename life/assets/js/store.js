export const KEY='ebrulife.v1';
const blank={settings:{name:'',theme:'system',currency:'TRY',dateFormat:'tr-TR',weekStart:'monday',notifications:false},tasks:[],goals:[],habits:[],subscriptions:[],events:[],warranties:[],vehicles:[],notes:[],budget:[],recent:[]};
const clone=v=>JSON.parse(JSON.stringify(v));
let storageError=null;
export function load(){try{const data=JSON.parse(localStorage.getItem(KEY));storageError=null;return data&&typeof data==='object'?{...clone(blank),...data,settings:{...blank.settings,...data.settings}}:clone(blank)}catch(error){storageError=error;console.error('EbruLife veri okuma hatası:',error);return clone(blank)}}
export function save(data){try{localStorage.setItem(KEY,JSON.stringify(data));storageError=null;return true}catch(error){storageError=error;console.error('EbruLife kayıt hatası:',error);return false}}
export function getStorageError(){return storageError}
export function uid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}
export function safe(value,max=5000){return String(value??'').trim().slice(0,max)}
export function exportData(data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ebrulife-yedek-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
export async function importData(file){if(!file||file.size>5_000_000)throw new Error('Yedek dosyası en fazla 5 MB olabilir.');const parsed=JSON.parse(await file.text());if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Geçerli bir EbruLife yedeği seçin.');for(const k of Object.keys(blank))if(parsed[k]!==undefined&&k!=='settings'&&!Array.isArray(parsed[k]))throw new Error('Yedek yapısı geçersiz.');return {...clone(blank),...parsed,settings:{...blank.settings,...parsed.settings}}}
export function reset(){try{localStorage.removeItem(KEY);storageError=null;return true}catch(error){storageError=error;console.error('EbruLife veri silme hatası:',error);return false}}
