class Promise2{
    succeed = null;
    fail = null;
    resolve(){
        setTimeout(() => {
            this.succeed();
        });
    }
    reject(){
        setTimeout(() => {
            this.fail();
        });
    }
    constructor(fn){
        if(typeof fn !== 'function'){
            throw new Error("我只接受函数")
        }
       
        fn(this.resolve.bind(this), this.reject.bind(this));
    }
    then(succeed,fail){
        this.succeed = succeed;
        this.fail = fail;
    }
}

export default Promise2