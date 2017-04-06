"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metrics = require("metrics");
var Registry = (function () {
    function Registry(metrics) {
        this.metrics = metrics || {};
    }
    Registry.prototype.getMetric = function (name) {
        return this.metrics[name];
    };
    Registry.prototype.addMetric = function (name, metric) {
        if (this.getMetric(name)) {
            return false;
        }
        this.metrics[name] = metric;
        return true;
    };
    Registry.prototype.getMetrics = function () {
        var meters = [];
        var timers = [];
        var counters = [];
        var histograms = [];
        for (var _i = 0, _a = Object.keys(this.metrics); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            var metric = this.metrics[name_1];
            metric.name = name_1;
            var metricType = Object.getPrototypeOf(metric);
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
    };
    Registry.prototype.meter = function (name) {
        return this.getOrCreate(name, metrics.Meter);
    };
    Registry.prototype.timer = function (name) {
        return this.getOrCreate(name, metrics.Timer);
    };
    Registry.prototype.histogram = function (name) {
        return this.getOrCreate(name, metrics.Histogram);
    };
    Registry.prototype.counter = function (name) {
        return this.getOrCreate(name, metrics.Counter);
    };
    Registry.prototype.getOrCreate = function (name, ctor) {
        if (!this.getMetric(name)) {
            this.addMetric(name, new ctor());
        }
        return this.getMetric(name);
    };
    return Registry;
}());
exports.default = Registry;
