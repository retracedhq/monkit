# monkit

[![CircleCI](https://circleci.com/gh/retracedhq/monkit.svg?style=svg&circle-token=5fb991c02e8855f213eec652e45ebf09403ad5d0)](https://circleci.com/gh/retracedhq/monkit)
[![Code Climate](https://codeclimate.com/github/retracedhq/monkit/badges/gpa.svg)](https://codeclimate.com/github/retracedhq/monkit) 
[![Test Coverage](https://codeclimate.com/github/retracedhq/monkit/badges/coverage.svg)](https://codeclimate.com/github/retracedhq/monkit/coverage)


Small App Metrics Toolkit for NodeJS/Typescript 

Some custom metrics reporters and a partial port of the java [instrumentor](https://github.com/sproutsocial/instrumentor) project.
Built using the `metrics` module [in npm](https://www.npmjs.com/package/metrics).

## Usage

** Instrumenting Methods **

Instrument an async method by giving it a name and wrapping it with `instrument`: 

```javascript
const monkit = require('monkit');
const wrapped = monkit.instrument("my.important.method", async () => {
    return await doImportantWork();
});


const result = await wrapped();

// By default, metrics will be stored in the project registry available via `monkit.getRegistry()`

console.log(monkit.getRegistry().timer("my.important.method.timer").count); // 1

```

** Using Decorators **

Methods decorated with `@instrumented` will be instrumented as `ClassName.MethodName` with timing, throughput, and error tracking:

```
class MyClass {
    @instrumented
    public async myMethod(): ImportantThing {
        return await doImportantWork();
    }
}

const result = await new MyClass().myMethod();

// By default, metrics will be stored in the project registry available via `monkit.getRegistry()`

console.log(monkit.getRegistry().timer("MyClass.myMethod.timer").count); // 1
```

** Reporting Metrics **

Extra Reporters include 
- a `StatsdReporter` for reporting preagregated metrics as statsd gaugues
- a `StatusPageReporter`, which can be used to periodically send metrics to or statuspage.io

At time of writing, still need to tweak `monkit.Registry` to make it compatible with other reporters from the `metrics` pacakge.

