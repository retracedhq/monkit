
export interface DimensionMapping {
    dimension: string;
    position: number;

}

/**
 * Rewrites dot-delimited metric names to use
 * the Sysdig extension to the statsd protocol
 * that allows for tagging metrics. Instance of this class could take
 *
 * a schema
 *
 * ```
 * [
 *   {position: 0, dimesion: SysdigNameRewriter.BASE_DIMENSION},
 *   {position: 1, dimension: "aggregation"}
 * ]
 * ```
 *
 * and turn the metric name
 *
 * ```
 * "MyClass.m1_rate"
 * ```
 *
 * into
 *
 * ```
 * "MyClass#aggregation=m1_rate""
 * ```
 *
 * See unit tests for more examples.
 * Protocol is described at
 * https://support.sysdig.com/hc/en-us/articles/204376099-Metrics-integrations-StatsD
 */
export default class SysdigNameRewriter {

    public static readonly BASE_DIMENSION = "__base";
    private readonly schema: DimensionMapping[];

    constructor(schema: DimensionMapping[]) {
        this.schema = schema;
    }

    public rewriteName(name: string) {
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
            } else {
                acc += `${dimension}=${parts[position]},`;
            }
        }

        if (acc.endsWith(",")) {
            acc = acc.slice(0, -1);
        }

        return acc;
    }
}
