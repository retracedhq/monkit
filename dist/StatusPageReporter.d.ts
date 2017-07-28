import Registry from "./Registry";
export default class StatusPageReporter {
    private readonly registry;
    private readonly url;
    private readonly statusPageToken;
    private readonly pageId;
    private readonly metricIds;
    constructor(registry: Registry, url: string, pageId: string, statusPageToken: string, metricIds: any);
    report(): void;
    reportMetric(name: any, value: any): void;
    private reportCounter(counter);
    private reportMeter(meter);
    private reportTimer(timer);
    private reportHistogram(histogram);
    private reportGauge(gauge);
}
