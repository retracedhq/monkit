import * as _ from "lodash";
import * as metrics from "metrics";
import { toOpsPerMin, toMs } from "./metrics";
import Registry from "./Registry";
import * as statsd from "node-statsd-client";

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
    private readonly client: statsd.Client;

    /**
     * @param {Report} registry report instance whose metrics to report on.
     * @param {String} prefix A string to prefix on each metric (i.e. app.hostserver)
     * @param {String} host The ip or hostname of the target statsd server.
     * @param {String} port The port graphite is running on, defaults to 8125 if not specified.
     */
    constructor(registry: Registry, prefix: string, host: string, port: number) {
        this.registry = registry;
        this.prefix = prefix;
        this.client = new statsd.Client(host, port || 8125);
    }

    public report(): void {

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
                // Don't log timer if its recorded no metrics.
                if (timer.min() != null) {
                    this.reportTimer(timer);
                }
            });
        }

        if (metrics.histograms.length !== 0) {
            metrics.histograms.forEach((histogram) => {
                // Don't log histogram if its recorded no metrics.
                if (histogram.min != null) {
                    this.reportHistogram(histogram);
                }
            });
        }
    }

    private reportCounter(counter): void {
        this.client.gauge(counter.name, counter.count);
    };

    private buildPrefix(): string {
        if (this.prefix) {
            return `${this.prefix}.`;
        }
        return "";
    };

    private reportMeter(meter): void {
        this.client.gauge(`${this.buildPrefix()}${meter.name}.count`, meter.count);
        this.client.gauge(`${this.buildPrefix()}${meter.name}.mean_rate`, toOpsPerMin(meter.meanRate()));
        this.client.gauge(`${this.buildPrefix()}${meter.name}.m1_rate`, toOpsPerMin(meter.oneMinuteRate()));
        this.client.gauge(`${this.buildPrefix()}${meter.name}.m5_rate`, toOpsPerMin(meter.fiveMinuteRate()));
        this.client.gauge(`${this.buildPrefix()}${meter.name}.m15_rate`, toOpsPerMin(meter.fifteenMinuteRate()));
    };

    private reportTimer(timer): void {
        this.client.gauge(`${this.buildPrefix()}${timer.name}.count`, timer.count());
        this.client.gauge(`${this.buildPrefix()}${timer.name}.mean_rate`, timer.meanRate());
        this.client.gauge(`${this.buildPrefix()}${timer.name}.m1_rate`, timer.oneMinuteRate());
        this.client.gauge(`${this.buildPrefix()}${timer.name}.m5_rate`, timer.fiveMinuteRate());
        this.client.gauge(`${this.buildPrefix()}${timer.name}.m15_rate`, timer.fifteenMinuteRate());

        const percentiles = timer.percentiles([.50, .75, .95, .98, .99, .999]);
        this.client.gauge(`${this.buildPrefix()}${timer.name}.mean`, toMs(timer.min()));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.mean`, toMs(timer.mean()));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.max`, toMs(timer.max()));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.stddev`, toMs(timer.stdDev()));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.p50`, toMs(percentiles[.50]));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.p75`, toMs(percentiles[.75]));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.p95`, toMs(percentiles[.95]));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.p98`, toMs(percentiles[.98]));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.p99`, toMs(percentiles[.99]));
        this.client.gauge(`${this.buildPrefix()}${timer.name}.p999`, toMs(percentiles[.999]));
    };

    private reportHistogram(histogram): void {

        this.client.gauge(`${this.buildPrefix()}${histogram.name}.count`, histogram.count);

        const percentiles = histogram.percentiles([.50, .75, .95, .98, .99, .999]);
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.mean`, histogram.min);
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.mean`, histogram.mean());
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.max`, histogram.max);
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.stddev`, histogram.stdDev());
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.p50`, percentiles[.50]);
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.p75`, percentiles[.75]);
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.p95`, percentiles[.95]);
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.p98`, percentiles[.98]);
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.p99`, percentiles[.99]);
        this.client.gauge(`${this.buildPrefix()}${histogram.name}.p999`, percentiles[.999]);
    };

}
