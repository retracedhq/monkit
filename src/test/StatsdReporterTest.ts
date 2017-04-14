import { suite, test } from "mocha-typescript";
import * as TypeMoq from "typemoq";

import * as StatsdClient from "statsd-client";

import StatsdReporter from "../StatsdReporter";
import Registry from "../Registry";

const once = TypeMoq.Times.once;

@suite class StatsdReporterTest {
    @test public "StatsdReporter#report()"() {
        const client = TypeMoq.Mock.ofType(StatsdClient);
        const fiveMsInNanos = 5000000;
        const fiveMs = 5;

        const registry = new Registry();
        registry.counter("foo.counter").inc(3);
        registry.meter("foo.meter").mark();
        registry.timer("foo.timer").update(fiveMsInNanos);
        registry.histogram("foo.histogram").update(200);

        const reporter = new StatsdReporter(registry, "prefix", client.object);

        reporter.report();

        client.verify(x => x.gauge("prefix.foo.counter.count", 3), once());

        client.verify(x => x.gauge("prefix.foo.meter.count", 1), once());

        client.verify(x => x.gauge("prefix.foo.timer.count", 1), once());
        client.verify(x => x.gauge("prefix.foo.timer.max", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.min", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p50", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p75", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p95", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p98", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p99", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p999", fiveMs), once());

        client.verify(x => x.gauge("prefix.foo.histogram.count", 1), once());
        client.verify(x => x.gauge("prefix.foo.histogram.max", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.min", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p50", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p75", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p95", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p98", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p99", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p999", 200), once());
    }

    @test public "StatsdReporter#report() without prefix"() {
        const client = TypeMoq.Mock.ofType(StatsdClient);
        const fiveMsInNanos = 5000000;
        const fiveMs = 5;

        const registry = new Registry();
        registry.counter("foo.counter").inc(3);
        registry.meter("foo.meter").mark();
        registry.timer("foo.timer").update(fiveMsInNanos);
        registry.histogram("foo.histogram").update(200);

        const reporter = new StatsdReporter(registry, "", client.object);

        reporter.report();

        client.verify(x => x.gauge("foo.counter.count", 3), once());

        client.verify(x => x.gauge("foo.meter.count", 1), once());

        client.verify(x => x.gauge("foo.timer.count", 1), once());
        client.verify(x => x.gauge("foo.timer.max", fiveMs), once());
        client.verify(x => x.gauge("foo.timer.min", fiveMs), once());
        client.verify(x => x.gauge("foo.timer.p50", fiveMs), once());
        client.verify(x => x.gauge("foo.timer.p75", fiveMs), once());
        client.verify(x => x.gauge("foo.timer.p95", fiveMs), once());
        client.verify(x => x.gauge("foo.timer.p98", fiveMs), once());
        client.verify(x => x.gauge("foo.timer.p99", fiveMs), once());
        client.verify(x => x.gauge("foo.timer.p999", fiveMs), once());

        client.verify(x => x.gauge("foo.histogram.count", 1), once());
        client.verify(x => x.gauge("foo.histogram.max", 200), once());
        client.verify(x => x.gauge("foo.histogram.min", 200), once());
        client.verify(x => x.gauge("foo.histogram.p50", 200), once());
        client.verify(x => x.gauge("foo.histogram.p75", 200), once());
        client.verify(x => x.gauge("foo.histogram.p95", 200), once());
        client.verify(x => x.gauge("foo.histogram.p98", 200), once());
        client.verify(x => x.gauge("foo.histogram.p99", 200), once());
        client.verify(x => x.gauge("foo.histogram.p999", 200), once());
    }
    @test public "StatsdReporter#report() execption"() {
        const client = TypeMoq.Mock.ofType(StatsdClient);

        const registry = new Registry();
        registry.counter("foo.counter").inc(3);
        client.setup(x => x.gauge("foo.counter.count", 3))
              .throws(new Error("oh noes!"))
              .verifiable(TypeMoq.Times.once());

        const reporter = new StatsdReporter(registry, "", client.object);

        reporter.report();

        client.verifyAll();
    }

    @test public "StatsdReporter#report() with nameRewriter"() {
        const client = TypeMoq.Mock.ofType(StatsdClient);
        const fiveMsInNanos = 5000000;
        const fiveMs = 5;

        const registry = new Registry();
        registry.counter("foo.counter").inc(3);
        registry.meter("foo.meter").mark();
        registry.timer("foo.timer").update(fiveMsInNanos);
        registry.histogram("foo.histogram").update(200);

        const reporter = new StatsdReporter(registry, "prefix", client.object, s => `${s}.${s}`);

        reporter.report();

        client.verify(x => x.gauge("prefix.foo.counter.count.prefix.foo.counter.count", 3), once());

        client.verify(x => x.gauge("prefix.foo.meter.count.prefix.foo.meter.count", 1), once());

        client.verify(x => x.gauge("prefix.foo.timer.count.prefix.foo.timer.count", 1), once());
        client.verify(x => x.gauge("prefix.foo.timer.max.prefix.foo.timer.max", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.min.prefix.foo.timer.min", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p50.prefix.foo.timer.p50", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p75.prefix.foo.timer.p75", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p95.prefix.foo.timer.p95", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p98.prefix.foo.timer.p98", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p99.prefix.foo.timer.p99", fiveMs), once());
        client.verify(x => x.gauge("prefix.foo.timer.p999.prefix.foo.timer.p999", fiveMs), once());

        client.verify(x => x.gauge("prefix.foo.histogram.count.prefix.foo.histogram.count", 1), once());
        client.verify(x => x.gauge("prefix.foo.histogram.max.prefix.foo.histogram.max", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.min.prefix.foo.histogram.min", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p50.prefix.foo.histogram.p50", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p75.prefix.foo.histogram.p75", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p95.prefix.foo.histogram.p95", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p98.prefix.foo.histogram.p98", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p99.prefix.foo.histogram.p99", 200), once());
        client.verify(x => x.gauge("prefix.foo.histogram.p999.prefix.foo.histogram.p999", 200), once());
    }
}
