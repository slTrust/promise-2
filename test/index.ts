import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
chai.use(sinonChai);
const assert = chai.assert;
import Promise from "../src/promise";

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
})

/*
describe("Chai 的使用",()=>{
    it("可以测试相等",()=>{
        assert(1 === 1);
        
        // 因为我们用的是 ts, 你在任何一行在上 // @ts-ignore 那么ts就不会管这行符合不符合逻辑
        // 之前如果不加会报错， 因为 2 永远不等于 3 ，你这样写是没意义的
        // 由于你是在测试，所以经常会写这种代码

        // @ts-ignore
        assert( 2 === 3)
    })
})
*/

