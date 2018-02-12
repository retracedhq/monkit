
export interface Gauge {
  set(value: number): void;
}

export interface Counter {
  inc(amount?: number): void;
}

export interface Meter {
  mark(amount?: number): void;
}

export interface Histogram {
  update(amount: number): void;
}

export interface Timer {
  update(nanos: number): void;
}

export interface Valued {
  get(): number;
}

export interface Metered {
  count: number;
  meanRate(): number;
  oneMinuteRate(): number;
  iveMinuteRate(): number;
  fifteenMinuteRate(): number;
}

export type Snapshot = {[key: number]: number};

export interface Sampling {
  count: number;
  percentiles(ps: number[]): Snapshot;
}

export type Timed = Metered & Sampling ;

export type Metric = Gauge | Timer | Counter | Meter | Histogram;

export interface Metrics {
  gauges: Valued[];
  counters: Valued[];
  meters: Metered[];
  histograms: Sampling[];
  timers: Timed[];
}

export interface Registry {
  /** get or create a meter with the given name */
  meter(name: string, tags?: string[]): Meter;

  /** get or create a histogram with the given name */
  timer(name: string, tags?: string[]): Timer;

  /** get or create a histogram with the given name */
  histogram(name: string, tags?: string[]): Histogram;

  /** get or create a counter with the given name */
  counter(name: string, tags?: string[]): Counter;

  /** get or create a gauge with the given name */
  gauge(name: string, tags?: string[]): Gauge;

}
