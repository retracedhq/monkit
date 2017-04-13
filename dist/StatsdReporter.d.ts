/// <reference types="statsd-client" />
import * as StatsdClient from "statsd-client";
import Registry from "./Registry";
export default class StatsdReporter {
    private readonly registry;
    private readonly prefix;
    private readonly client;
    constructor(registry: Registry, prefix: string, client: StatsdClient);
    report(): void;
    private buildPrefix();
    private reportCounter(counter);
    private reportMeter(meter);
    private reportTimer(timer);
    private reportHistogram(histogram);
}
