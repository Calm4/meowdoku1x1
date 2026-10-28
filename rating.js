import {blockedBy} from './puzzles.js?v=3';
// Rate deductions from the visible board, without consulting its answer key.
export function ratePuzzle(regions,n,given=[]){
 const cats=[...given],excluded=new Set();let singles=0,locks=0,eliminations=0;const trace=[];
 const groups=()=>[...Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>r*n+c)),...Array.from({length:n},(_,c)=>Array.from({length:n},(_,r)=>r*n+c)),...Array.from({length:n},(_,z)=>regions.map((v,i)=>v===z?i:-1).filter(i=>i>=0))];
 const all=groups();
 while(cats.length<n){const available=all.map(group=>group.some(i=>cats.includes(i))?null:group.filter(i=>!excluded.has(i)&&!blockedBy(i,cats,regions,n)));if(available.some(a=>a&&a.length===0))return {tier:'invalid',singles,locks,eliminations,remaining:n-cats.length,trace};const forced=available.find(a=>a?.length===1);if(forced){cats.push(forced[0]);singles++;trace.push({type:'single',index:forced[0]});continue;}
 let changed=false;
 for(let a=0;a<all.length&&!changed;a++){const cells=available[a];if(!cells)continue;for(let b=0;b<all.length&&!changed;b++){if(a===b||!available[b])continue;if(cells.every(i=>all[b].includes(i))){const removed=available[b].filter(i=>!cells.includes(i));if(removed.length){removed.forEach(i=>excluded.add(i));locks++;eliminations+=removed.length;trace.push({type:'intersection',from:a,to:b,removed});changed=true;}}}}
 if(!changed)break;
 }
 return {tier:cats.length===n?(locks?'medium':'easy'):'hard',singles,locks,eliminations,remaining:n-cats.length,trace};
}
