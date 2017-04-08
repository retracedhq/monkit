"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metrics = require("metrics");
class Registry {
    constructor(metrics) {
        this.metrics = metrics || {};
    }
    getMetric(name) {
        return this.metrics[name];
    }
    addMetric(name, metric) {
        if (this.getMetric(name)) {
            return false;
        }
        this.metrics[name] = metric;
        return true;
    }
    getMetrics() {
        let meters = [];
        let timers = [];
        let counters = [];
        let histograms = [];
        for (let name of Object.keys(this.metrics)) {
            let metric = this.metrics[name];
            metric.name = name;
            let metricType = Object.getPrototypeOf(metric);
            if (metricType === metrics.Meter.prototype) {
                meters.push(metric);
            }
            else if (metricType === metrics.Timer.prototype) {
                timers.push(metric);
            }
            else if (metricType === metrics.Counter.prototype) {
                counters.push(metric);
            }
            else if (metricType === metrics.Histogram.prototype) {
                histograms.push(metric);
            }
        }
        return { meters, timers, counters, histograms };
    }
    meter(name) {
        return this.getOrCreate(name, metrics.Meter);
    }
    timer(name) {
        return this.getOrCreate(name, metrics.Timer);
    }
    histogram(name) {
        return this.getOrCreate(name, metrics.Histogram);
    }
    counter(name) {
        return this.getOrCreate(name, metrics.Counter);
    }
    getOrCreate(name, ctor) {
        if (!this.getMetric(name)) {
            this.addMetric(name, new ctor());
        }
        return this.getMetric(name);
    }
}
exports.default = Registry;
