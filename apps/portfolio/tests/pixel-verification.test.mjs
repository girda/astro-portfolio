import test from 'node:test';
import assert from 'node:assert/strict';
import {createVerificationGate,requestVerification} from '../src/scripts/pixel-verification.ts';

test('first send waits for verification callback; a token can only be consumed once',async()=>{
 const gate=createVerificationGate(100);
 let sent=false;
 const first=gate.consume().then(token=>{sent=true;return token;});
 await Promise.resolve(); assert.equal(sent,false);
 gate.accept('first-token'); assert.equal(await first,'first-token');
 let replayed=false;
 const second=gate.consume().then(token=>{replayed=true;return token;});
 await Promise.resolve(); assert.equal(replayed,false);
 gate.accept('fresh-token'); assert.equal(await second,'fresh-token');
});
test('verification failure blocks pending and subsequent sends, reset allows a fresh challenge',async()=>{
 const gate=createVerificationGate(100);
 const pending=assert.rejects(gate.consume(),{message:'verification_failed'});
 gate.fail(); await pending;
 await assert.rejects(gate.consume(),{message:'verification_failed'});
 gate.reset(); gate.accept('new-token'); assert.equal(await gate.consume(),'new-token');
});
test('an unavailable challenge times out without granting access and can be retried',async()=>{
 const gate=createVerificationGate(5);
 await assert.rejects(gate.consume(),{message:'verification_failed'});
 gate.accept('later-token'); assert.equal(await gate.consume(),'later-token');
});
test('reset clears an unused token and cancels a pending send',async()=>{
 const gate=createVerificationGate(5);
 gate.accept('expired-token'); gate.reset();
 await assert.rejects(gate.consume(),{message:'verification_failed'});
 const pending=assert.rejects(gate.consume(),{message:'verification_failed'});
 gate.reset(); await pending;
});

test('a fresh send recovers from a previous failure and consumes its callback once',async()=>{
 const gate=createVerificationGate(100);gate.fail();
 let executions=0;
 assert.equal(await requestVerification(gate,()=>{executions++;gate.accept('fresh');}),'fresh');
 assert.equal(executions,1);
 const pending=gate.consume();gate.fail();await assert.rejects(pending,{message:'verification_failed'});
});
test('an SDK reset or execute exception rejects instead of leaving the send waiting',async()=>{
 const gate=createVerificationGate(100);
 await assert.rejects(requestVerification(gate,()=>{throw new Error('sdk error');}),{message:'verification_failed'});
 assert.equal(await requestVerification(gate,()=>gate.accept('retry-token')),'retry-token');
});
