"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SysdigNameRewriter {
    constructor(schema) {
        this.schema = schema;
    }
    rewriteName(name) {
        const parts = name.split(".");
        const maxIndex = parts.length - 1;
        let acc = "";
        for (const { dimension, position } of this.schema) {
            if (position > maxIndex) {
                console.log(`schema part not found for desired index ${position} of dimension ${dimension} for metric ${name}. Ignoring`);
                continue;
            }
            if (dimension === SysdigNameRewriter.BASE_DIMENSION) {
                acc = parts[position] + "#" + acc;
            }
            else {
                acc += `${dimension}=${parts[position]},`;
            }
        }
        if (acc.endsWith(",")) {
            acc = acc.slice(0, -1);
        }
        return acc;
    }
}
SysdigNameRewriter.BASE_DIMENSION = "__base";
SysdigNameRewriter.CLASS_METHOD_METRIC_AGGREGATION = [
    { position: 0, dimension: SysdigNameRewriter.BASE_DIMENSION },
    { position: 1, dimension: "method" },
    { position: 2, dimension: "metric" },
    { position: 3, dimension: "aggregation" },
];
exports.default = SysdigNameRewriter;
