export class NullableActions{
    public static getValue<T,T2>(obj:T,defaultValue:T2):T|T2{
        return this.isNull(obj) ? defaultValue : obj;
    }

    public static isNull(obj:any):boolean{
        return (obj==undefined || obj==null);
    }

    public static actionIfNotNull(obj:any,action:()=>void):void{
        if(!this.isNull(obj))
            action();
    }
    public static actionIfNull(obj:any,action:()=>void):void{
        if(this.isNull(obj))
            action();
    }
}