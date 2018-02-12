import * as metrics from "metrics";

import {default as Gauge} from "./Gauge";
import { Registry } from "./types";

export default class ReadableRegistry implements Registry {

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
        const meters: any[] = [];
        const timers: any[] = [];
        const counters: any[] = [];
        const histograms: any[] = [];
        const gauges: any[] = [];

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
            } else if (metricType === Gauge.prototype) {
                gauges.push(metric);
            }
        }
        return { meters, timers, counters, histograms, gauges };
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

    /** get or create a gauge with the given name */
    public gauge(name: string) {
        return this.getOrCreate(name, Gauge);
    }

    private getOrCreate(name: string, ctor: ObjectConstructor|typeof Gauge) {

        if (!this.getMetric(name)) {
            this.addMetric(name, new ctor());
        }

        return this.getMetric(name);
    }

}
