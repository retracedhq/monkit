import * as metrics from "metrics";

export default class Registry {

    private readonly metrics: any;

    constructor(metrics?: any) {
        this.metrics = metrics || {};
    }

    /**
     * Get a metric by name.
     */
    public getMetric(name: string) {
        return this.metrics[name];
    }
    /**
     * Add a metric if it does not exist. Returns true if added.
     */
    public addMetric(name: string, metric: any): boolean {
        if (this.getMetric(name)) {
            return false;
        }

        this.metrics[name] = metric;
        return true;
    }

    /**
     * Organize metrics by type, and attach names:
     * 
     * {
     *   meters: [...],
     *   counters: [...],
     *   histograms: [...],
     *   timers: [...]
     * }
     * 
     */
    public getMetrics(): any {
        let meters: any[] = [];
        let timers: any[] = [];
        let counters: any[] = [];
        let histograms: any[] = [];

        for (let name of Object.keys(this.metrics)) {
            let metric = this.metrics[name];
            metric.name = name;
            let metricType = Object.getPrototypeOf(metric);
            if (metricType === metrics.Meter.prototype) {
                meters.push(metric);
            } else if (metricType === metrics.Timer.prototype) {
                timers.push(metric);
            } else if (metricType === metrics.Counter.prototype) {
                counters.push(metric);
            } else if (metricType === metrics.Histogram.prototype) {
                histograms.push(metric);
            }
        }
        return { meters, timers, counters, histograms };
    }

    /** get or create a meter with the given name */
    public meter(name: string) {
        return this.getOrCreate(name, metrics.Meter);
    }

    /** get or create a histogram with the given name */
    public timer(name: string) {
        return this.getOrCreate(name, metrics.Timer);
    }

    /** get or create a histogram with the given name */
    public histogram(name: string) {
        return this.getOrCreate(name, metrics.Histogram);
    }

    /** get or create a counter with the given name */
    public counter(name: string) {
        return this.getOrCreate(name, metrics.Counter);
    }

    private getOrCreate(name: string, ctor: ObjectConstructor) {

        if (!this.getMetric(name)) {
            this.addMetric(name, new ctor());
        }

        return this.getMetric(name);
    }

}
