import * as StatsdClient from "statsd-client";
import Registry from "./Registry";
import { toOpsPerMin, toMs } from "./metrics";

/**
 * Class to periodically report metrics information to statsd.
 *
 * Even though the underlying metrics include rate and timing data,
 * m1, m5 rates and p50, p75, p99 data are already pre-aggregated
 * so we'll just report everything as a statsd gauge.
 * 
 * This class borrows a lot from the `GraphiteReporter` in the `metrics` package
 */
export default class StatsdReporter {

    private readonly registry: Registry;
    private readonly prefix: string;
    private readonly client: StatsdClient;
    private readonly nameRewriter: (name: string) => string;

    /**
     * @param {Registry} registry the metric registry
     * @param {String}   prefix A string to prefix on each metric (i.e. app.hostserver)
     * @param {StatsdClient} client The statsd client 
     */
    constructor(registry: Registry, prefix: string, client: StatsdClient, nameRewriter?: (name: string) => string) {
        this.registry = registry;
        this.prefix = prefix;
        this.client = client;
        this.nameRewriter = nameRewriter ? nameRewriter : x => x;
    }

    public report(): void {

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

            if (metrics.gauges.length !== 0) {
                metrics.gauges.forEach((gauge) => {
                    this.reportGauge(gauge);
                });
            }
        } catch (err) {
            console.error("Failed to report metrics to statsd:", err);
        }
    }

    private buildPrefix(): string {
        if (this.prefix) {
            return this.prefix + ".";
        }
        return "";
    }

    private reportCounter(counter): void {
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${counter.name}.count`), counter.count);
    }

    private reportMeter(meter): void {
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.count`), meter.count);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.mean_rate`), toOpsPerMin(meter.meanRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.m1_rate`), toOpsPerMin(meter.oneMinuteRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.m5_rate`), toOpsPerMin(meter.fiveMinuteRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${meter.name}.m15_rate`), toOpsPerMin(meter.fifteenMinuteRate()));
    }

    private reportTimer(timer): void {
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.count`), timer.count());
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.mean_rate`), toOpsPerMin(timer.meanRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.m1_rate`), toOpsPerMin(timer.oneMinuteRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.m5_rate`), toOpsPerMin(timer.fiveMinuteRate()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.m15_rate`), toOpsPerMin(timer.fifteenMinuteRate()));

        const percentiles = timer.percentiles([.50, .75, .95, .98, .99, .999]);
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.min`), toMs(timer.min()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.mean`), toMs(timer.mean()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.max`), toMs(timer.max()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.stddev`), toMs(timer.stdDev()));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p50`), toMs(percentiles[.50]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p75`), toMs(percentiles[.75]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p95`), toMs(percentiles[.95]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p98`), toMs(percentiles[.98]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p99`), toMs(percentiles[.99]));
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${timer.name}.p999`), toMs(percentiles[.999]));
    }

    private reportHistogram(histogram): void {

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

    private reportGauge(gauge): void {
        this.client.gauge(this.nameRewriter(`${this.buildPrefix()}${gauge.name}`), gauge.value);
    }
}
