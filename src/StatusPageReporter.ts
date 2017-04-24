import * as request from "request";
import * as util from "util";
import { toOpsPerMin, toMs } from "./metrics";
import Registry from "./Registry";

/**
 * Periodically reports metrics to statusPage.
 *
 * This will only report the metrics mapped in `metricIds`.
 * For example, if the value of
 *
 *     EventCreater.createEvent.mean_rate
 *
 * corresponses to a Statuspage metric with id
 *
 *     07cd11baefa0
 *
 * Then the following mapping should be provided:
 *
 *     {
 *         "EventCreater.createEvent.mean_rate": "07cd11baefa0"
 *     }
 * 
 */
export default class StatusPageReporter {

    private readonly registry: Registry;
    private readonly url: string;
    private readonly statusPageToken: string;
    private readonly pageId: string;
    private readonly metricIds: any;

    constructor(
        registry: Registry,
        url: string,
        pageId: string,
        statusPageToken: string,
        metricIds: any,
    ) {
        this.registry = registry;
        this.url = url;
        this.statusPageToken = statusPageToken;
        this.pageId = pageId;
        this.metricIds = metricIds;
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

    public reportMetric(name, value): void {
        const metricId = this.metricIds[name];
        if (!metricId) {
            // only send the ones that are mapped in this.metricIds
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
    };

    private reportCounter(counter): void {
        this.reportMetric(`${counter.name}.count`, counter.count);
    };

    private reportMeter(meter): void {
        this.reportMetric(`${meter.name}.count`, meter.count);
        this.reportMetric(`${meter.name}.mean_rate`, toOpsPerMin(meter.meanRate()));
        this.reportMetric(`${meter.name}.m1_rate`, toOpsPerMin(meter.oneMinuteRate()));
        this.reportMetric(`${meter.name}.m5_rate`, toOpsPerMin(meter.fiveMinuteRate()));
        this.reportMetric(`${meter.name}.m15_rate`, toOpsPerMin(meter.fifteenMinuteRate()));
    };

    private reportTimer(timer): void {
        this.reportMetric(`${timer.name}.count`, timer.count());
        this.reportMetric(`${timer.name}.mean_rate`, toOpsPerMin(timer.meanRate()));
        this.reportMetric(`${timer.name}.m1_rate`, toOpsPerMin(timer.oneMinuteRate()));
        this.reportMetric(`${timer.name}.m5_rate`, toOpsPerMin(timer.fiveMinuteRate()));
        this.reportMetric(`${timer.name}.m15_rate`, toOpsPerMin(timer.fifteenMinuteRate()));

        const percentiles = timer.percentiles([.50, .75, .95, .98, .99, .999]);
        this.reportMetric(`${timer.name}.min`, toMs(timer.min()));
        this.reportMetric(`${timer.name}.mean`, toMs(timer.mean()));
        this.reportMetric(`${timer.name}.max`, toMs(timer.max()));
        this.reportMetric(`${timer.name}.stddev`, toMs(timer.stdDev()));
        this.reportMetric(`${timer.name}.p50`, toMs(percentiles[.50]));
        this.reportMetric(`${timer.name}.p75`, toMs(percentiles[.75]));
        this.reportMetric(`${timer.name}.p95`, toMs(percentiles[.95]));
        this.reportMetric(`${timer.name}.p98`, toMs(percentiles[.98]));
        this.reportMetric(`${timer.name}.p99`, toMs(percentiles[.99]));
        this.reportMetric(`${timer.name}.p999`, toMs(percentiles[.999]));
    };

    private reportHistogram(histogram): void {
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
    };

}
