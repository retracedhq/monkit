export default class Registry {
    private readonly metrics;
    constructor(metrics?: any);
    getMetric(name: string): any;
    addMetric(name: string, metric: any): boolean;
    getMetrics(): any;
    meter(name: string): any;
    timer(name: string): any;
    histogram(name: string): any;
    counter(name: string): any;
    private getOrCreate(name, ctor);
}
