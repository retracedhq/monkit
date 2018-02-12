import { Registry } from "./types";
import ReadableRegistry from "./Registry";

let defaultRegistry: Registry = new ReadableRegistry();
let defaultNamer: MethodNamer = (klass, method) => `${klass}.${method}`;

export type MethodNamer = (klass: string, method: string) => string;

export function getRegistry(): Registry {
  return defaultRegistry;
}

export function getNamer(): MethodNamer {
  return defaultNamer;
}

export function setRegistry(reg: Registry) {
  defaultRegistry = reg;
}

export function setNamer(namer: MethodNamer) {
  defaultNamer = namer;
}

export function toOpsPerMin(rate) {
  return rate * 60;
}

export function toMs(nanos) {
  return nanos / 1000000;
}

// Details about how to send data about method performance
export interface InstrumentationOpts {
  // allow a promise here, because await-ing a decorator argument is hard
  registry?: Registry | Promise<Registry>;
  name?: string;
  tags?: string[];
}

// same as InstrumentationOpts, but `name` is required
export type NamedInstrumentationOpts = InstrumentationOpts & { name: string; };

/**
 * TypeScript decorator for adding
 * throughput, latency, and error monitoring
 * to a method.
 *
 * NOTE: if opts.registry is a Promise, `@instrumented()` will log metrics in the default registry
 * returned by getRegistry() until the promise resolves, then switch over to the provided registry.
 *
 * @param opts InstrumentationOpts Options
 */
export function instrumented(opts?: InstrumentationOpts) {
  const tags = (opts && opts.tags) || [];

  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    let originalMethod = descriptor.value;
    const klass = target.constructor.name;
    tags.push(`class:${klass}`);
    tags.push(`method:${key}`);

    // this needs to be a non-arrow function or we'll get the wrong `this`
    function overrideMethod() {
      const name = (opts && opts.name) || getNamer()(klass, key);
      const registry = (opts && opts.registry) || getRegistry();
      const args = arguments;
      return instrument({name, registry, tags}, async () => {
        return await originalMethod.apply(this, args);
      });
    }

    descriptor.value = overrideMethod;

    return descriptor;
  };
}

/**
 * Run the given function, recording throughput, latency and errors
 *
 * NOTE: if opts.registry is a Promise, `instrument` will log metrics in the default registry
 * returned by getRegistry() until the promise resolves, then switch over to the provided registry.
 *
 * in Promise.race, we sleep for 1ms to ensure we always get the custom one if its ready.
 * this only adds 1ms while we're waiting to bootstrap a custom registry, then
 * adds no overhead. This is a bit of a hack, might not be necessary.
 *
 * @param instrumentation InstrumentationOpts details
 * @param delegate        the function to run
 */
export async function instrument(
  {registry, name, tags}: NamedInstrumentationOpts,
  delegate: Function,
) {
  const theRegistry = await Promise.race([
    (registry || getRegistry()),
    new Promise<Registry>((res) => setTimeout(() => res(getRegistry()), 1)),
  ]);

  const t = theRegistry.timer(`${name}.timer`, tags);
  const errors = theRegistry.meter(`${name}.errors`, tags);
  const start = process.hrtime();

  try {
    return await delegate();
  } catch (err) {
    errors.mark();
    throw err;
  } finally {
    const elapsed = process.hrtime(start);
    const elapsedNanos = (elapsed[0] * 1000000000) + elapsed[1];
    t.update(elapsedNanos);
  }
}
