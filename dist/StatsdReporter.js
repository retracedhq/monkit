"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metrics_1 = require("./metrics");
var statsd = require("node-statsd-client");
var StatsdReporter = (function () {
    function StatsdReporter(registry, prefix, host, port) {
        this.registry = registry;
        this.prefix = prefix;
        this.client = new statsd.Client(host, port || 8125);
    }
    StatsdReporter.prototype.report = function () {
        var _this = this;
        var metrics = this.registry.getMetrics();
        if (metrics.counters.length !== 0) {
            metrics.counters.forEach(function (count) {
                _this.reportCounter(count);
            });
        }
        if (metrics.meters.length !== 0) {
            metrics.meters.forEach(function (meter) {
                _this.reportMeter(meter);
            });
        }
        if (metrics.timers.length !== 0) {
            metrics.timers.forEach(function (timer) {
                if (timer.min() != null) {
                    _this.reportTimer(timer);
                }
            });
        }
        if (metrics.histograms.length !== 0) {
            metrics.histograms.forEach(function (histogram) {
                if (histogram.min != null) {
                    _this.reportHistogram(histogram);
                }
            });
        }
    };
    StatsdReporter.prototype.reportCounter = function (counter) {
        this.client.gauge(counter.name, counter.count);
    };
    ;
    StatsdReporter.prototype.buildPrefix = function () {
        if (this.prefix) {
            return this.prefix + ".";
        }
        return "";
    };
    ;
    StatsdReporter.prototype.reportMeter = function (meter) {
        this.client.gauge("" + this.buildPrefix() + meter.name + ".count", meter.count);
        this.client.gauge("" + this.buildPrefix() + meter.name + ".mean_rate", metrics_1.toOpsPerMin(meter.meanRate()));
        this.client.gauge("" + this.buildPrefix() + meter.name + ".m1_rate", metrics_1.toOpsPerMin(meter.oneMinuteRate()));
        this.client.gauge("" + this.buildPrefix() + meter.name + ".m5_rate", metrics_1.toOpsPerMin(meter.fiveMinuteRate()));
        this.client.gauge("" + this.buildPrefix() + meter.name + ".m15_rate", metrics_1.toOpsPerMin(meter.fifteenMinuteRate()));
    };
    ;
    StatsdReporter.prototype.reportTimer = function (timer) {
        this.client.gauge("" + this.buildPrefix() + timer.name + ".count", timer.count());
        this.client.gauge("" + this.buildPrefix() + timer.name + ".mean_rate", timer.meanRate());
        this.client.gauge("" + this.buildPrefix() + timer.name + ".m1_rate", timer.oneMinuteRate());
        this.client.gauge("" + this.buildPrefix() + timer.name + ".m5_rate", timer.fiveMinuteRate());
        this.client.gauge("" + this.buildPrefix() + timer.name + ".m15_rate", timer.fifteenMinuteRate());
        var percentiles = timer.percentiles([.50, .75, .95, .98, .99, .999]);
        this.client.gauge("" + this.buildPrefix() + timer.name + ".mean", metrics_1.toMs(timer.min()));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".mean", metrics_1.toMs(timer.mean()));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".max", metrics_1.toMs(timer.max()));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".stddev", metrics_1.toMs(timer.stdDev()));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".p50", metrics_1.toMs(percentiles[.50]));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".p75", metrics_1.toMs(percentiles[.75]));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".p95", metrics_1.toMs(percentiles[.95]));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".p98", metrics_1.toMs(percentiles[.98]));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".p99", metrics_1.toMs(percentiles[.99]));
        this.client.gauge("" + this.buildPrefix() + timer.name + ".p999", metrics_1.toMs(percentiles[.999]));
    };
    ;
    StatsdReporter.prototype.reportHistogram = function (histogram) {
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".count", histogram.count);
        var percentiles = histogram.percentiles([.50, .75, .95, .98, .99, .999]);
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".mean", histogram.min);
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".mean", histogram.mean());
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".max", histogram.max);
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".stddev", histogram.stdDev());
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".p50", percentiles[.50]);
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".p75", percentiles[.75]);
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".p95", percentiles[.95]);
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".p98", percentiles[.98]);
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".p99", percentiles[.99]);
        this.client.gauge("" + this.buildPrefix() + histogram.name + ".p999", percentiles[.999]);
    };
    ;
    return StatsdReporter;
}());
exports.default = StatsdReporter;
