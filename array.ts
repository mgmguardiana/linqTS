export class ArrayHelper<T>{
    static remove<T>(array:T[],predicateAction:(arg0: T)=>boolean){
        var index=array.findIndex(x=>predicateAction(x));
        if(index!=-1)
            array.splice(index,1);
    }

    static orderBy<T>(data:T[],predicateAction:(arg0: T)=>string|number|Date):T[]
    {
        var res=data.sort((item1,item2)=>{
            return predicateAction(item1).toString().localeCompare(predicateAction(item2).toString());
        });
        return res;
    }

    static orderByDescending<T>(data:T[],predicateAction:(arg0: T)=>string|number|Date):T[]
    {
        var res=data.sort((item1,item2)=>predicateAction(item2).toString().localeCompare(predicateAction(item1).toString()));
        return res;
    }
    static sum<T>(data:T[],predicateAction:(arg0: T)=>string|number):number
    {
        var res=0;
        data.forEach(item=>{
            if(predicateAction(item))
                res+=parseFloat(predicateAction(item).toString());
        });
        return res;
    }
    static where<T>(data:T[],predicateAction:(arg0: T)=>boolean):T[]
    {
        var res=data.filter(value=>{
            return predicateAction(value);
        });
        return res;
    }
    
    static any<T>(data:T[],predicateAction:(arg0:T)=>boolean):boolean
    {
        return -1 != data.findIndex(value=>predicateAction(value));
    }

    static indexOf<T>(data:T[],predicateAction:(arg0:T)=>boolean):number
    {
        for(var i=0;i<data.length;i++)
        {
            if(predicateAction(data[i]))
                return i;
        }
        return -1;
    }

    static all<T>(data:T[],predicateAction:(arg0:T)=>boolean):boolean
    {
        for(var i=0;i<data.length;i++)
        {
            if(!predicateAction(data[i]))
                return false;
        }
        return true;
    }

    static firstOrDefault<T>(data:T[],predicateAction:(arg0:T)=>boolean):T
    {
        var res = ArrayHelper.where(data,predicateAction);
        if(res==undefined) return undefined;
        if(res.length==0) return undefined;
        return res[0];
    }
}