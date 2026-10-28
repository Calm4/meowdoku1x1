import {makePuzzle} from './generate-candidate.mjs';
import {ratePuzzle} from '../rating.js';
import {writeFileSync} from 'node:fs';
const bank={easy:[],medium:[],hard:[]};
for(const level of Object.keys(bank)){const seen=new Set();let tries=0;while(bank[level].length<60&&tries++<10000){let p;try{p=makePuzzle(level);}catch{continue;}let given=[];if(level==='easy'){for(const index of p.answer){if(ratePuzzle(p.regions,p.n,[index]).tier==='easy'){given=[index];break;}}if(!given.length)continue;}const rating=ratePuzzle(p.regions,p.n,given);if(rating.tier!==level||level==='hard'&&rating.remaining<4)continue;const fingerprint=p.regions.join(',')+'|'+given.join(',');if(seen.has(fingerprint))continue;seen.add(fingerprint);const {trace,...metrics}=rating;bank[level].push({...p,given,rating:metrics,id:level+'-'+bank[level].length});}if(bank[level].length!==60)throw Error('Insufficient '+level);console.log(level,bank[level].length,'boards; candidates',tries);}
writeFileSync(new URL('../puzzle-bank.js',import.meta.url),'// Original boards classified by visible-board deduction, not by size alone.\nexport const bank='+JSON.stringify(bank)+';\n');
