import { IComparer } from './iComparer';
import { NullableActions } from './nulldefault';

export class Linq<TPrimary>{

    private constructor(
        private data:TPrimary[],
        private comparers:IComparer<TPrimary>[]=[]
    ){}

    get length(): number {
        return this.data.length;
    }
    public static create<TPrimary>(data:TPrimary[])
    {
        return new Linq(data==undefined?[]:data);
    }
    public add(item:TPrimary) {
        this.data.push(item);
    }

    public addRange(items:TPrimary[])
    {
        items.forEach(item=>this.data.push(item));
    }
    private clearComparers()
    {
        this.comparers=[];
    }

    private addToComparer(predicateAction:(arg0:TPrimary)=>string|number,isAscending:boolean)
    {
        this.comparers.push(new Comparer(predicateAction,isAscending));
    }
    
    public toArray():TPrimary[]
    {
        if(this.comparers.length!=0) 
            return this.sort();
        this.clearComparers();
        return this.data;
    }

    public orderBy(predicateAction:(arg0:TPrimary)=>string|number)
    {  
        this.addToComparer(predicateAction,true);
        return this;
    } 

    public orderByDescending(predicateAction:(arg0:TPrimary)=>string|number)
    {  
        this.addToComparer(predicateAction,false);
        return this;
    }

    public distinct<TResult>(predicateAction:(arg0:TPrimary)=>TResult):Linq<TResult>{
        var distinctKeys:TResult[]=[];
        this.data.forEach(item=>{
            try{
                var value=predicateAction(item);
                if(this.hasAny<TResult>(distinctKeys,x=>x==value))
                    distinctKeys.push(value);
            }
            catch(err){}
        });
        return Linq.create(distinctKeys);
    }

    private hasAny<T>(data:T[],predicateAction:(arg0:T)=>boolean):boolean
    {
        //return -1 != data.findIndex(value=>predicateAction(value));
        var result=false;
        for(var i=0;i<data.length;i++)
        {
            if(predicateAction(data[i]))
                return true;
        }
        return false;
    }

    public thenBy(predicateAction:(arg0:TPrimary)=>string|number)
    {
        this.addToComparer(predicateAction,true);
        return this;
    }
    
    public thenByDescending(predicateAction:(arg0:TPrimary)=>string|number)
    {
        this.addToComparer(predicateAction,false);
        return this;
    }

    private sort():TPrimary[]{
        var res=this.doSortStacking(this.data,0,undefined);
        this.clearComparers();
        return res;
    }

    private getDistinctKey(data:TPrimary[],comparer:IComparer<TPrimary>):(string|number|Date)[]
    {
        var distinctKey:(string|number|Date)[]=[];
        data.forEach(item=>{
            try{
                var value=comparer.action(item);
                if(!this.hasAny(distinctKey,x=>x==value))
                    distinctKey.push(value);
            }
            catch(err){}
        });
        return distinctKey;
    }

    private doSortStacking(dataToSort:TPrimary[],stackLevel:number=0,prevComparer:IComparer<TPrimary>):TPrimary[]
    {
        if(stackLevel>this.comparers.length)
            return dataToSort;
        var comparer=this.comparers[stackLevel];
        var container:TPrimary[]=[];
        for(var i=0;i<dataToSort.length;i++)
        {
            if(stackLevel==0)
            {
               var orderedResult=comparer.isAscending ? 
                                Linq.doOrderBy(this.data,comparer):
                                Linq.doOrderByDescending(this.data,comparer);
               var result =this.doSortStacking(orderedResult,stackLevel+1,comparer);
               return result;
            }
            else{
                var distinctKeys=this.getDistinctKey(dataToSort,prevComparer);
     
                for(var i=0;i<distinctKeys.length;i++)
                {
                    var selectiveChunks:TPrimary[]=[];
                    for(var j=0;j<dataToSort.length;j++)
                    {
                        try{
                            var item=dataToSort[j];
                            if(prevComparer.action(item)==distinctKeys[i])
                                selectiveChunks.push(item);
                        }
                        catch{}
                    }
                    var orderedResult=this.doSortStacking(selectiveChunks,stackLevel+1,comparer);
                    orderedResult.forEach(item=>container.push(item));
                }
                container=prevComparer.isAscending ? 
                    Linq.doOrderBy(container,prevComparer):
                    Linq.doOrderByDescending(container,prevComparer);
                return container;
            }
        }
    }

