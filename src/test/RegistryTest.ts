import { suite, test } from "mocha-typescript";
import { expect } from "chai";

import Registry from "../Registry";
const registry = new Registry();

@suite class RegistryTest {

    @test public "Registry#counter(name)"() {
        registry.counter("foo.counter").inc(200);
        registry.counter("foo.counter").dec(100);

        const count = registry.counter("foo.counter").count;

        expect(count).to.equal(100);
    };

    @test public "Registry#meter(name)"() {
        registry.meter("foo").mark();
        registry.meter("foo").mark();
        expect(registry.meter("foo").count).to.equal(2);
    }

    @test public "Registry#histogram(name)"() {
        registry.histogram("foo.histogram").update(200);
        registry.histogram("foo.histogram").update(100);

        const count = registry.histogram("foo.histogram").count;
        const mean = registry.histogram("foo.histogram").mean();

        expect(count).to.equal(2);
        expect(mean).to.equal(150);
    };

    @test public "Registry#timer(name)"() {
        registry.timer("foo.baz").update(200);
        registry.timer("foo.baz").update(100);

        const count = registry.timer("foo.baz").count();
        const mean = registry.timer("foo.baz").mean();

        expect(count).to.equal(2);
        expect(mean).to.equal(150);
    };

    @test public "Registry#gauge(name)"() {
        registry.gauge("how.many").set(10);

        const value = registry.gauge("how.many").value;

        expect(value).to.equal(10);
    }

    @test public "Registry#getMetrics()"() {
        const r = new Registry();
        r.counter("foo.counter").dec(100);
        r.meter("foo.meter").mark();
        r.timer("foo.baz").update(200);
        r.histogram("foo.histogram").update(100);

        const result = r.getMetrics();

        expect(result.counters.length).to.equal(1);
        expect(result.meters.length).to.equal(1);
        expect(result.timers.length).to.equal(1);
        expect(result.histograms.length).to.equal(1);
    };
}
