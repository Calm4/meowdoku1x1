// MQTT 3.1.1 over TLS WebSocket; payloads are encrypted before leaving the device.
const encoder=new TextEncoder(),decoder=new TextDecoder();
const str=s=>{const b=encoder.encode(s);return new Uint8Array([b.length>>8,b.length&255,...b]);};
function packet(type,body){let n=body.length,length=[];do{let b=n%128;n=Math.floor(n/128);if(n)b|=128;length.push(b);}while(n);return new Uint8Array([type,...length,...body]);}
export class Relay{
 constructor(topic,onmessage,onstatus){this.topic=topic;this.onmessage=onmessage;this.onstatus=onstatus;this.clients=[];this.closed=false;for(const url of ['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt'])this.open(url);}
 open(url){if(this.closed)return;const ws=new WebSocket(url,['mqtt']);ws.binaryType='arraybuffer';let ready=false,buffer=new Uint8Array(),id=1,ping,timeout;this.clients.push(ws);
 const send=(t,b)=>ws.readyState===1&&ws.send(packet(t,b));
 ws.onopen=()=>{const client='meow-'+crypto.randomUUID().slice(0,18);send(16,[...str('MQTT'),4,2,0,30,...str(client)]);timeout=setTimeout(()=>ws.close(),12000);};
 ws.onmessage=e=>{const bytes=new Uint8Array(e.data);const joined=new Uint8Array(buffer.length+bytes.length);joined.set(buffer);joined.set(bytes,buffer.length);buffer=joined;while(buffer.length>1){let n=0,m=1,p=1,b;do{if(p>=buffer.length)return;b=buffer[p++];n+=(b&127)*m;m*=128;if(p>5){ws.close();return;}}while(b&128);if(buffer.length<p+n)return;const type=buffer[0]>>4,flags=buffer[0]&15,data=buffer.slice(p,p+n);buffer=buffer.slice(p+n);if(type===2){if(data[1]!==0){ws.close();return;}send(130,[0,1,...str(this.topic+'/#'),1]);}
 if(type===9){clearTimeout(timeout);ready=true;ws.meowReady=true;this.onstatus(this.connected);ping=setInterval(()=>send(192,[]),20000);}
 if(type===3){const len=(data[0]<<8)+data[1];let start=2+len;const topic=decoder.decode(data.slice(2,start));if((flags>>1&3)===1){send(64,[data[start],data[start+1]]);start+=2;}try{this.onmessage(topic,decoder.decode(data.slice(start)));}catch{}}
 }};
 ws.onerror=()=>ws.close();ws.onclose=()=>{clearTimeout(timeout);clearInterval(ping);ws.meowReady=false;this.clients=this.clients.filter(x=>x!==ws);this.onstatus(this.connected);if(!this.closed)setTimeout(()=>this.open(url),2500);};
 ws.publish=(suffix,payload)=>{if(!ready)return;const next=(id++%65534)+1;send(50,[...str(this.topic+'/'+suffix),next>>8,next&255,...encoder.encode(payload)]);};
 }
 get connected(){return this.clients.some(x=>x.meowReady);}
 publish(suffix,payload){for(const c of this.clients)if(c.meowReady)c.publish(suffix,payload);}
 close(){this.closed=true;for(const c of [...this.clients])c.close();}
}
