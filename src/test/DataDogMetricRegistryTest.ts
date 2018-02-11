import { describe, it, beforeEach } from "mocha";
import * as TypeMoq from "typemoq";

import { default as DataDogMetricRegistry, DogStatsD } from "../DataDogMetricRegistry";
import { toMs } from "../metrics";
const once = TypeMoq.Times.once;

describe("DataDogMetricRegistry", () => {

  let statsd: DogStatsD;
  let registry: DataDogMetricRegistry;
  beforeEach(() => {
    statsd = TypeMoq.Mock.ofType<DogStatsD>();
    registry = new DataDogMetricRegistry(statsd.object);
  });

  describe("DataDogMetricRegistry#meter()", () => {
    it("meters", () => {
      registry.meter("foo", ["spam:eggs"]).mark(100);

      statsd.verify((x) => {
        x.increment("foo", 100, TypeMoq.It.is((a) => a[0] === "spam:eggs"));
      }, once());
    });
  });

  describe("DataDogMetricRegistry#timer()", () => {
    it("times", () => {
      let nanos = 100000000;
      registry.timer("foo", ["spam:eggs"]).update(nanos);

      statsd.verify((x) => {
        x.timing("foo", toMs(nanos), TypeMoq.It.is((a) => a[0] === "spam:eggs"));
      }, once());
    });
  });

  describe("DataDogMetricRegistry#histogram()", () => {
    it("samples", () => {
      registry.histogram("foo", ["spam:eggs"]).update(100);

      statsd.verify((x) => {
        x.histogram("foo", 100, TypeMoq.It.is((a) => a[0] === "spam:eggs"));
      }, once());
    });
  });

  describe("DataDogMetricRegistry#counter()", () => {

    it("increments", () => {
      registry.counter("operation_counts", ["spam:eggs"]).inc(100);

      statsd.verify((x) => {
        x.increment("operation_counts", 100, TypeMoq.It.is((a) => a[0] === "spam:eggs"));
      }, once());
    });
  });
});
