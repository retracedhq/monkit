export default class Gauge {
    public value: number;

    constructor() {
        this.value = 0;
    }

    public set(value: number) {
        this.value = value;
    }
}
