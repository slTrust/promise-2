class Promise2{
    state = "pending";
    callbacks = [];

    resolve(result){
        if(this.state !== "pending") return;
        this.state = "fulfilled";
        setTimeout(() => {
            // 遍历 callbacks 调用所有的 handle[0]
            this.callbacks.forEach(handle=>{
                if(typeof handle[0] === "function"){
                    // x 是之前成功的返回值
                    const x = handle[0].call(undefined,result);
                    handle[2].resolveWith(x);
                }
            })  
        });
    }
    reject(reason){
        if(this.state !== "pending") return;
        this.state = "rejected";
        setTimeout(() => {
            this.callbacks.forEach(handle=>{
                if(typeof handle[1] === "function"){
                    // x 是之前失败的返回值
                    const x = handle[1].call(undefined,reason);
                    handle[2].resolveWith(x);
                }
            })
        });
    }
    constructor(fn){
        if(typeof fn !== 'function'){
            throw new Error("我只接受函数")
        }
       
        fn(this.resolve.bind(this), this.reject.bind(this));
    }
    then(succeed?,fail?){
        // handle除了记录成功和失败 还要记录成功和失败的后续
        const handle = [];
        if(typeof succeed === 'function'){
            handle[0] = succeed;
        }
        if(typeof fail === 'function'){
            handle[1] = fail;
        }

        // 记录then之后的后续
        handle[2] = new Promise2(()=>{});
        
        this.callbacks.push(handle); 
        // 把函数推进 callBacks 里面

        return handle[2];
    }

    resolveWith(x){
        if( this === x){
            this.reject(new TypeError())
        } else if ( x instanceof Promise2){
            x.then(
                (result)=>{
                    this.resolve(result)
                },
                (reason)=>{
                    this.reject(reason)
                }
            )
        } else if ( x instanceof Object){
            let then;
            try{
                then = x.then;
            }catch(e){
                this.reject(e);
            }
            if(then instanceof Function){
                try {
                    x.then(
                        y => {
                        this.resolveWith(y)
                        },
                        r =>{
                            this.reject(r);
                        }
                    );
                } catch (error) {
                    this.reject(error)
                }
            } else {
                this.resolve(x);
            }
        } else {
            this.resolve(x);
        }
    }
}

export default Promise2