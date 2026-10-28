import test from 'node:test';
import assert from 'node:assert/strict';
import {TapTracker} from './input.js';
for(const type of ['touch','mouse','pen'])test(type+': fast taps on different cells never place cats',()=>{const t=new TapTracker();assert.deepEqual([t.tap(1,type,0),t.tap(2,type,70),t.tap(3,type,140),t.tap(1,type,210)],['mark','mark','mark','mark']);assert.equal(t.tap(1,type,280),'cat');assert.equal(t.tap(2,type,350),'mark');});
test('slow taps, different pointer types, drag/cancel reset do not combine',()=>{const t=new TapTracker();assert.equal(t.tap(1,'touch',0),'mark');assert.equal(t.tap(1,'touch',800),'mark');assert.equal(t.tap(1,'mouse',900),'mark');t.reset();assert.equal(t.tap(1,'mouse',950),'mark');});
