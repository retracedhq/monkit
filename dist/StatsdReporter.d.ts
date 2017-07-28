/// <reference types="statsd-client" />
import * as StatsdClient from "statsd-client";
import Registry from "./Registry";
export default class StatsdReporter {
    private readonly registry;
    private readonly prefix;
    private readonly client;
    private readonly nameRewriter;
    constructor(registry: Registry, prefix: string, client: StatsdClient, nameRewriter?: (name: string) => string);
    report(): void;
    private buildPrefix();
    private reportCounter(counter);
    private reportMeter(meter);
    private reportTimer(timer);
    private reportHistogram(histogram);
    private reportGauge(gauge);
}
