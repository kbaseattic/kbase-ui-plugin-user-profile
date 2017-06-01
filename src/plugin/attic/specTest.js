/*
validator

A simple validator for javasript objects, but especially tuned to validating knockout component parameters.

Inspired by and somewhat modeled after clojure specs.

Register a spec, which when applied to a value will result in a validation result.

Specs may be combined by ...

validate a value simply by calling validate with a root spec id.

e.g.

var specs = Spec.make();
specs.add('age', function (value) {
    if (typeof value !== 'number') {
        return {
            valid: false,
            message: 'not a number'
        }
    }
    if (value < 0) {
        return {
            valid: false,
            message: 'must be greater than 0'
        }
    }
    if (value > 200) {
        return {
            valid: false,
            message: 'it is highly unlikely that an individual will live to 200 years'
        }
    }
});

specs.validate(25, 'age');
specs.validate(-1, 'age');
specs.validate(300, 'age');
specs.validate('old', 'age');

*/

define([
    './spec'
], function (
    Spec
) {
    'use strict';

    function runTests() {
        var spec = Spec.make();

        function expect(generator, test) {
            try {
                var result = generator();
                if (!(test(result))) {
                    return false;
                } else {
                    return true;
                }
            } catch (ex) {
                return false;
            }
        }

        function report(spec) {
            var status;
            var message;
            if (spec.result) {
                status = 'ok';
                message = '';
            } else {
                status = 'fail';
                message = spec.message;
            }
            return {
                status: status,
                title: spec.title,
                message: message
            };
        }
        spec.add({
            id: 'age',
            validate: function (value) {
                if (typeof value !== 'number') {
                    return {
                        valid: false,
                        message: 'not a number',
                        reason: 'specfailure'
                    };
                }
                if (value < 0) {
                    return {
                        valid: false,
                        message: 'must be greater than 0',
                        reason: 'specfailure'
                    };
                }
                if (value > 200) {
                    return {
                        valid: false,
                        message: 'it is highly unlikely that an individual will live to 200 years',
                        reason: 'specfailure'
                    };
                }
                return {
                    valid: true
                };
            }
        });

        function specFailure(message) {
            return {
                valid: false,
                reason: 'specfailure',
                message: message
            };
        }

        function specSuccess() {
            return {
                valid: true
            };
        }

        function simpleTest() {
            var spec = Spec.make();
            spec.add({
                id: 'age',
                validate: function (value) {
                    if (typeof value !== 'number') {
                        return specFailure('not a number');
                    }
                    if (value < 0) {
                        return specFailure('must be greater than 0');
                    }
                    if (value > 200) {
                        return specFailure('it is highly unlikely that an individual will live to 200 years');
                    }
                    return specSuccess();
                }
            });
            spec.add({
                id: 'core.timestamp',
                validate: function (value) {
                    if (typeof value !== 'string') {
                        return specFailure('not a string');
                    }
                    try {
                        new Date(value);
                        return specSuccess();
                    } catch (ex) {
                        return specFailure('not a valid date format');
                    }
                }
            });
            spec.add({
                id: 'core.city',
                validate: function (value) {
                    if (typeof value !== 'string') {
                        return specFailure('not a string');
                    }
                    if (value.length === 0) {
                        return specFailure('there is no empty-named city');
                    }
                    return specSuccess();
                }
            });
            spec.add({
                id: 'key.city',
                validate: function (value) {
                    return spec.validate(value, 'core.city');
                }
            });
            spec.add({
                id: 'key.date',
                validate: function (value) {
                    return spec.validate(value, 'core.timestamp');
                }
            });
            spec.add({
                id: 'logic.and',
                validate: function (value) {
                    if (!(value instanceof Array)) {
                        return specFailure('not an array');
                    }
                    for (var i = 0; i < value.length; i += 1) {
                        var result = spec.validate(value[i].value, value[i].spec);
                        if (!result.valid) {
                            return specFailure('array element invalid : ' + i + ' : ' + result.message);
                        }
                    }
                    return specSuccess();
                }
            });
            spec.add({
                id: 'struct.birthday',
                validate: function (value) {
                    if (typeof value !== 'object' || value === null) {
                        return specFailure('not a non-null object');
                    }
                    var nextValue = Object.keys(value).map(function (key) {
                        return {
                            spec: 'key.' + key,
                            value: value[key]
                        };
                    });
                    return spec.validate(nextValue, 'logic.and');

                    // for (var key in value) {
                    //     console.log('here', key, value[key]);
                    //     result = spec.validate(value[key], 'key.' + key);
                    //     console.log('result', result);
                    //     if (!result.valid) {
                    //         return specFailure('field spec failed: ' + key + ' : ' + result.message);
                    //     }
                    // }
                    // return specSuccess();
                }
            });

            return report({
                result: expect(function () {
                    return spec.validate({
                        city: 'Oakland',
                        date: '2017-12-26T00:00:00Z'
                    }, 'struct.birthday');
                }, function (result) {
                    return result.valid;
                }),
                title: 'A valid birthday'
            });
        }

        function simpleTest2() {
            var spec = Spec.make();
            spec.add({
                id: 'age',
                validate: function (value) {
                    if (typeof value !== 'number') {
                        return specFailure('not a number');
                    }
                    if (value < 0) {
                        return specFailure('must be greater than 0');
                    }
                    if (value > 200) {
                        return specFailure('it is highly unlikely that an individual will live to 200 years');
                    }
                    return specSuccess();
                }
            });
            spec.add({
                id: 'core.timestamp',
                validate: function (value) {
                    if (typeof value !== 'string') {
                        return specFailure('not a string');
                    }
                    try {
                        new Date(value);
                        return specSuccess();
                    } catch (ex) {
                        return specFailure('not a valid date format');
                    }
                }
            });
            spec.add({
                id: 'core.city',
                validate: function (value) {
                    if (typeof value !== 'string') {
                        return specFailure('not a string');
                    }
                    if (value.length === 0) {
                        return specFailure('there is no empty-named city');
                    }
                    return specSuccess();
                }
            });
            spec.add({
                id: 'key.city',
                validate: function (value) {
                    // return {
                    //     spec: 'core.city',
                    //     value: {
                    //         spec: null,
                    //         value: value
                    //     }
                    // };
                    return spec.validate(value, 'core.city');
                }
            });
            spec.add({
                id: 'key.date',
                validate: function (value) {
                    // return {
                    //     spec: 'core.timestamp',
                    //     value: {
                    //         spec: null,
                    //         value: value
                    //     }
                    // };
                    return spec.validate(value, 'core.timestamp');
                }
            });
            spec.add({
                id: 'logic.and',
                validate: function (value) {
                    if (!(value instanceof Array)) {
                        return specFailure('not an array');
                    }
                    for (var i = 0; i < value.length; i += 1) {
                        var result = spec.validate(value[i].value, value[i].spec);
                        if (!result.valid) {
                            return specFailure('array element invalid : ' + i + ' : ' + result.message);
                        }
                    }
                    return specSuccess();
                }
            });
            // spec.add({
            //     id: 'logic.and',
            //     validate: function (value) {
            //         if (!(value instanceof Array)) {
            //             return specFailure('not an array');
            //         }
            //         for (var i = 0; i < value.length; i += 1) {
            //             var result = spec.validate(value[i].value, value[i].spec);
            //             if (!result.valid) {
            //                 return specFailure('array element invalid : ' + i + ' : ' + result.message);
            //             }
            //         }
            //         return specSuccess();
            //     }
            // });
            spec.add({
                id: 'struct.birthday',
                validate: function (value) {
                    if (typeof value !== 'object' || value === null) {
                        return specFailure('not a non-null object');
                    }
                    var nextValue = Object.keys(value).map(function (key) {
                        return {
                            spec: 'key.' + key,
                            value: value[key]
                        };
                    });
                    return spec.validate(nextValue, 'logic.and');
                }
            });
            // spec.add({
            //     id: 'struct.birthday',
            //     validate: function (value) {
            //         if (typeof value !== 'object' || value === null) {
            //             return specFailure('not a non-null object');
            //         }
            //         var nextValue = Object.keys(value).map(function (key) {
            //             return {
            //                 spec: 'key.' + key,
            //                 value: value[key]
            //             };
            //         });
            //         return spec.validate2({
            //             spec: 'logic.and',
            //             value: nextValue
            //         });
            //     }
            // });

            return function () {
                return report({
                    result: expect(function () {
                        return spec.validate({
                            city: 'Oakland',
                            date: '2017-12-26T00:00:00Z'
                        }, 'struct.birthday');
                    }, function (result) {
                        return result.valid;
                    }),
                    title: 'A valid birthday'
                });
            };
        }

        return [
            report({
                result: expect(function () {
                    return spec.validate(25, 'age');
                }, function (result) {
                    return result.valid;
                }),
                title: 'A valid age'
            }),
            report({
                result: expect(function () {
                    return spec.validate(-1, 'age');
                }, function (result) {
                    return !result.valid;
                }),
                title: 'An age of negative one, should fail'
            }),
            report({
                result: expect(function () {
                    return spec.validate(201, 'age');
                }, function (result) {
                    return !result.valid;
                }),
                title: 'An age of 201 should fail'
            }),
            report({
                result: expect(function () {
                    return spec.validate('old', 'age');
                }, function (result) {
                    return !result.valid;
                }),
                title: 'A string value for age, should fail'
            }),
            (function () {
                var iters = 1000000;
                var start = new Date().getTime();
                for (var i = 0; i < iters; i += 1) {
                    expect(function () {
                        return spec.validate(25, 'age');
                    }, function (result) {
                        return result.valid;
                    });
                }
                var elapsed = new Date().getTime() - start;
                return {
                    status: '',
                    title: 'Performance for single validation',
                    message: 'Ops / sec: ' + iters / (elapsed / 1000)
                };
            }()),
            simpleTest(),
            (function () {
                var iters = 10000;
                var start = new Date().getTime();
                for (var i = 0; i < iters; i += 1) {
                    simpleTest();
                }
                var elapsed = new Date().getTime() - start;
                return {
                    status: '',
                    title: 'Performance for simple validation, each iteration recrerates spec engine',
                    message: 'Ops / sec: ' + iters / (elapsed / 1000)
                };
            }()),
            (function () {
                var test = simpleTest2();
                var iters = 10000;
                var start = new Date().getTime();
                for (var i = 0; i < iters; i += 1) {
                    test();
                }
                var elapsed = new Date().getTime() - start;
                return {
                    status: '',
                    title: 'Performance for simple validation with single spec engine',
                    message: 'Ops / sec: ' + iters / (elapsed / 1000)
                };
            }()),

        ];
    }

    return {
        runTests: runTests
    };
});