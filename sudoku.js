export function solutions(board, limit=2) {
 let count=0;
 function solve(){let pos=-1,opts=[];for(let i=0;i<81;i++){if(board[i])continue;let possible=[];for(let n=1;n<=9;n++)if(valid(board,i,n))possible.push(n);if(!possible.length)return;if(pos<0||possible.length<opts.length){pos=i;opts=possible;if(opts.length===1)break;}}if(pos<0){count++;return;}for(const n of opts){board[pos]=n;solve();if(count>=limit)break;}board[pos]=0;}
 solve();return count;
}
function valid(b,i,n){let r=Math.floor(i/9),c=i%9;for(let k=0;k<9;k++)if(b[r*9+k]===n||b[k*9+c]===n||b[(Math.floor(r/3)*3+Math.floor(k/3))*9+Math.floor(c/3)*3+k%3]===n)return false;return true;}
const shuffle=a=>a.sort(()=>Math.random()-.5);
export function puzzle(difficulty='easy'){
 const order=()=>shuffle([0,1,2]).flatMap(g=>shuffle([0,1,2]).map(x=>g*3+x));const rows=order(),cols=order(),nums=shuffle([1,2,3,4,5,6,7,8,9]);
 const answer=rows.flatMap(r=>cols.map(c=>nums[(r*3+Math.floor(r/3)+c)%9]));const board=[...answer];let remove={easy:36,medium:46,hard:54}[difficulty];
 for(const i of shuffle(Array.from({length:81},(_,i)=>i))){if(!remove)break;const old=board[i];board[i]=0;if(solutions([...board])===1)remove--;else board[i]=old;}
 return {board,answer};
}
