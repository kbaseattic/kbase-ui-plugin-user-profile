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
    '../lib/spec'
], function (
    Spec
) {
    'use strict';

    function expect(generator, test) {
        try {
            var result = generator();
            if (!(test(result))) {
                return {
                    pass: false,
                    path: result.stack.join('<br>'),
                    message: result.message
                };
            } else {
                return {
                    pass: true
                };
            }
        } catch (ex) {
            return {
                pass: false,
                path: result.stack.join('<br>'),
                message: ex.message
            };
        }
    }

    function report(expectResult) {
        var status;
        var message;
        if (expectResult.result.pass) {
            status = 'ok';
            message = '';
        } else {
            status = 'fail';
            message = expectResult.result.message;
        }
        return {
            status: status,
            title: expectResult.title,
            path: expectResult.result.path,
            message: message
        };
    }

    function runTests() {
        var spec = Spec.make();

        spec.add({
            id: 'core.username',
            validate: function (value) {
                if (typeof value !== 'string') {
                    return this.failure('not a string');
                }
                if (value.length < 2) {
                    return this.failure('must be at least 2 characters long');
                }
                if (value.length > 100) {
                    return this.failure('may not be more than 100 characters long');
                }
                // startsWithNumber
                if (/^\d/.test(value)) {
                    return this.failure('may not start with a number');
                }
                // contains invalid characters
                if (!(/^[a-zA-Z0-9_]+$/.test(value))) {
                    return this.failure('contains invalid characters: only a-z, A-Z, 0-9, and _ allowed');
                }
                return this.success();
            }
        });
        spec.add({
            id: 'core.realname',
            validate: function (value) {
                if (typeof value !== 'string') {
                    return this.failure('not a string');
                }
                if (value.length < 2) {
                    return this.failure('must be at least 2 characters long');
                }
                if (value.length > 100) {
                    return this.failure('may not be more than 100 characters long');
                }
                return this.success();
            }
        });
        spec.add({
            id: 'core.medstring',
            validate: function (value) {
                if (typeof value !== 'string') {
                    return this.failure('not a string');
                }
                if (value.length < 2) {
                    return this.failure('must be at least 2 characters long');
                }
                if (value.length > 100) {
                    return this.failure('may not be more than 100 characters long');
                }
                return this.success();
            }
        });
        spec.add({
            id: 'core.job-title',
            validate: function (value) {
                if (typeof value !== 'string') {
                    return this.failure('not a string');
                }
                var db = [
                    { 'value': 'CEO', 'label': 'CEO' },
                    { 'value': 'CSO', 'label': 'CSO' },
                    { 'value': 'Scientific Director', 'label': 'Scientific Director' },
                    { 'value': 'Principal Investigator', 'label': 'Principal Investigator' },
                    { 'value': 'Co-investigator', 'label': 'Co-investigator' },
                    { 'value': 'Staff Scientist', 'label': 'Staff Scientist' },
                    { 'value': 'Research Associate', 'label': 'Research Associate' },
                    { 'value': 'Postdoctoral Scientist', 'label': 'Postdoctoral Scientist' },
                    { 'value': 'Graduate Student', 'label': 'Graduate Student' },
                    { 'value': 'Undergraduate Student', 'label': 'Undergraduate Student' },
                    { 'value': 'Assistant Professor', 'label': 'Assistant Professor' },
                    { 'value': 'Associate Professor', 'label': 'Associate Professor' },
                    { 'value': 'Professor', 'label': 'Professor' },
                    { 'value': 'Physician', 'label': 'Physician' },
                    { 'value': 'Other', 'label': 'Other' }
                ];
                var values = db.map(function (item) {
                    return item.value;
                });
                if (values.indexOf(value) < 0) {
                    return this.failure('not in list of job titles');
                }
                return this.success();
            }
        });
        spec.add({
            id: 'key.username',
            validate: function (value) {
                return this.validate(value, 'core.username');
            }
        });
        spec.add({
            id: 'key.realname',
            validate: function (value) {
                return this.validate(value, 'core.realname');
            }
        });
        spec.add({
            id: 'key.organization',
            validate: function (value) {
                return this.validate(value, 'core.medstring');
            }
        });
        spec.add({
            id: 'key.department',
            validate: function (value) {
                return this.validate(value, 'core.medstring');
            }
        });
        spec.add({
            id: 'key.jobTitle',
            validate: function (value) {
                return this.validate(value, 'core.job-title');
            }
        });
        spec.add({
            id: 'key.affiliations',
            validate: function (value) {
                return this.all(value, function (item) {
                    return this.keys(item, [
                        'title',
                        'organization',
                        'started',
                        'ended'
                    ]);
                });
            }
        });
        spec.add({
            id: 'key.city',
            validate: function (value) {
                return this.validate(value, 'core.medstring');
            }
        });
        spec.add({
            id: 'key.zip',
            validate: function (value) {
                return this.validate(value, 'core.medstring');
            }
        });
        spec.add({
            id: 'key.state',
            validate: function (value) {
                return this.validate(value, 'core.medstring');
            }
        });
        spec.add({
            id: 'key.country',
            validate: function (value) {
                return this.validate(value, 'core.medstring');
            }
        });
        spec.add({
            id: 'key.researchInterests',
            validate: function (value) {
                var db = [{
                        'value': 'annotation',
                        'label': 'Genome Annotation'
                    },
                    {
                        'value': 'assembly',
                        'label': 'Genome Assembly'
                    },
                    {
                        'value': 'communities',
                        'label': 'Microbial Communities'
                    },
                    {
                        'value': 'comparative_genomics',
                        'label': 'Comparative Genomics'
                    },
                    {
                        'value': 'expression',
                        'label': 'Expression'
                    },
                    {
                        'value': 'metabolic_modeling',
                        'label': 'Metabolic Modeling'
                    },
                    {
                        'value': 'reads',
                        'label': 'Read Processing'
                    },
                    {
                        'value': 'sequence',
                        'label': 'Sequence Analysis'
                    },
                    {
                        'value': 'util',
                        'label': 'Utilities'
                    }
                ];
                var values = db.map(function (item) {
                    return item.value;
                });
                if (values.indexOf(value) < 0) {
                    return this.failure('not in list of research interests');
                }
                return this.success();
            }
        });
        spec.add({
            id: 'key.primaryFundingSource',
            validate: function (value) {
                return this.success();
            }
        });
        spec.add({
            id: 'key.researchStatement',
            validate: function (value) {
                return this.success();
            }
        });
        spec.add({
            id: 'key.avatarOption',
            validate: function (value) {
                return this.success();
            }
        });
        spec.add({
            id: 'key.gravatarDefault',
            validate: function (value) {
                return this.success();
            }
        });
        spec.add({
            id: 'key.gravatarHash',
            validate: function (value) {
                return this.success();
            }
        });
        spec.add({
            id: 'key.title',
            validate: function (value) {
                return this.success();
            }
        });
        spec.add({
            id: 'key.started',
            validate: function (value) {
                return this.success();
            }
        });
        spec.add({
            id: 'key.ended',
            validate: function (value) {
                return this.success();
            }
        });
        // spec.add({
        //     id: 'logic.and',
        //     validate: function (value) {
        //         if (!(value instanceof Array)) {
        //             return this.failure('not an array');
        //         }
        //         for (var i = 0; i < value.length; i += 1) {
        //             var result = this.validate(value[i].value, value[i].spec);
        //             if (!result.valid) {
        //                 return this.failure('array element invalid : ' + i + ' : ' + result.message);
        //             }
        //         }
        //         return this.success();
        //     }
        // });

        // KEYS
        spec.add({
            id: 'key.user',
            validate: function (value) {
                if (typeof value !== 'object' || value === null) {
                    return this.failure('not a non-null object');
                }
                // old way to do keys
                // var nextValue = [];
                // Object.keys(value).map(function (key) {
                //     return {
                //         spec: 'key.' + key,
                //         value: value[key]
                //     };
                // });
                // return this.validate(nextValue, 'logic.and');

                // shiney new way.
                return this.keys(value, ['username', 'realname']);
            }
        });
        spec.add({
            id: 'key.profile',
            validate: function (value) {
                if (typeof value !== 'object' || value === null) {
                    return this.failure('not a non-null object');
                }
                // now ensure that all properties are present.

                return this.keys(value, ['userdata', 'synced', 'preferences', 'metadata']);
            }
        });
        spec.add({
            id: 'key.userdata',
            validate: function (value) {
                if (typeof value !== 'object' || value === null) {
                    return this.failure('not a non-null object');
                }
                // now ensure that all properties are present.
                return this.keys(value, [
                    'organization',
                    'jobTitle',
                    'city',
                    'state',
                    'zip',
                    'country',
                    'researchInterests',
                ], [
                    'department',
                    'affiliations',
                    'primaryFundingSource',
                    'avatarOption',
                    'gravatarDefault',
                    'researchStatement'
                ]);
            }
        });
        spec.add({
            id: 'key.synced',
            validate: function (value) {
                return this.keys(value, ['gravatarHash']);
            }
        });
        spec.add({
            id: 'key.preferences',
            validate: function (value) {
                return this.success();
            }
        });
        spec.add({
            id: 'key.metadata',
            validate: function (value) {
                return this.success();
            }
        });
        // STRUCTS (anonymous)
        spec.add({
            id: 'struct.userprofile',
            validate: function (value) {
                if (typeof value !== 'object' || value === null) {
                    return this.failure('not a non-null object');
                }
                // , 
                // now ensure that all properties are present.
                // user, userdata, synced, and preferences must be present.
                return this.keys(value, ['user', 'profile']);
            }
        });

        spec.add({
            id: 'core.even-number',
            validate: function (value) {
                if (value % 2 === 0) {
                    return this.success();
                }
                return this.failure('not an even number');
            }
        });

        // example of anonymous specs
        spec.add({
            id: 'struct.test',
            validate: function (value) {
                return this.and([{
                        value: value,
                        spec: 'core.even-number'
                    },
                    // anonymous spec
                    {
                        value: value,
                        spec: function (value) {
                            if (value > 100) {
                                return this.success();
                            } else {
                                return this.failure('must be greater than 100');
                            }
                        }
                    }
                ]);
            }
        });

        function profileTest() {
            spec.reset();
            return report({
                result: expect(function () {
                    return spec.validate({
                        user: {
                            username: 'eapearson',
                            realname: 'Erik Pearson'
                        },
                        profile: {
                            userdata: {
                                jobTitle: 'CEO',
                                organization: 'LBNL',
                                department: 'KBase',
                                affiliations: [{
                                    title: 'Web Developer',
                                    organization: 'LBNL',
                                    started: '2014',
                                    ended: null
                                }],
                                city: 'xx',
                                state: 'xx',
                                zip: 'xx',
                                country: 'xx',
                                researchInterests: 'annotation',
                                primaryFundingSource: 'xx',
                                researchStatement: 'xx',
                                avatarOption: 'xx',
                                gravatarDefault: 'xx'

                            },
                            synced: {
                                gravatarHash: 'xx'
                            },
                            preferences: {},
                            metadata: {}
                        }
                    }, 'struct.userprofile');
                }, function (result) {
                    return result.valid;
                }),
                title: 'A valid profile'
            });
        }


        return [
            report({
                result: expect(function () {
                    return spec.validate(102, 'struct.test');
                }, function (result) {
                    return result.valid;
                }),
                title: 'An even number > 100'
            }),
            report({
                result: expect(function () {
                    return spec.validate(99, 'struct.test');
                }, function (result) {
                    return result.valid;
                }),
                title: 'An even number > 100'
            }),
            report({
                result: expect(function () {
                    return spec.validate(98, 'struct.test');
                }, function (result) {
                    return result.valid;
                }),
                title: 'An even number > 100'
            }),
            report({
                result: expect(function () {
                    return spec.validate('mickey_mouse', 'core.username');
                }, function (result) {
                    return result.valid;
                }),
                title: 'A valid username'
            }),
            report({
                result: expect(function () {
                    return spec.validate('mickey mouse', 'core.username');
                }, function (result) {
                    return !result.valid;
                }),
                title: 'An invalid username'
            }),
            report({
                result: expect(function () {
                    return spec.validate('mickey mouse', 'core.username');
                }, function (result) {
                    return result.valid;
                }),
                title: 'An invalid username'
            }),
            // (function () {
            //     var iters = 10000;
            //     var start = new Date().getTime();
            //     for (var i = 0; i < iters; i += 1) {
            //         expect(function () {
            //             return spec.validate('mickey_mouse', 'core.username');
            //         }, function (result) {
            //             return result.valid;
            //         });
            //     }
            //     var elapsed = new Date().getTime() - start;
            //     return {
            //         status: 'perf',
            //         title: 'Performance for single validation',
            //         message: 'Ops / sec: ' + iters / (elapsed / 1000)
            //     };
            // }()),
            profileTest(),
            (function () {
                var iters = 10000;
                var start = new Date().getTime();
                for (var i = 0; i < iters; i += 1) {
                    profileTest();
                }
                var elapsed = new Date().getTime() - start;
                return {
                    status: 'perf',
                    title: 'Performance for profile validation',
                    message: 'Ops / sec: ' + iters / (elapsed / 1000)
                };
            }())
        ];
    }

    return {
        runTests: runTests
    };
});