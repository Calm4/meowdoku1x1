import test from 'node:test';
import assert from 'node:assert/strict';
// Simulate two independent TLS WebSocket connections and MQTT broker forwarding.
const clients=new Set(),payloads=[];let store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
globalThis.window=new EventTarget();globalThis.CustomEvent=class extends Event{constructor(type,opts){super(type);this.detail=opts?.detail;}};
function utf(bytes,p){const n=bytes[p]*256+bytes[p+1];return [new TextDecoder().decode(bytes.slice(p+2,p+2+n)),p+2+n];}
class Socket{
 constructor(){this.readyState=0;this.binaryType='';clients.add(this);queueMicrotask(()=>{this.readyState=1;this.onopen();});}
 send(bytes){const type=bytes[0]>>4;let p=1,n=0,m=1,b;do{b=bytes[p++];n+=(b&127)*m;m*=128;}while(b&128);const data=bytes.slice(p,p+n);const deliver=(target,arr)=>queueMicrotask(()=>target.onmessage?.({data:new Uint8Array(arr).buffer}));if(type===1)deliver(this,[32,2,0,0]);if(type===8){this.topic=utf(data,2)[0].slice(0,-2);deliver(this,[144,3,data[0],data[1],1]);}if(type===3){const [topic,start]=utf(data,0);const payload=data.slice(start+2);payloads.push(new TextDecoder().decode(payload));const body=new Uint8Array(data.length-2);body.set(data.slice(0,start));body.set(payload,start);let len=body.length,remaining=[];do{let z=len%128;len=Math.floor(len/128);if(len)z|=128;remaining.push(z);}while(len);for(const c of clients)if(c.topic&&topic.startsWith(c.topic+'/'))deliver(c,[48,...remaining,...body]);}if(type===12)deliver(this,[208,0]);}
 close(){this.readyState=3;clients.delete(this);this.onclose?.();}
}
globalThis.WebSocket=Socket;
const {Transport}=await import('./transport.js');
test('encrypted relay synchronizes host and guest with duplicate messages',async()=>{const host=new Transport();const created=await host.request('create',{name:'Персик'});const room=created.state.code;const ownerStore=store;store=new Map();const guest=new Transport();const joined=await guest.request('join',{room,name:'Луна'});assert.equal(joined.state.players.length,2);assert.equal(host.owner.players.length,2);assert.equal(joined.state.host,false);let current;guest.listeners.add(s=>current=s);store=ownerStore;const started=await host.request('start',{room,token:created.token,difficulty:'easy'});await new Promise(r=>setTimeout(r,20));assert.equal(current.round,1);assert.deepEqual(current.players[1].values,started.state.board);host.owner.start=Date.now()-100;const i=host.owner.board.findIndex(n=>!n);const result=await guest.request('move',{room,token:joined.token,index:i,value:host.owner.answer[i]});assert.equal(result.state.players[1].progress,1);assert.equal(result.state.players[0].values,undefined);assert.ok(payloads.every(p=>!p.includes('Персик')&&!p.includes('answer')&&!p.includes('move')));host.relay.close();guest.relay.close();});
