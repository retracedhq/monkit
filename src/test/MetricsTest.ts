import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import {
  getRegistry, InstrumentationOpts, instrumented, setNamer,
  setRegistry,
} from "../metrics";
import ReadableRegistry from "../Registry";

describe("@instrumented", () => {
  beforeEach(() => {
    setRegistry(new ReadableRegistry());
    setNamer((k, m) => `${k}.${m}`);
  });

  it("binds `this`", async () => {
    // tslint:disable-next-line:max-classes-per-file
    class X5 {
      private thing: any;

      constructor(thing: any) {
        this.thing = thing;
      }

      @instrumented()
      public async bindsCorrectThisArgument() {
        return this.thing;
      }
    }

    const thing = 5;
    const d = new X5(thing);

    const boundField = await d.bindsCorrectThisArgument();
    expect(thing).to.equal(boundField);
  });

  it("does throughput tracking and timing", async () => {

    const toNanos = (millis) => millis * 1000000;
    const sleepTime = 5;
    const registry = new ReadableRegistry();

    // tslint:disable-next-line:max-classes-per-file
    class X5 {
      @instrumented({registry})
      public async throughputTracking() {
        return new Promise((res, rej) => {
          setTimeout(res, sleepTime);
        });
      }
    }

    const d = new X5();

    await d.throughputTracking();
    await d.throughputTracking();

    const timer = registry.timer("X5.throughputTracking.timer");
    expect(timer.count()).to.equal(2);
    expect(timer.mean()).to.be.lessThan(toNanos(sleepTime + 4));
    expect(timer.mean()).to.be.greaterThan(toNanos(sleepTime - 4));
  });

  it("tracks errors", async () => {
    const registry = new ReadableRegistry();

    // tslint:disable-next-line:max-classes-per-file
    class X5 {
      @instrumented({registry})
      public async errorTracking() {
        return new Promise((res, rej) => {
          rej("oh noes!");
        });
      }
    }

    const d = new X5();
    try {
      await d.errorTracking();
    } catch (err) { /* ignored */
    }

    const errors = registry.getMetric("X5.errorTracking.errors");
    expect(errors.count).to.equal(1);
  });

  it("handles a Promise<Registry> in options", async () => {

    const toNanos = (millis) => millis * 1000000;
    const sleepTime = 5;
    const registry: Promise<ReadableRegistry> = Promise.resolve(new ReadableRegistry());

    const opts: InstrumentationOpts = {registry};

    // tslint:disable-next-line:max-classes-per-file
    class X5 {
      @instrumented(opts)
      public async throughputTracking() {
        return new Promise((res, rej) => {
          setTimeout(res, sleepTime);
        });
      }
    }

    const d = new X5();

    await d.throughputTracking();
    await d.throughputTracking();

    const timer = (await registry).timer("X5.throughputTracking.timer");
    expect(timer.count()).to.equal(2);
    expect(timer.mean()).to.be.lessThan(toNanos(sleepTime + 4));
    expect(timer.mean()).to.be.greaterThan(toNanos(sleepTime - 4));
  });

  it("handles a Promise<Registry> timeout", async () => {

    const toNanos = (millis) => millis * 1000000;
    const sleepTime = 2;
    const registry: Promise<ReadableRegistry> =
      new Promise<ReadableRegistry>((res) => setTimeout(() => res(new ReadableRegistry()), 30));

    // tslint:disable-next-line:max-classes-per-file
    class X5 {
      @instrumented({registry})
      public async timeoutCheck() {
        return new Promise((res, rej) => {
          setTimeout(res, sleepTime);
        });
      }
    }

    const d = new X5();

    // two before, two after
    await d.timeoutCheck();
    await d.timeoutCheck();
    await registry;
    await d.timeoutCheck();
    await d.timeoutCheck();

    // we should get 2 in the custom registry, and 2 in the default registry
    const customTimer = (await registry).timer("X5.timeoutCheck.timer");
    expect(customTimer.count()).to.equal(2);
    expect(customTimer.mean()).to.be.lessThan(toNanos(sleepTime + 4));
    expect(customTimer.mean()).to.be.greaterThan(toNanos(sleepTime - 4));

    const fallbackTimer = (getRegistry() as ReadableRegistry).timer("X5.timeoutCheck.timer");
    expect(fallbackTimer.count()).to.equal(2);
    expect(fallbackTimer.mean()).to.be.lessThan(toNanos(sleepTime + 4));
    expect(fallbackTimer.mean()).to.be.greaterThan(toNanos(sleepTime - 4));

  });

  it("allows for naming overrides", async () => {

    const registry: ReadableRegistry = new ReadableRegistry();
    const name = "thex5";

    // tslint:disable-next-line:max-classes-per-file
    class X5 {
      @instrumented({registry, name})
      public async somelongmethodnamethatwontbeintheregistry() {
        return;
      }
    }

    const d = new X5();

    await d.somelongmethodnamethatwontbeintheregistry();

    const customTimer = registry.timer("thex5.timer");
    expect(customTimer.count()).to.equal(1);
  });

  it("allows for naming overrides via setNamer()", async () => {

    const registry: ReadableRegistry = new ReadableRegistry();
    const name = "thex5";
    setNamer(() => name);

    // tslint:disable-next-line:max-classes-per-file
    class X5 {
      @instrumented({registry})
      public async somelongmethodnamethatwontbeintheregistry() {
        return;
      }
    }

    const d = new X5();

    await d.somelongmethodnamethatwontbeintheregistry();

    const customTimer = registry.timer("thex5.timer");
    expect(customTimer.count()).to.equal(1);
  });

  it("allows for registry overrides via setRegistry()", async () => {

    const registry: ReadableRegistry = new ReadableRegistry();

    // tslint:disable-next-line:max-classes-per-file
    class X5 {
      @instrumented()
      public async method() {
        return;
      }
    }

    const d = new X5();

    // ensure that the registry is honored, even if set after the class is imported.
    setRegistry(registry);

    await d.method();

    const customTimer = registry.timer("X5.method.timer");
    expect(customTimer.count()).to.equal(1);
  });
});
