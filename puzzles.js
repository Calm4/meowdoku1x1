import {bank} from './puzzle-bank.js?v=3';
export function solve(regions,n,limit=2){const out=[],path=[];function visit(row,cols,zones,prev){if(out.length>=limit)return;if(row===n){out.push([...path]);return;}for(let col=0;col<n;col++){const zone=regions[row*n+col];if((cols&(1<<col))||(zones&(1<<zone))||Math.abs(col-prev)<=1)continue;path.push(row*n+col);visit(row+1,cols|1<<col,zones|1<<zone,col);path.pop();}}visit(0,0,0,-10);return out;}

export function makePuzzle(level='easy',{exclude=[]}={}){
 const all=bank[level];if(!all)throw Error('Неизвестная сложность');
 const fresh=all.filter(p=>!exclude.includes(p.id));const pool=fresh.length?fresh:all;
 const source=pool[Math.floor(Math.random()*pool.length)],n=source.n;
 const turns=Math.floor(Math.random()*4),mirror=Math.random()<.5;
 const transform=i=>{let r=Math.floor(i/n),c=i%n;if(mirror)c=n-1-c;for(let t=0;t<turns;t++)[r,c]=[c,n-1-r];return r*n+c;};
 const colors=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[colors[i],colors[j]]=[colors[j],colors[i]];}
 const regions=Array(n*n);source.regions.forEach((z,i)=>regions[transform(i)]=colors[z]);
 return {n,regions,answer:source.answer.map(transform).sort((a,b)=>a-b),given:source.given.map(transform),rating:{...source.rating},puzzleId:source.id};
}
export function blockedBy(index,cats,regions,n){const r=Math.floor(index/n),c=index%n;return cats.some(i=>Math.floor(i/n)===r||i%n===c||regions[i]===regions[index]||Math.abs(Math.floor(i/n)-r)<=1&&Math.abs(i%n-c)<=1);}
