import { Counter, Gauge, Histogram, Meter, Timer } from "./types";
import { toMs } from "./metrics";
import * as StatsD from "hot-shots";

// stub
export type DogStatsD = any;

export interface StatsDParams {
  host: string;
  port: string;
  prefix: string;
  globalTags: string[];

  [key: string]: any;

}

export default class DataDogMetricRegistry {
  public static hotShots(
    {host, port, prefix, globalTags}: StatsDParams,
    onError: (err: any) => void,
  ): DataDogMetricRegistry {
    let client = new (StatsD as any)({host, port, prefix, globalTags});
    client.socket.on("error", onError);
    return new DataDogMetricRegistry(client);
  }

  constructor(
    private readonly client: DogStatsD,
  ) {
  }

  public meter(name: string, tags?: string[]): Meter {
    const registry = this;
    return {
      mark(amount: number) {
        registry.client.increment(name, amount, tags);
      },
    };
  }

  public timer(name: string, tags?: string[]): Timer {
    const registry = this;
    return {
      update(nanos: number) {
        registry.client.timing(name, toMs(nanos), tags);
      },
    };
  }

  public histogram(name: string, tags?: string[]): Histogram {
    const registry = this;
    return {
      update(amount: number) {
        registry.client.histogram(name, amount, tags);
      },
    };
  }

  public counter(name: string, tags?: string[]): Counter {
    const registry = this;
    return {
      inc(amount?: number) {
        registry.client.increment(name, amount ? amount : 1, tags);
      },
    };
  }

  public gauge(name: string, tags?: string[]): Gauge {
    const registry = this;
    return {
      set(amount: number) {
        registry.client.gauge(name, amount, tags);
      },
    };
  }

}
