"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_typescript_1 = require("mocha-typescript");
var chai_1 = require("chai");
var metrics_1 = require("../metrics");
var MetricsTests = (function () {
    function MetricsTests() {
    }
    MetricsTests.prototype["metrics.counter()"] = function () {
        metrics_1.counter("foo.counter").inc(200);
        metrics_1.counter("foo.counter").dec(100);
        var count = metrics_1.counter("foo.counter").count;
        chai_1.expect(count).to.equal(100);
    };
    ;
    MetricsTests.prototype["metrics.meter()"] = function () {
        metrics_1.meter("foo.bar").mark();
        metrics_1.meter("foo.bar").mark();
        var count = metrics_1.meter("foo.bar").count;
        chai_1.expect(count).to.equal(2);
    };
    ;
    MetricsTests.prototype["metrics.histogram()"] = function () {
        metrics_1.histogram("foo.histogram").update(200);
        metrics_1.histogram("foo.histogram").update(100);
        var count = metrics_1.histogram("foo.histogram").count;
        var mean = metrics_1.histogram("foo.histogram").mean();
        chai_1.expect(count).to.equal(2);
        chai_1.expect(mean).to.equal(150);
    };
    ;
    MetricsTests.prototype["metrics.timer()"] = function () {
        metrics_1.timer("foo.baz").update(200);
        metrics_1.timer("foo.baz").update(100);
        var count = metrics_1.timer("foo.baz").count();
        var mean = metrics_1.timer("foo.baz").mean();
        chai_1.expect(count).to.equal(2);
        chai_1.expect(mean).to.equal(150);
    };
    ;
    MetricsTests.prototype["@instrumented this binding"] = function () {
        return __awaiter(this, void 0, void 0, function () {
            var X5, thing, d, boundField;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        X5 = (function () {
                            function X5(thing) {
                                this.thing = thing;
                            }
                            X5.prototype.bindsCorrectThisArgument = function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/, this.thing];
                                    });
                                });
                            };
                            return X5;
                        }());
                        __decorate([
                            metrics_1.instrumented
                        ], X5.prototype, "bindsCorrectThisArgument", null);
                        thing = 5;
                        d = new X5(thing);
                        return [4 /*yield*/, d.bindsCorrectThisArgument()];
                    case 1:
                        boundField = _a.sent();
                        chai_1.expect(thing).to.equal(boundField);
                        return [2 /*return*/];
                }
            });
        });
    };
    MetricsTests.prototype["@instrumented throughput tracking and timing"] = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toNanos, sleepTime, X5, d, timer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toNanos = function (millis) { return millis * 1000000; };
                        sleepTime = 5;
                        X5 = (function () {
                            function X5() {
                            }
                            X5.prototype.throughputTracking = function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/, new Promise(function (res, rej) {
                                                setInterval(res, sleepTime);
                                            })];
                                    });
                                });
                            };
                            return X5;
                        }());
                        __decorate([
                            metrics_1.instrumented
                        ], X5.prototype, "throughputTracking", null);
                        d = new X5();
                        return [4 /*yield*/, d.throughputTracking()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, d.throughputTracking()];
                    case 2:
                        _a.sent();
                        timer = metrics_1.getRegistry().getMetric("X5.throughputTracking");
                        chai_1.expect(timer.count()).to.equal(2);
                        chai_1.expect(timer.mean()).to.be.lessThan(toNanos(sleepTime + 2));
                        chai_1.expect(timer.mean()).to.be.greaterThan(toNanos(sleepTime - 2));
                        return [2 /*return*/];
                }
            });
        });
    };
    MetricsTests.prototype["@instrumented error tracking"] = function () {
        return __awaiter(this, void 0, void 0, function () {
            var X5, d, err_1, errors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        X5 = (function () {
                            function X5() {
                            }
                            X5.prototype.errorTracking = function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/, new Promise(function (res, rej) {
                                                rej("oh noes!");
                                            })];
                                    });
                                });
                            };
                            return X5;
                        }());
                        __decorate([
                            metrics_1.instrumented
                        ], X5.prototype, "errorTracking", null);
                        d = new X5();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, d.errorTracking()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        errors = metrics_1.getRegistry().getMetric("X5.errorTracking.errors");
                        chai_1.expect(errors.count).to.equal(1);
                        return [2 /*return*/];
                }
            });
        });
    };
    return MetricsTests;
}());
__decorate([
    mocha_typescript_1.test
], MetricsTests.prototype, "metrics.counter()", null);
__decorate([
    mocha_typescript_1.test
], MetricsTests.prototype, "metrics.meter()", null);
__decorate([
    mocha_typescript_1.test
], MetricsTests.prototype, "metrics.histogram()", null);
__decorate([
    mocha_typescript_1.test
], MetricsTests.prototype, "metrics.timer()", null);
__decorate([
    mocha_typescript_1.test
], MetricsTests.prototype, "@instrumented this binding", null);
__decorate([
    mocha_typescript_1.test
], MetricsTests.prototype, "@instrumented throughput tracking and timing", null);
__decorate([
    mocha_typescript_1.test
], MetricsTests.prototype, "@instrumented error tracking", null);
MetricsTests = __decorate([
    mocha_typescript_1.suite
], MetricsTests);
