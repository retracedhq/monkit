export interface DimensionMapping {
    dimension: string;
    position: number;
}
export default class SysdigNameRewriter {
    static readonly BASE_DIMENSION: string;
    static readonly CLASS_METHOD_METRIC_AGGREGATION: DimensionMapping[];
    private readonly schema;
    constructor(schema: DimensionMapping[]);
    rewriteName(name: string): string;
}
