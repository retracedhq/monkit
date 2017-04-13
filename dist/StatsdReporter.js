"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_1 = require("./metrics");
class StatsdReporter {
    constructor(registry, prefix, client, nameRewriter) {
        this.registry = registry;
        this.prefix = prefix;
        this.client = client;
        this.nameRewriter = nameRewriter ? nameRewriter : x => x;
    }
    report() {
        const metrics = this.registry.getMetrics();
        try {
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
        catch (err) {
            console.error("Failed to report metrics to statsd:", err);
        }
    }
    buildPrefix() {
        if (this.prefix) {
            return this.prefix + ".";
        }
        return "";
    }
    reportCounter(counter) {
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${counter.name}.count`), counter.count);
    }
    reportMeter(meter) {
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.count`), meter.count);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.mean_rate`), metrics_1.toOpsPerMin(meter.meanRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.m1_rate`), metrics_1.toOpsPerMin(meter.oneMinuteRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.m5_rate`), metrics_1.toOpsPerMin(meter.fiveMinuteRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.m15_rate`), metrics_1.toOpsPerMin(meter.fifteenMinuteRate()));
    }
    reportTimer(timer) {
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.count`), timer.count());
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.mean_rate`), timer.meanRate());
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.m1_rate`), timer.oneMinuteRate());
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.m5_rate`), timer.fiveMinuteRate());
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.m15_rate`), timer.fifteenMinuteRate());
        const percentiles = timer.percentiles([.50, .75, .95, .98, .99, .999]);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.min`), metrics_1.toMs(timer.min()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.mean`), metrics_1.toMs(timer.mean()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.max`), metrics_1.toMs(timer.max()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.stddev`), metrics_1.toMs(timer.stdDev()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p50`), metrics_1.toMs(percentiles[.50]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p75`), metrics_1.toMs(percentiles[.75]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p95`), metrics_1.toMs(percentiles[.95]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p98`), metrics_1.toMs(percentiles[.98]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p99`), metrics_1.toMs(percentiles[.99]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p999`), metrics_1.toMs(percentiles[.999]));
    }
    reportHistogram(histogram) {
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.count`), histogram.count);
        const percentiles = histogram.percentiles([.50, .75, .95, .98, .99, .999]);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.min`), histogram.min);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.mean`), histogram.mean());
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.max`), histogram.max);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.stddev`), histogram.stdDev());
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.p50`), percentiles[.50]);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.p75`), percentiles[.75]);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.p95`), percentiles[.95]);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.p98`), percentiles[.98]);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.p99`), percentiles[.99]);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${histogram.name}.p999`), percentiles[.999]);
    }
}
exports.default = StatsdReporter;
