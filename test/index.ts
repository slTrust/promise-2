import * as chai from "chai";

const assert = chai.assert;

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