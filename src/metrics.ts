import Registry from "./Registry";

const registry = new Registry();

export function getRegistry(): Registry {
    return registry;
};

export function meter(name: string) {
    return registry.meter(name);
}

export function timer(name: string) {
    return registry.timer(name);
}

export function histogram(name: string) {
    return registry.histogram(name);
}

export function counter(name: string) {
    return registry.counter(name);
}

export function toOpsPerMin(rate) {
    return rate * 60;
}

export function toMs(nanos) {
    return nanos / 1000000;
}

/**
 * TypeScript decorator for adding
 * throughput, latency, and error monitoring
 * to a method.
 *
 * @param target
 * @param key
 * @param descriptor
 */
export function instrumented(target: any, key: string, descriptor: PropertyDescriptor) {
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    let originalMethod = descriptor.value;
    const klass = target.constructor.name;
    console.log(`@instrumented decorator processing ${klass}.${key}`);

    // this needs to be a non-arrow function or we'll get the wrong `this`
    function overrideMethod() {
        const args = arguments;
        return instrument(`${klass}.${key}`, async () => {
            return await originalMethod.apply(this, args);
        });
    }

    descriptor.value = overrideMethod;

    return descriptor;
}

/**
 * Run the given function, recording throughput, latency and errors
 *
 * @param name     a name for the method
 * @param delegate the function to run
 */
export async function instrument(
    name: string,
    delegate: Function,
) {
    const t = timer(`${name}.timer`);
    const errors = meter(`${name}.errors`);
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
};
