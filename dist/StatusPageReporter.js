"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const util = require("util");
const metrics_1 = require("./metrics");
class StatusPageReporter {
    constructor(registry, url, pageId, statusPageToken, metricIds) {
        this.registry = registry;
        this.url = url;
        this.statusPageToken = statusPageToken;
        this.pageId = pageId;
        this.metricIds = metricIds;
    }
    report() {
        const metrics = this.registry.getMetrics();
        if (metrics.counters.length !== 0) {
            metrics.counters.forEach((count) => {
                this.reportCounter(count);
            });
        }
        if (metrics.meters.length !== 0) {
            metrics.meters.forEach((meter) => {
                this.reportMeter(meter);
            });
        }
        if (metrics.timers.length !== 0) {
            metrics.timers.forEach((timer) => {
                if (timer.min() != null) {
                    this.reportTimer(timer);
                }
            });
        }
        if (metrics.histograms.length !== 0) {
            metrics.histograms.forEach((histogram) => {
                if (histogram.min != null) {
                    this.reportHistogram(histogram);
                }
            });
        }
    }
    reportMetric(name, value) {
        const metricId = this.metricIds[name];
        if (!metricId) {
            return;
        }
        const now = Math.floor(new Date().getTime() / 1000);
        const host = this.url;
        const path = `/v1/pages/${this.pageId}/metrics/${metricId}/data.json`;
        const formData = { "data[timestamp]": now, "data[value]": value };
        const headers = {
            Authorization: `OAuth ${this.statusPageToken}`,
        };
        request.post({ url: `https://${host}${path}`, formData, headers }, (err) => {
            if (err) {
                console.error("couldn't post to statuspage.io:", util.inspect(err));
            }
        });
    }
    ;
    reportCounter(counter) {
        this.reportMetric(`${counter.name}.count`, counter.count);
    }
    ;
    reportMeter(meter) {
        this.reportMetric(`${meter.name}.count`, meter.count);
        this.reportMetric(`${meter.name}.mean_rate`, metrics_1.toOpsPerMin(meter.meanRate()));
        this.reportMetric(`${meter.name}.m1_rate`, metrics_1.toOpsPerMin(meter.oneMinuteRate()));
        this.reportMetric(`${meter.name}.m5_rate`, metrics_1.toOpsPerMin(meter.fiveMinuteRate()));
        this.reportMetric(`${meter.name}.m15_rate`, metrics_1.toOpsPerMin(meter.fifteenMinuteRate()));
    }
    ;
    reportTimer(timer) {
        this.reportMetric(`${timer.name}.count`, timer.count());
        this.reportMetric(`${timer.name}.mean_rate`, metrics_1.toOpsPerMin(timer.meanRate()));
        this.reportMetric(`${timer.name}.m1_rate`, metrics_1.toOpsPerMin(timer.oneMinuteRate()));
        this.reportMetric(`${timer.name}.m5_rate`, metrics_1.toOpsPerMin(timer.fiveMinuteRate()));
        this.reportMetric(`${timer.name}.m15_rate`, metrics_1.toOpsPerMin(timer.fifteenMinuteRate()));
        const percentiles = timer.percentiles([.50, .75, .95, .98, .99, .999]);
        this.reportMetric(`${timer.name}.min`, metrics_1.toMs(timer.min()));
        this.reportMetric(`${timer.name}.mean`, metrics_1.toMs(timer.mean()));
        this.reportMetric(`${timer.name}.max`, metrics_1.toMs(timer.max()));
        this.reportMetric(`${timer.name}.stddev`, metrics_1.toMs(timer.stdDev()));
        this.reportMetric(`${timer.name}.p50`, metrics_1.toMs(percentiles[.50]));
        this.reportMetric(`${timer.name}.p75`, metrics_1.toMs(percentiles[.75]));
        this.reportMetric(`${timer.name}.p95`, metrics_1.toMs(percentiles[.95]));
        this.reportMetric(`${timer.name}.p98`, metrics_1.toMs(percentiles[.98]));
        this.reportMetric(`${timer.name}.p99`, metrics_1.toMs(percentiles[.99]));
        this.reportMetric(`${timer.name}.p999`, metrics_1.toMs(percentiles[.999]));
    }
    ;
    reportHistogram(histogram) {
        this.reportMetric(`${histogram.name}.count`, histogram.count);
        const percentiles = histogram.percentiles([.50, .75, .95, .98, .99, .999]);
        this.reportMetric(`${histogram.name}.min`, histogram.min);
        this.reportMetric(`${histogram.name}.mean`, histogram.mean());
        this.reportMetric(`${histogram.name}.max`, histogram.max);
        this.reportMetric(`${histogram.name}.stddev`, histogram.stdDev());
        this.reportMetric(`${histogram.name}.p50`, percentiles[.50]);
        this.reportMetric(`${histogram.name}.p75`, percentiles[.75]);
        this.reportMetric(`${histogram.name}.p95`, percentiles[.95]);
        this.reportMetric(`${histogram.name}.p98`, percentiles[.98]);
        this.reportMetric(`${histogram.name}.p99`, percentiles[.99]);
        this.reportMetric(`${histogram.name}.p999`, percentiles[.999]);
    }
    ;
}
exports.default = StatusPageReporter;
