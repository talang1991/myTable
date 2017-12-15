export interface IExtraParams {
    common?:{
        taskNum?:number
        feedback?:'json' | 'html'
    }
    callback?: (err: any, param1?: any, param2?: any) => void
}