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
exports.default = SysdigNameRewriter;
