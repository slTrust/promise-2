import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
chai.use(sinonChai);
const assert = chai.assert;
import Promise from "../src/promise_node";

describe("Promise",()=>{
    it("是一个类",()=>{
        assert.isFunction(Promise);
        assert.isObject(Promise.prototype);
    })
    it("new Promise() 如果接受的不是一个函数就报错",()=>{
        assert.throw(()=>{
            // @ts-ignore
            new Promise();
        })
        assert.throw(()=>{
            // @ts-ignore
            new Promise(1);
        })
        assert.throw(()=>{
            // @ts-ignore
            new Promise(false);
        })
    })

    it("new Promise(fn) 会生成一个对象，对象有 then 方法",()=>{
        const promise = new Promise(()=>{})
        assert.isFunction(promise.then);
    })

    it("new Promise(fn) 中的 fn立即执行",()=>{
        let fn = sinon.fake();
        new Promise(fn);
        assert(fn.called);
    })
    it("new Promise(fn) 中的 fn 执行的时候接受 resolve 和 reject 两个函数",(done)=>{
        new Promise((resolve,reject)=>{
            assert.isFunction(resolve);
            assert.isFunction(reject);
            done();
        })
    })

    it("promise.then(success) 重的 success 会在 resolve 被调用的时候执行",(done)=>{
        const success = sinon.fake();
        const promise = new Promise((resolve,reject)=>{
            // 该函数没有执行
            assert.isFalse(success.called);
            resolve();
            setTimeout(() => {
                // 该函数执行了
                assert.isTrue(success.called);
                done();
            });
        })
        // @ts-ignore
        promise.then(success);
    })

    it("promise.then(null,fail) 重的 fail 会在 reject 被调用的时候执行",(done)=>{
        const fail = sinon.fake();
        const promise = new Promise((resolve,reject)=>{
            // 该函数没有执行
            assert.isFalse(fail.called);
            reject();
            setTimeout(() => {
                // 该函数执行了
                assert.isTrue(fail.called);
                done();
            });
        })
        // @ts-ignore
        promise.then(null,fail);
    })

    it("2.2.1",()=>{
        const promise = new Promise((resolve,reject)=>{
            resolve();
        })
        promise.then(false,null);
        assert(1 === 1);
    })

    it("2.2.2",(done)=>{
        const success = sinon.fake();
        const promise = new Promise((resolve,reject)=>{
            assert.isFalse(success.called); 
            resolve(233);
            resolve(2333);
            setTimeout(() => {
                assert(promise.state === "fulfilled")
                assert.isTrue(success.called); 
                assert.isTrue(success.calledOnce); 
                assert(success.calledWith(233));
                done();
            },0);
        })
        promise.then(success);
    })

    it("2.2.3",(done)=>{
        const fail = sinon.fake();
        const promise = new Promise((resolve,reject)=>{
            assert.isFalse(fail.called); 
            reject(233);
            reject(2333);
            setTimeout(() => {
                assert(promise.state === "rejected")
                assert.isTrue(fail.called); 
                assert.isTrue(fail.calledOnce); 
                assert(fail.calledWith(233));
                done();
            },0);
        })
        promise.then(null,fail);
    })

    it("2.2.4 在我的代码执行完之前，不得调用 then 后面的两个函数 success",(done)=>{
        const success = sinon.fake();
        const promise = new Promise((resolve)=>{
            resolve();
        })
        promise.then(success);
        assert.isFalse(success.called);
        setTimeout(() => {
            assert.isTrue(success.called);
            done();
        }, 0);
    })

    it("2.2.4 在我的代码执行完之前，不得调用 then 后面的两个函数 fail",(done)=>{
        const fail = sinon.fake();
        const promise = new Promise((resolve,reject)=>{
            reject();
        })
        promise.then(null,fail);
        assert.isFalse(fail.called);
        setTimeout(() => {
            assert.isTrue(fail.called);
            done();
        }, 0);
    })

    it("2.2.5 不带入额外的this",(done)=>{
        const fn = sinon.fake();
        const promise = new Promise((resolve)=>{
            resolve();
        })
        promise.then(function(){
            "use strict";
            assert(this === undefined);
            done();
        });
    })

    it("2.2.6 then可以在同一个promise里被多次调用(链式调用)",(done)=>{
        const promise = new Promise((resolve)=>{
            resolve();
        })
        const callbacks = [sinon.fake(),sinon.fake(),sinon.fake()]
        promise.then(callbacks[0]);
        promise.then(callbacks[1]);
        promise.then(callbacks[2]);
        setTimeout(() => {
            assert(callbacks[0].called);
            assert(callbacks[1].called);
            assert(callbacks[2].called);
            assert(callbacks[1].calledAfter(callbacks[0]));
            assert(callbacks[2].calledAfter(callbacks[1]));

            done();
        });
    })

    it("2.2.6.2 then可以在同一个promise里被多次调用(链式调用) reject",(done)=>{
        const promise = new Promise((resolve,reject)=>{
            reject();
        })
        const callbacks = [sinon.fake(),sinon.fake(),sinon.fake()]
        promise.then(null,callbacks[0]);
        promise.then(null,callbacks[1]);
        promise.then(null,callbacks[2]);
        setTimeout(() => {
            assert(callbacks[0].called);
            assert(callbacks[1].called);
            assert(callbacks[2].called);
            assert(callbacks[1].calledAfter(callbacks[0]));
            assert(callbacks[2].calledAfter(callbacks[1]));

            done();
        });
    })

    it("2.2.7 then必须返回一个 promise ",()=>{
        const promise = new Promise((resolve)=>{
            resolve();
        })
        const promise2 = promise.then(()=>{},()=>{});
        assert(promise2 instanceof Promise);
    });

    it("2.2.7.1 如果onFulfilled或onRejected返回一个值x, 运行Promise Resolution Procedure [[Resolve]](promise2, x)",(done)=>{
        const promise1 = new Promise((resolve)=>{
            resolve();
        })
        promise1.then(()=>"成功",()=>{}).then(result=>{
            assert.equal(result,"成功");
            done();
        })
    })

    it("2.2.7.1.2 success 的返回值是一个 Promise实例",(done)=>{
        const promise1 = new Promise((resolve)=>{
            resolve();
        })
        const fn = sinon.fake();
        const promise2 = promise1.then(()=> new Promise(resolve=>resolve()),()=>{})
        promise2.then(fn);

        /* 
        注意 setTimeout 里的 延时时间 
            如果是0 测试不通过
            如果是10 就通过
            因为这里涉及 js 的 宏任务 微任务
            宏任务一般是：包括整体代码script，setTimeout，setInterval。
            微任务：Promise，process.nextTick(node实现的)  / setImmediate(这个是IE实现的)
        */
        setTimeout(() => {
            assert(fn.called);
            done();
        },0);
    })

    it("2.2.7.1.2 success 的返回值是一个 Promise实例 且失败了",(done)=>{
        const promise1 = new Promise((resolve)=>{
            resolve();
        })
        const fn = sinon.fake();
        const promise2 = promise1.then(()=> new Promise((resolve,reject)=>reject()),()=>{})
        promise2.then(null,fn);

        setTimeout(() => {
            assert(fn.called);
            done();
        },0);
    })

    it("2.2.7.1.2 fail 的返回值是一个 Promise实例",(done)=>{
        const promise1 = new Promise((resolve,reject)=>{
            reject();
        });
        const fn = sinon.fake();
        const promise2 = promise1
                            .then(
                                null,
                                ()=> new Promise(resolve=>resolve())
                            )
        promise2.then(fn,null);

        setTimeout(() => {
            assert(fn.called);
            done();
        },0);
    })

    it("2.2.7.1.2 fail 的返回值是一个 Promise实例 且失败了",(done)=>{
        const promise1 = new Promise((resolve,reject)=>{
            reject();
        });
        const fn = sinon.fake();
        const promise2 = promise1
                            .then(
                                null,
                                ()=> new Promise((resolve,reject)=>reject())
                            )
        promise2.then(null, fn);

        setTimeout(() => {
            assert(fn.called);
            done();
        },0);
    })

    it("2.2.7.1.2 如果 success 抛出一个异常e , promise2 必须被拒绝",(done)=>{
        const promise1 = new Promise((resolve,reject)=>{
            resolve();
        });
        const fn = sinon.fake();
        const error = new Error();
        const promise2 = promise1
                            .then(
                                ()=> new Promise(()=>{
                                    throw error;
                                })
                            )
        promise2.then(null, fn);

        setTimeout(() => {
            assert(fn.called);
            assert(fn.calledWith(error));
            done();
        },0);
    })

    it("2.2.7.1.2 如果 fail 抛出一个异常e , promise2 必须被拒绝",(done)=>{
        const promise1 = new Promise((resolve,reject)=>{
            reject();
        });
        const fn = sinon.fake();
        const error = new Error();
        const promise2 = promise1
                            .then(
                                null,
                                ()=> new Promise(()=>{
                                    throw error;
                                })
                            )
        promise2.then(null, fn);

        setTimeout(() => {
            assert(fn.called);
            assert(fn.calledWith(error));
            done();
        },0);
    })
    
})