    static doOrderBy<T>(data:T[],comparer:IComparer<T>):T[]
    {
        var res=data.sort((item1,item2)=>{
            var i1=comparer.action(item1);
            var i2=comparer.action(item2);
            i2=NullableActions.getValue(i2,"");
            i1=NullableActions.getValue(i1,"");
            return i1.toString().localeCompare(i2.toString());
        });
        return res;
    }
    static doOrderByDescending<T>(data:T[],comparer:IComparer<T>):T[]
    {
        var res=data.sort((item1,item2)=>{
            var i1=comparer.action(item1);
            var i2=comparer.action(item2);
            i2=NullableActions.getValue(i2,"");
            i1=NullableActions.getValue(i1,"");
            return i2.toString().localeCompare(i1.toString());
        });
        return res;
    }
    public sum(predicateAction:(arg0: TPrimary)=>string|number):number
    {
        this.clearComparers();
        var res=0;
        this.data.forEach(item=>{
            var result=predicateAction(item);
            if(!NullableActions.isNull(result))
                res+=parseFloat(result.toString());
        });
        return res;
    }

    public where(predicateAction:(arg0:TPrimary)=>boolean):Linq<TPrimary>
    {
        this.clearComparers();
        var res=this.data.filter(value=>{
            try{
                return predicateAction(value);}
            catch(err){return false;}
        });
        return new Linq(res);
    }

        
    public any(predicateAction:(arg0:TPrimary)=>boolean):boolean
    {
        this.clearComparers();
        return this.hasAny(this.data,predicateAction);
    }

    public notIn<T2>(item2:Linq<T2>,predicateCondition:(arg0:TPrimary)=>string|number|Date, predicateConditionData:(arg0:T2)=>string|number|Date):Linq<TPrimary>
    {
        this.clearComparers();
        let container:TPrimary[]=[];
        let cacheItems1=Linq.generateCacheItems(this,predicateCondition);
        let cacheItems2=Linq.generateCacheItems(item2,predicateConditionData);
        cacheItems1.forEach(item=>{
            var res=this.hasAny(cacheItems2,x=>item.value==x.value);
            if(!res) container.push(item.item);
        });
        return Linq.create(container);
    }

    private static generateCacheItems<T>(items:Linq<T>,predicateCondition:(arg0:T)=>string|number|Date):{item:T,value:string|number|Date}[]{
        let cacheItems:{item:T,value:string|number|Date}[]=[];
        items.data.forEach(item=>{
            try{var val=predicateCondition(item)}
            catch{val=undefined;}
            cacheItems.push({item:item,value:val});
        });
        return cacheItems;
    }
    
    public remove(predicateAction:(arg0: TPrimary)=>boolean){
        this.clearComparers();
        var index=this.indexOf(predicateAction);
        if(index!=-1)
            this.data.splice(index,1);
    }
    
    public indexOf(predicateAction:(arg0:TPrimary)=>boolean):number
    {
        this.clearComparers();
        for(var i=0;i<this.data.length;i++)
            if(predicateAction(this.data[i]))
                return i;
        return -1;
    }

    public all(predicateAction:(arg0:TPrimary)=>boolean):boolean
    {
        this.clearComparers();
        for(var i=0;i<this.data.length;i++)
            if(!predicateAction(this.data[i]))
                return false;
        return true;
    }

    public firstOrDefault(predicateAction:(arg0:TPrimary)=>boolean):TPrimary
    {
        this.clearComparers();
        var res = this.where(predicateAction);
        if(NullableActions.isNull(res)) return undefined;
        if(res.length==0) return undefined;
        return res[0];
    }

    public innerJoin<TForeign,TResult>(joinWith:Linq<TForeign>,predicateAction:(arg1:TPrimary,arg2:TForeign)=>boolean,processResult:(arg0:TPrimary,arg1:TForeign)=>TResult):Linq<TResult>{
        this.clearComparers();
        var container:TResult[]=[];
        var t2=joinWith.toArray();
        this.data.forEach(item1=>{
            t2.forEach(item2=>{
                try{
                    if(NullableActions.isNull(item1)) return;
                    if(NullableActions.isNull(item2)) return;
                    if(predicateAction(item1,item2)) container.push(processResult(item1,item2));
                }
                catch(error){}
            });
        });
        return new Linq(container);
    }
}

class Comparer<T1> implements IComparer<T1>{
    private _action:(item1:T1)=>string|number|Date;

    constructor(action:(item1:T1)=>string|number|Date,public isAscending:boolean=true){
        this._action=action;
    }
    action(item1: T1): string|number|Date{
       try{
        return this._action(item1);
       }
       catch{return "";}
    }
}