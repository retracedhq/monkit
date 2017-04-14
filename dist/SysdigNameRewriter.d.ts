export interface DimensionMapping {
    dimension: string;
    position: number;
}
export default class SysdigNameRewriter {
    static readonly BASE_DIMENSION: string;
    private readonly schema;
    constructor(schema: DimensionMapping[]);
    rewriteName(name: string): string;
}
