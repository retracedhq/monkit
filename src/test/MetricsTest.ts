import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import { meter, timer, counter, histogram, instrumented, getRegistry } from "../metrics";

@suite class MetricsTest {

    @test public async "@instrumented this binding"() {
        // tslint:disable-next-line:max-classes-per-file
        class X5 {
            private thing: any;

            constructor(thing: any) {
                this.thing = thing;
            }
            @instrumented
            public async bindsCorrectThisArgument() {
                return this.thing;
            }
        }

        const thing = 5;
        const d = new X5(thing);

        const boundField = await d.bindsCorrectThisArgument();
        expect(thing).to.equal(boundField);
    }

    @test public async "@instrumented throughput tracking and timing"() {

        const toNanos = (millis) => millis * 1000000;
        const sleepTime = 5;

        // tslint:disable-next-line:max-classes-per-file
        class X5 {
            @instrumented
            public async throughputTracking() {
                return new Promise((res, rej) => {
                    setInterval(res, sleepTime);
                });
            }
        }

        const d = new X5();

        await d.throughputTracking();
        await d.throughputTracking();

        const timer = getRegistry().getMetric("X5.throughputTracking.timer");
        expect(timer.count()).to.equal(2);
        expect(timer.mean()).to.be.lessThan(toNanos(sleepTime + 2));
        expect(timer.mean()).to.be.greaterThan(toNanos(sleepTime - 2));
    }

    @test public async "@instrumented error tracking"() {

        // tslint:disable-next-line:max-classes-per-file
        class X5 {
            @instrumented
            public async errorTracking() {
                return new Promise((res, rej) => {
                    rej("oh noes!");
                });
            }
        }

        const d = new X5();
        try {
            await d.errorTracking();
        } catch (err) { /* ignored */ }

        const errors = getRegistry().getMetric("X5.errorTracking.errors");
        expect(errors.count).to.equal(1);
    }
}
