export interface IComparer<T>{
    action(item1:T):string|number|Date
    isAscending:boolean;
}

export interface IOrderedEnumerable<TPrimary>{
    comparer:IComparer<TPrimary>[];
    orderBy(predicateAction:(arg0:TPrimary)=>string|number):IOrderedEnumerable<TPrimary>;
    orderByDescending(predicateAction:(arg0:TPrimary)=>string|number):IOrderedEnumerable<TPrimary>;
    thenBy(predicateAction:(arg0:TPrimary)=>string|number):IOrderedEnumerable<TPrimary>;
    thenByDescending(predicateAction:(arg0:TPrimary)=>string|number):IOrderedEnumerable<TPrimary>;
    toArray();
}