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

], function () {
    'use strict';


    function factory(config) {
        var rules = {};
        var stack = [];

        function failure(message) {
            return {
                valid: false,
                reason: 'specfailure',
                stack: copy(stack),
                message: message
            };
        }

        function success() {
            return {
                valid: true
            };
        }

        function addSpec(rule) {
            if (rules[rule.id]) {
                throw new Error('Spec already bound: ' + rule.id);
            }
            rules[rule.id] = rule;
        }

        function copy(value) {
            return value.map(function (item) {
                return item;
            });
        }

        function execValidation(data, specId) {
            var result;
            var specFun;

            if (specId instanceof Function) {
                specFun = specId;
                specId = 'anonymous function';
                stack.push(specId);
            } else if (typeof specId === 'string') {
                if (!(specId in rules)) {
                    result = {
                        valid: false,
                        message: 'Invalid spec id: ' + specId,
                        stack: copy(stack),
                        reason: 'specerror',
                        data: {
                            specId: specId
                        }
                    };
                } else {
                    specFun = rules[specId].validate;
                    stack.push(specId);
                }
            } else {
                result = {
                    valid: false,
                    message: 'Invalid type for spec id: ' + (typeof specId),
                    stack: copy(stack),
                    reason: 'specerror',
                    data: {
                        specId: specId
                    }
                };
            }

            if (!result) {
                try {
                    result = specFun.call(internalApi, data);
                } catch (ex) {
                    console.error(ex);
                    result = {
                        valid: false,
                        message: 'exception running spec rule: ' + ex.message,
                        stack: copy(stack),
                        reason: 'exception',
                        data: {
                            exception: ex
                        }
                    };
                }
            }
            stack.pop();
            return result;
        }

        function validate(data, specId) {
            stack = [];
            return execValidation(data, specId);
        }

        function reset() {
            stack = [];
        }

        function and(value) {
            if (!(value instanceof Array)) {
                return failure('not an array');
            }
            for (var i = 0; i < value.length; i += 1) {
                var result = execValidation(value[i].value, value[i].spec);
                if (!result.valid) {
                    return result;
                    // return failure('array element invalid : ' + i + ' : ' + result.message);
                }
            }
            return success();
        }

        function keys(value, requiredKeys, optionalKeys) {
            for (var i in requiredKeys) {
                var key = requiredKeys[i];
                if (!(key in value)) {
                    return failure('required field not on object: ' + key);
                }
            }

            // required keys are always checked
            var nextValue = requiredKeys.map(function (key) {
                return {
                    spec: 'key.' + key,
                    value: value[key]
                };
            });

            // optional are only checked if they are present and defined
            if (optionalKeys) {
                optionalKeys.forEach(function (key) {
                    if (key in value) {
                        nextValue.push({
                            spec: 'key.' + key,
                            value: value[key]
                        });
                    }
                });
            }
            // return execValidation(nextValue, 'logic.and');
            return and(nextValue);
        }

        function all(value, func) {
            if (!(value instanceof Array)) {
                throw new Error('expected value to be an array');
            }
            var result;
            for (var i in value) {
                stack.push(i);
                try {
                    result = func.call(internalApi, value[i]);
                    if (!result.valid) {
                        stack.pop();
                        return result;
                    }
                } catch (ex) {
                    result = {
                        valid: false,
                        message: 'exception evaluating array in all: ' + i + ' : ' + ex.message,
                        stack: copy(stack),
                        reason: 'exception',
                        data: {
                            exception: ex
                        }
                    };
                }
            }
            stack.pop();
            return result;
        }

        var internalApi = Object.freeze({
            add: addSpec,
            validate: execValidation,
            failure: failure,
            success: success,
            reset: reset,
            keys: keys,
            all: all,
            and: and
        });

        var api = Object.freeze({
            add: addSpec,
            validate: validate,
            failure: failure,
            success: success,
            reset: reset
        });
        return api;
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});