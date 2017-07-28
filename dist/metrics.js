"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Registry_1 = require("./Registry");
const registry = new Registry_1.default();
function getRegistry() {
    return registry;
}
exports.getRegistry = getRegistry;
;
function meter(name) {
    return registry.meter(name);
}
exports.meter = meter;
function timer(name) {
    return registry.timer(name);
}
exports.timer = timer;
function histogram(name) {
    return registry.histogram(name);
}
exports.histogram = histogram;
function counter(name) {
    return registry.counter(name);
}
exports.counter = counter;
function gauge(name) {
    return registry.gauge(name);
}
exports.gauge = gauge;
function toOpsPerMin(rate) {
    return rate * 60;
}
exports.toOpsPerMin = toOpsPerMin;
function toMs(nanos) {
    return nanos / 1000000;
}
exports.toMs = toMs;
function instrumented(target, key, descriptor) {
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    let originalMethod = descriptor.value;
    const klass = target.constructor.name;
    console.log(`@instrumented decorator processing ${klass}.${key}`);
    function overrideMethod() {
        const args = arguments;
        return instrument(`${klass}.${key}`, () => __awaiter(this, void 0, void 0, function* () {
            return yield originalMethod.apply(this, args);
        }));
    }
    descriptor.value = overrideMethod;
    return descriptor;
}
exports.instrumented = instrumented;
function instrument(name, delegate) {
    return __awaiter(this, void 0, void 0, function* () {
        const t = timer(`${name}.timer`);
        const errors = meter(`${name}.errors`);
        const start = process.hrtime();
        try {
            return yield delegate();
        }
        catch (err) {
            errors.mark();
            throw err;
        }
        finally {
            const elapsed = process.hrtime(start);
            const elapsedNanos = (elapsed[0] * 1000000000) + elapsed[1];
            t.update(elapsedNanos);
        }
    });
}
exports.instrument = instrument;
;
