// Interpret completed gestures, never the browser's global click counter.
export class TapTracker {
  constructor(interval=550){this.interval=interval;this.reset();}
  reset(){this.last=null;}
  tap(index,pointerType,time){const previous=this.last;
    if(previous&&previous.index===index&&previous.pointerType===pointerType&&time>=previous.time&&time-previous.time<=this.interval){this.reset();return 'cat';}
    this.last={index,pointerType,time};return 'mark';
  }
}
