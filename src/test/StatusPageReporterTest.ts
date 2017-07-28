import { suite, test } from "mocha-typescript";
import * as nock from "nock";

import StatusPageReporter from "../StatusPageReporter";
import Registry from "../Registry";

@suite class StatusPageReporterTest {
    @test public "StatusPageReporter#report() with counter"() {
        const count = 2;

        const registry = new Registry();
        registry.counter("foo.counter").inc(count);

        const reporter = new StatusPageReporter(
            registry,
            "api.statuspage.io",
            "some-page-id",
            "some-api-token",
            { "foo.counter.count": "314023" },
        );

        nock("https://api.statuspage.io", {
            reqheaders: {
                Authorization: "OAuth some-api-token",
            },
        }).post(
            "/v1/pages/some-page-id/metrics/314023/data.json",
            (body) => body.indexOf("data[timestamp]") !== -1 &&
                      body.indexOf(`data[value]"\r\n\r\n${count}`) !== -1,
        ).reply(200);

        reporter.report();
    }

    @test public "StatusPageReporter#report() with meter"() {
        const count = 3;

        const registry = new Registry();
        registry.meter("foo.meter").mark(count);

        const reporter = new StatusPageReporter(
            registry,
            "api.statuspage.io",
            "some-page-id",
            "some-api-token",
            { "foo.meter.count": "8675309" },
        );

        nock("https://api.statuspage.io", {
            reqheaders: {
                Authorization: "OAuth some-api-token",
            },
        }).post(
            "/v1/pages/some-page-id/metrics/8675309/data.json",
            (body) => body.indexOf("data[timestamp]") !== -1 &&
                      body.indexOf(`data[value]"\r\n\r\n${count}`) !== -1,
        ).reply(200);

        reporter.report();
    }

    @test public "StatusPageReporter#report() with timer"() {

        const fiveMsInNanos = 5000000;
        const fiveMs = 5;

        const registry = new Registry();
        registry.timer("foo.timer").update(fiveMsInNanos);

        const reporter = new StatusPageReporter(
            registry,
            "api.statuspage.io",
            "some-page-id",
            "some-api-token",
            { "foo.timer.max": "kfbr392" },
        );

        nock("https://api.statuspage.io", {
            reqheaders: {
                Authorization: "OAuth some-api-token",
            },
        }).post(
            "/v1/pages/some-page-id/metrics/kfbr392/data.json",
            (body) => body.indexOf("data[timestamp]") !== -1 &&
                      body.indexOf(`data[value]"\r\n\r\n${fiveMs}`) !== -1,
        ).reply(200);

        reporter.report();
    }

    @test public "StatusPageReporter#report() with histogram"() {

        const value = 200;

        const registry = new Registry();
        registry.histogram("foo.histogram").update(value);

        const reporter = new StatusPageReporter(
            registry,
            "api.statuspage.io",
            "some-page-id",
            "some-api-token",
            { "foo.histogram.max": "mxcmxci" },
        );

        nock("https://api.statuspage.io", {
            reqheaders: {
                Authorization: "OAuth some-api-token",
            },
        }).post(
            "/v1/pages/some-page-id/metrics/mxcmxci/data.json",
            (body) => body.indexOf("data[timestamp]") !== -1 &&
                      body.indexOf(`data[value]"\r\n\r\n${value}`) !== -1,
        ).reply(200);

        reporter.report();
    }

    @test public "StatusPageReporter#report() with gauge"() {

        const value = 10;

        const registry = new Registry();
        registry.gauge("foo.gauge").set(value);

        const reporter = new StatusPageReporter(
            registry,
            "api.statuspage.io",
            "some-page-id",
            "some-api-token",
            { "foo.gauge": "metricID1" },
        );

        nock("https://api.statuspage.io", {
            reqheaders: {
                Authorization: "OAuth some-api-token",
            },
        }).post(
            "/v1/pages/some-page-id/metrics/metricID1/data.json",
            (body) => body.indexOf("data[timestamp]") !== -1 &&
                      body.indexOf(`data[value]"\r\n\r\n${value}`) !== -1,
        ).reply(200);

        reporter.report();
    }
}
