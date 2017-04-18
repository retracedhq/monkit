import { suite, test } from "mocha-typescript";
import { expect } from "chai";

import SysdigNameRewriter from "../SysdigNameRewriter";

@suite class SysdigNameRewriterTest {
    @test public "SysdigNameRewriter.rewrite()"() {
        const rewriter = new SysdigNameRewriter(SysdigNameRewriter.CLASS_METHOD_METRIC_AGGREGATION);

        const result = rewriter.rewriteName("MyClass.myMethod.timer.m1_rate");

        expect(result).to.equal("MyClass#method=myMethod,metric=timer,aggregation=m1_rate");
    }
    @test public "SysdigNameRewriter.rewrite() with schema out of order"() {

        const outOfOrder = new SysdigNameRewriter([
            {position: 3, dimension: "aggregation"},
            {position: 1, dimension: "method"},
            {position: 2, dimension: "metric"},
            {position: 0, dimension: SysdigNameRewriter.BASE_DIMENSION},
        ]);

        const result = outOfOrder.rewriteName("MyClass.myMethod.timer.m1_rate");

        expect(result).to.equal("MyClass#aggregation=m1_rate,method=myMethod,metric=timer");

    }
    @test public "SysdigNameRewriter.rewrite() ignores out-of-bounds schema mappings"() {
        const rewriter = new SysdigNameRewriter([
            {position: 0, dimension: SysdigNameRewriter.BASE_DIMENSION},
            {position: 2, dimension: "method"},
            {position: 3, dimension: "metric"},
            {position: 1, dimension: "aggregation"},
        ]);

        const result = rewriter.rewriteName("MyClass.m1_rate");

        expect(result).to.equal("MyClass#aggregation=m1_rate");

    }
}
