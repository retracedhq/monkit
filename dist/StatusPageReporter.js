"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var util = require("util");
var metrics_1 = require("./metrics");
var StatusPageReporter = (function () {
    function StatusPageReporter(registry, url, pageId, statusPageToken, metricIds) {
        this.registry = registry;
        this.url = url;
        this.statusPageToken = statusPageToken;
        this.pageId = pageId;
        this.metricIds = metricIds;
    }
    StatusPageReporter.prototype.report = function () {
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
    StatusPageReporter.prototype.reportMetric = function (name, value) {
        var metricId = this.metricIds[name];
        if (!metricId) {
            return;
        }
        var now = Math.floor(new Date().getTime() / 1000);
        var method = "POST";
        var host = this.url;
        var path = "/v1/pages/" + this.pageId + "/metrics/" + metricId + "/data.json";
        var formData = { "data[timestamp]": now, "data[value]": value };
        var headers = {
            Authorization: "OAuth " + this.statusPageToken,
        };
        request.post({ url: "https://" + host + path, formData: formData, headers: headers }, function (err, resp, body) {
            if (err) {
                console.error("couldn't post to statuspage.io:", util.inspect(err));
            }
        });
    };
    ;
    StatusPageReporter.prototype.reportCounter = function (counter) {
        this.reportMetric(counter.name, counter.count);
    };
    ;
    StatusPageReporter.prototype.reportMeter = function (meter) {
        this.reportMetric(meter.name + ".count", meter.count);
        this.reportMetric(meter.name + ".mean_rate", metrics_1.toOpsPerMin(meter.meanRate()));
        this.reportMetric(meter.name + ".m1_rate", metrics_1.toOpsPerMin(meter.oneMinuteRate()));
        this.reportMetric(meter.name + ".m5_rate", metrics_1.toOpsPerMin(meter.fiveMinuteRate()));
        this.reportMetric(meter.name + ".m15_rate", metrics_1.toOpsPerMin(meter.fifteenMinuteRate()));
    };
    ;
    StatusPageReporter.prototype.reportTimer = function (timer) {
        this.reportMetric(timer.name + ".count", timer.count());
        this.reportMetric(timer.name + ".mean_rate", timer.meanRate());
        this.reportMetric(timer.name + ".m1_rate", timer.oneMinuteRate());
        this.reportMetric(timer.name + ".m5_rate", timer.fiveMinuteRate());
        this.reportMetric(timer.name + ".m15_rate", timer.fifteenMinuteRate());
        var percentiles = timer.percentiles([.50, .75, .95, .98, .99, .999]);
        this.reportMetric(timer.name + ".mean", metrics_1.toMs(timer.min()));
        this.reportMetric(timer.name + ".mean", metrics_1.toMs(timer.mean()));
        this.reportMetric(timer.name + ".max", metrics_1.toMs(timer.max()));
        this.reportMetric(timer.name + ".stddev", metrics_1.toMs(timer.stdDev()));
        this.reportMetric(timer.name + ".p50", metrics_1.toMs(percentiles[.50]));
        this.reportMetric(timer.name + ".p75", metrics_1.toMs(percentiles[.75]));
        this.reportMetric(timer.name + ".p95", metrics_1.toMs(percentiles[.95]));
        this.reportMetric(timer.name + ".p98", metrics_1.toMs(percentiles[.98]));
        this.reportMetric(timer.name + ".p99", metrics_1.toMs(percentiles[.99]));
        this.reportMetric(timer.name + ".p999", metrics_1.toMs(percentiles[.999]));
    };
    ;
    StatusPageReporter.prototype.reportHistogram = function (histogram) {
        this.reportMetric(histogram.name + ".count", histogram.count);
        var percentiles = histogram.percentiles([.50, .75, .95, .98, .99, .999]);
        this.reportMetric(histogram.name + ".mean", histogram.min);
        this.reportMetric(histogram.name + ".mean", histogram.mean());
        this.reportMetric(histogram.name + ".max", histogram.max);
        this.reportMetric(histogram.name + ".stddev", histogram.stdDev());
        this.reportMetric(histogram.name + ".p50", percentiles[.50]);
        this.reportMetric(histogram.name + ".p75", percentiles[.75]);
        this.reportMetric(histogram.name + ".p95", percentiles[.95]);
        this.reportMetric(histogram.name + ".p98", percentiles[.98]);
        this.reportMetric(histogram.name + ".p99", percentiles[.99]);
        this.reportMetric(histogram.name + ".p999", percentiles[.999]);
    };
    ;
    return StatusPageReporter;
}());
exports.default = StatusPageReporter;
