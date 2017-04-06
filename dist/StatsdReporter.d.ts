import Registry from "./Registry";
export default class StatsdReporter {
    private readonly registry;
    private readonly prefix;
    private readonly client;
    constructor(registry: Registry, prefix: string, host: string, port: number);
    report(): void;
    private reportCounter(counter);
    private buildPrefix();
    private reportMeter(meter);
    private reportTimer(timer);
    private reportHistogram(histogram);
}
