define([
    'bluebird',
    'knockout-plus',
    'kb_common/html',
    'kb_common/jsonRpc/dynamicServiceClient',
    'kb_common/jsonRpc/genericClient',
    'kb_common/bootstrapUtils',
    'kb_common/format',
    'kb_common/utils',
    'kb_service/utils'
], function (
    Promise,
    ko,
    html,
    DSClient,
    ServiceClient,
    BS,
    format,
    Utils,
    serviceUtils
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        a = t('a'),
        span = t('span'),
        input = t('input'),
        button = t('button'),
        label = t('label'),
        select = t('select');

    function viewModel(params) {
        var narratives = ko.observableArray(params.narratives);
        var title = params.title;

        var pageSizeInput = ko.observable('10');
        var pageSize = ko.pureComputed(function () {
            if (pageSizeInput().length === 0) {
                return 10;
            }
            return parseInt(pageSizeInput());
        });

        var total = narratives().length;

        var search = ko.observable();

        search.subscribe(function (newValue) {
            if (newValue.length > 0) {
                pageStart(0);
            }
        });

        // var narrativesToShow = ko.pureComputed(function () {
        //     var result = [];
        //     filtered(false);
        //     if (search() && search().length > 0) {
        //         var searchText = search().toLowerCase(); 


        //     } else {
        //     for (var i = 0; i < narratives().length; i += 1) {
        //         var narrative = narratives()[i];
        //             if (narrative.title.toLowerCase().indexOf(searchText) < 0) {
        //                 filtered(true);
        //                 f = true;
        //                 continue;
        //             }
        //         }
        //         if (f) {
        //             result.push(narrative);
        //         } else {

        //         }
        //         if (narrative.index >= start() && narrative.index <= end()) {
        //             return true;
        //         }
        //         return false;
        //     }
        // });

        var searchText = ko.pureComputed(function () {
            if (!search()) {
                return;
            }
            return search().toLowerCase();
        });

        var sortColumns = ['title', 'saved', 'created'].map(function (value) {
            return {
                label: value,
                value: value
            };
        });
        var sortBy = ko.observable('saved');

        var sortDirections = ['asc', 'desc'].map(function (value) {
            return {
                label: value,
                value: value
            };
        });
        var sortDirection = ko.observable('desc');

        function sortIt() {
            narratives.sort(function (a, b) {
                var comparison;
                switch (sortBy()) {
                case 'title':
                    if (a.title < b.title) {
                        comparison = -1;
                    } else if (a.title > b.title) {
                        comparison = 1;
                    } else {
                        comparison = 0;
                    }
                    break;
                case 'created':
                    if (a.created.at < b.created.at) {
                        comparison = -1;
                    } else if (a.created.at > b.created.at) {
                        comparison = 1;
                    } else {
                        comparison = 0;
                    }
                    break;
                case 'saved':
                default:
                    if (a.lastSaved.at < b.lastSaved.at) {
                        comparison = -1;
                    } else if (a.lastSaved.at > b.lastSaved.at) {
                        comparison = 1;
                    } else {
                        comparison = 0;
                    }
                    break;
                }
                if (sortDirection() === 'desc') {
                    return comparison * -1;
                }
                return comparison;
            });
        }

        sortBy.subscribe(function () {
            sortIt();
        });
        sortDirection.subscribe(function () {
            sortIt();
        });
        sortIt();

        var filteredNarratives = narratives.filter(function (narrative) {
            var text = searchText();
            if (!text || text.length === 0) {
                return true;
            }
            if (narrative.title.toLowerCase().indexOf(text) >= 0) {
                return true;
            }
            return false;
        });

        var len = ko.pureComputed(function () {
            return filteredNarratives().length;
        });

        var pageStart = ko.observable(0);
        var pageEnd = ko.pureComputed(function () {
            return Math.min(pageStart() + pageSize(), len()) - 1;
        });

        var searchSummary = ko.pureComputed(function () {
            if (filteredNarratives().length === total) {
                return '';
            }
            return 'found ' + filteredNarratives().length + ' of ' + total;
        });


        var narrativesToShow = filteredNarratives.filter(function (narrative, index) {
            if (index() >= pageStart() && index() <= pageEnd()) {
                return true;
            }
        });


        // filteredNarratives.subscribe(function (newValue) {
        //     last(newValue.length);
        // });

        var more = ko.pureComputed(function () {
            var left = len() - pageEnd() - 1;
            if (left === 0) {
                return '';
            }
            return 'and ' + left + ' more...';
        });


        function doPrev() {
            if (pageStart() > 0) {
                pageStart(pageStart() - 1);
            }
        }

        function doNext() {
            if (pageStart() + pageSize() < len()) {
                pageStart(pageStart() + 1);
            }
        }

        function doFirst() {
            pageStart(0);
        }

        function doLast() {
            pageStart(Math.max(len() - pageSize(), 0));
        }

        function doPrevPage() {
            if (pageStart() > pageSize()) {
                pageStart(pageStart() - pageSize());
            } else {
                doFirst();
            }
        }


        function doNextPage() {
            if (pageEnd() < len() - pageSize()) {
                pageStart(pageStart() + pageSize());
            } else {
                doLast();
            }
        }

        var pageSizes = [5, 10, 20, 50, 100].map(function (value) {
            return {
                label: String(value),
                value: String(value)
            };
        });

        function sortByCreated() {
            if (sortBy() === 'created') {
                if (sortDirection() === 'asc') {
                    sortDirection('desc');
                } else {
                    sortDirection('asc');
                }
            } else {
                sortBy('created');
                sortDirection('desc');
            }
        }

        function sortByLastSaved() {
            if (sortBy() === 'saved') {
                if (sortDirection() === 'asc') {
                    sortDirection('desc');
                } else {
                    sortDirection('asc');
                }
            } else {
                sortBy('saved');
                sortDirection('desc');
            }
        }

        function sortByTitle() {
            if (sortBy() === 'title') {
                if (sortDirection() === 'asc') {
                    sortDirection('desc');
                } else {
                    sortDirection('asc');
                }
            } else {
                sortBy('title');
                sortDirection('asc');
            }
        }

        function getColor(index) {
            var base = index % 7;
            var color = (9 + base).toString(16);
            return '#' + color + color + color;
        }

        return {
            narratives: narrativesToShow,
            title: title,
            filteredNarratives: filteredNarratives,
            pageStart: pageStart,
            pageEnd: pageEnd,
            len: len,
            total: total,
            doPrev: doPrev,
            doNext: doNext,
            doFirst: doFirst,
            doLast: doLast,
            doPrevPage: doPrevPage,
            doNextPage: doNextPage,
            search: search,
            searchSummary: searchSummary,
            pageSizeInput: pageSizeInput,
            pageSizes: pageSizes,
            sortColumns: sortColumns,
            sortBy: sortBy,
            more: more,
            sortDirections: sortDirections,
            sortDirection: sortDirection,
            sortByCreated: sortByCreated,
            sortByLastSaved: sortByLastSaved,
            sortByTitle: sortByTitle,
            getColor: getColor,
            username: params.username,
            currentUsername: params.currentUsername
        };
    }

    function buildTable() {
        // var headerCellStyle = { display: 'table-cell', fontWeight: 'bold', border: '1px silver solid', padding: '4px' };
        // var cellStyle = { display: 'table-cell', fontWeight: 'normal', border: '1px silver solid', padding: '4px' };
        var table = t('table'),
            colgroup = t('colgroup'),
            col = t('col'),
            thead = t('thead'),
            tbody = t('tbody'),
            tr = t('tr'),
            th = t('th'),
            td = t('td');
        return table({
            class: 'table'
        }, [
            colgroup([
                col({
                    style: {
                        width: '5%'
                    }
                }),
                col({
                    style: {
                        width: '40%'
                    }
                }),
                col({
                    style: {
                        width: '20%'
                    }
                }),
                col({
                    style: {
                        width: '20%'
                    }
                }),
                col({
                    style: {
                        width: '15%'
                    }
                })

            ]),
            thead(
                tr([
                    th('#'),
                    th(span({
                        dataBind: {
                            click: 'sortByTitle',
                            style: {
                                'color': 'sortBy() === "title" ? "green" : "blue"'
                            }
                        },
                        style: {
                            cursor: 'pointer'
                        }
                    }, [
                        'Title ',
                        span({
                            dataBind: {
                                visible: 'sortBy() === "title"',
                                css: {
                                    'fa-chevron-down': 'sortDirection() === "desc"',
                                    'fa-chevron-up': 'sortDirection() === "asc"'
                                }
                            },
                            class: 'fa'
                        })
                    ])),
                    th(span({
                        dataBind: {
                            click: 'sortByCreated',
                            style: {
                                'color': 'sortBy() === "created" ? "green" : "blue"'
                            }
                        },
                        style: {
                            cursor: 'pointer'
                        }
                    }, [
                        'Created ',
                        span({
                            dataBind: {
                                visible: 'sortBy() === "created"',
                                css: {
                                    'fa-chevron-down': 'sortDirection() === "desc"',
                                    'fa-chevron-up': 'sortDirection() === "asc"'
                                }
                            },
                            class: 'fa'
                        })
                    ])),
                    th(span({
                        dataBind: {
                            click: 'sortByLastSaved',
                            style: {
                                'color': 'sortBy() === "saved" ? "green" : "blue"'
                            }
                        },
                        style: {
                            cursor: 'pointer'
                        }
                    }, [
                        'Last saved ',
                        span({
                            dataBind: {
                                visible: 'sortBy() === "saved"',
                                css: {
                                    'fa-chevron-down': 'sortDirection() === "desc"',
                                    'fa-chevron-up': 'sortDirection() === "asc"'
                                }
                            },
                            class: 'fa'
                        })
                    ])),

                    th('Owner')
                ])),
            tbody({
                style: {
                    maxHeight: '500px'
                },
                dataBind: {
                    foreach: 'narratives'
                }
            }, tr({
                // dataBind: {
                //     style: {
                //         'background-color': '$component.getColor($index() + $component.pageStart() + 1)'
                //     }
                // }
            }, [
                // div({ dataBind: { text: 'rowNumber' }}),
                td({ dataBind: { text: '$index() + $component.pageStart() + 1' } }),
                td(a({
                    dataBind: {
                        attr: {
                            href: '"/narrative/ws." + workspace.id + ".obj." + object.id'
                        }
                    }
                }, span({
                    dataBind: {
                        text: 'title'
                    }
                }))),
                td({ dataBind: { text: 'created.date' } }),
                td({ dataBind: { text: 'lastSaved.date' } }),
                td({ dataBind: { text: 'owner === $component.currentUsername ? "you" : owner' } })
            ]))
        ]);
    }

    //  function buildTable() {
    //     var headerCellStyle = { display: 'table-cell', fontWeight: 'bold', border: '1px silver solid', padding: '4px' };
    //     var cellStyle = { display: 'table-cell', fontWeight: 'normal', border: '1px silver solid', padding: '4px' };
    //     return div({
    //         style: {
    //             display: 'table',
    //             width: '100%'
    //         }
    //     }, [
    //         div({ style: { display: 'table-column-group' } }, [
    //             div({ style: { display: 'table-column' } }),
    //             div({ style: { display: 'table-column' } }),
    //             div({ style: { display: 'table-column' } })
    //         ]),
    //         div({ style: { display: 'table-header-group' } },
    //             div({ style: { display: 'table-row' } }, [
    //                 div('#'),
    //                 div('Title'),
    //                 div('Last saved'),
    //                 div('By')
    //             ])),
    //         div({
    //             style: {
    //                 display: 'table-row-group',
    //                 maxHeight: '500px',
    //                 overflowY: 'scroll'
    //             },
    //             dataBind: {
    //                 foreach: 'narratives'
    //             }
    //         }, div({
    //             style: { display: 'table-row' }
    //         }, [
    //             // div({ dataBind: { text: 'rowNumber' }}),
    //             div({ dataBind: { text: '$index() + $component.start() + 1' }}),
    //             div({ dataBind: { text: 'title' }}),
    //             div({ dataBind: { text: 'lastSaved.at' }}),
    //             div({ dataBind: { text: 'lastSaved.by' }})
    //         ]))
    //     ]);
    // }
    // var savedBy = (username === narrative.lastSaved.by ? 'you' : narrative.lastSaved.by);

    function icon(type) {
        return span({
            class: 'fa fa-' + type
        });
    }

    function buildButton(iconClass, func) {
        return button({
            dataBind: {
                click: func
            },
            class: 'btn btn-default'
        }, icon(iconClass));
    }

    function buildControls() {
        return div({
            style: {
                //border: '1px red dashed'
                margin: '0 0 4px 0'
            }
        }, div({ class: 'btn-toolbar' }, [
            div({
                class: 'btn-group form-inline',
                style: {
                    width: '350px'
                }
            }, [
                buildButton('step-backward', 'doFirst'),
                buildButton('backward', 'doPrevPage'),
                buildButton('chevron-left', 'doPrev'),
                buildButton('chevron-right', 'doNext'),
                buildButton('forward', 'doNextPage'),
                buildButton('step-forward', 'doLast'),
                span({
                    style: {
                        // why not work??
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        margin: '6px 0 0 4px'
                    }
                }, [
                    span({
                        dataBind: {
                            text: 'pageStart() + 1'
                        }
                    }),
                    ' to ',
                    span({
                        dataBind: {
                            text: 'pageEnd() + 1'
                        }
                    }),
                    ' of ',
                    span({
                        dataBind: {
                            text: 'len()'
                        },
                        style: {
                            marginRight: '10px',
                            verticalAlign: 'middle'
                        }
                    })
                ])
            ]),
            div({ class: 'btn-group form-inline' }, [
                label({
                    style: {
                        // for bootstrap
                        marginBottom: '0'
                    }
                }, [
                    select({
                        dataBind: {
                            value: 'pageSizeInput',
                            options: 'pageSizes',
                            optionsText: '"label"',
                            optionsValue: '"value"'
                        },
                        class: 'form-control'
                    }),
                    ' rows per page'
                ])
                // label({
                //     style: {
                //         // for bootstrap
                //         margin: '0 0 0 10px'
                //     }
                // }, [
                //     select({
                //         dataBind: {
                //             value: 'sortBy',
                //             options: 'sortColumns',
                //             optionsText: '"label"',
                //             optionsValue: '"value"'
                //         },
                //         class: 'form-control'
                //     }),
                //     select({
                //         dataBind: {
                //             value: 'sortDirection',
                //             options: 'sortDirections',
                //             optionsText: '"label"',
                //             optionsValue: '"value"'
                //         },
                //         class: 'form-control'
                //     })

                // ])
            ]),
            div({ class: 'btn-group form-inline pull-right' }, [
                span({
                    style: {
                        // marginRight: '10px',
                        verticalAlign: 'middle'
                    }
                }, [
                    input({
                        dataBind: {
                            textInput: 'search'
                        },
                        class: 'form-control',
                        style: {
                            verticalAlign: 'middle'
                        },
                        placeholder: 'search'
                    }),
                    span({
                        dataBind: {
                            visible: 'searchSummary && searchSummary().length > 0',
                            text: 'searchSummary'
                        },
                        style: {
                            marginLeft: '10px'
                        }
                    })
                ])
            ])

        ]));
    }

    function buildMore() {
        return div({
            dataBind: {
                visible: 'more().length > 0',
                text: 'more'
            },
            style: {
                textAlign: 'center'
            }
        });
    }

    function template() {
        return div([
            div({
                dataBind: {
                    if: 'len() > 0'
                }
            }, [
                buildControls(),
                buildTable(),
                buildMore()
            ]),
            div({
                dataBind: {
                    if: 'len() === 0'
                }
            }, 'Sorry, no narratives')
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    ko.components.register('narratives-viewer', component());

    function factory(config) {
        var runtime = config.runtime;
        var container;
        var narratives = [];
        var title;

        var narrativeServiceClient = new DSClient({
            url: runtime.config('services.service_wizard.url'),
            module: 'NarrativeService',
            token: runtime.service('session').getAuthToken()
        });

        var workspaceClient = new ServiceClient({
            url: runtime.config('services.workspace.url'),
            module: 'Workspace',
            token: runtime.service('session').getAuthToken()
        });

        // STUFF

        function render() {
            container.innerHTML = BS.buildPanel({
                type: 'default',
                title: title,
                body: div({
                    dataBind: {
                        component: {
                            name: '"narratives-viewer"',
                            params: {
                                narratives: 'narratives',
                                title: 'title',
                                username: 'username',
                                currentUsername: 'currentUsername'
                            }
                        }
                    }
                })
            });
        }

        function getMyNarratives() {
            return narrativeServiceClient.callFunc('list_narratives', [{
                type: 'mine'
            }])
                .then(function (result) {
                    return enhanceNarratives(result[0].narratives);
                })
                .then(function (narratives) {
                    return addPermissions(narratives);
                });
        }

        function getTheirNarratives(username) {
            return Promise.all([
                narrativeServiceClient.callFunc('list_narratives', [{
                    type: 'shared'
                }])
                    .then(function (result) {
                        return enhanceNarratives(result[0].narratives);
                    })
                    .then(function (narratives) {
                        return narratives.filter(function (narrative) {
                            return (
                                narrative.owner === username
                            );
                        });
                    }),
                narrativeServiceClient.callFunc('list_narratives', [{
                    type: 'public'
                }])
                    .then(function (result) {
                        return enhanceNarratives(result[0].narratives);
                    })
                    .then(function (narratives) {
                        return narratives
                            .filter(function (narrative) {
                                return (
                                    narrative.owner === username
                                );
                            });
                    })
            ])
                .spread(function (shared, publicNarratives) {
                    // var total = shared[0].narratives.concat(publicNarratives[0].narratives);
                    var total = shared;
                    var totalMap = {};
                    total.forEach(function (narrative) {
                        totalMap[narrative.object.ref] = narrative;
                    });
                    publicNarratives.forEach(function (narrative) {
                        if (totalMap[narrative.object.ref]) {
                            totalMap[narrative.object.ref].public = true;
                        } else {
                            narrative.public = true;
                            total.push(narrative);
                        }
                    });
                    return total;
                });
        }

        // function getTheirNarrativesIncludingCommonShared(username, currentUsername) {
        //     return Promise.all([
        //         narrativeServiceClient.callFunc('list_narratives', [{
        //             type: 'shared'
        //         }])
        //             .then(function (result) {
        //                 return enhanceNarratives(result[0].narratives);
        //             })
        //             .then(function (narratives) {
        //                 return addPermissions(narratives, currentUsername)
        //                     .filter(function (narrative) {
        //                         return (
        //                             narrative.owner === username ||
        //                             narrative.owner === currentUsername ||
        //                             narrative.permissions.some(function (perm) {
        //                                 perm.username === currentUsername;
        //                             })
        //                         );
        //                     });
        //             }),
        //         narrativeServiceClient.callFunc('list_narratives', [{
        //             type: 'public'
        //         }])
        //             .then(function (result) {
        //                 return enhanceNarratives(result[0].narratives);
        //             })
        //             .then(function (narratives) {
        //                 return addPermissions(narratives, currentUsername)
        //                     .filter(function (narrative) {
        //                         return (
        //                             narrative.owner === username ||
        //                             narrative.owner === currentUsername ||
        //                             narrative.permissions.some(function (perm) {
        //                                 perm.username === currentUsername;
        //                             })
        //                         );
        //                     });
        //             })
        //     ])
        //         .spread(function (shared, publicNarratives) {
        //             // var total = shared[0].narratives.concat(publicNarratives[0].narratives);
        //             var total = shared;
        //             var totalMap = {};
        //             total.forEach(function (narrative) {
        //                 totalMap[narrative.object.ref] = narrative;
        //             });
        //             publicNarratives.forEach(function (narrative) {
        //                 if (totalMap[narrative.object.ref]) {
        //                     totalMap[narrative.object.ref].public = true;
        //                 } else {
        //                     narrative.public = true;
        //                     total.push(narrative);
        //                 }
        //             });
        //             return total;
        //         });
        // }

        function addPermissions(narratives, currentUsername) {
            return Promise.try(function () {
                if (narratives.length === 0) {
                    return [];
                }
                var permParams = narratives.map(function (narrative) {
                    return {
                        id: narrative.workspace.id
                    };
                });
                return workspaceClient.callFunc('get_permissions_mass', [{
                    workspaces: permParams
                }])
                    .then(function (result) {
                        var permissions = result[0].perms;
                        for (var i = 0; i < permissions.length; i++) {
                            var narrative = narratives[i];
                            narrative.permissions = Utils.object_to_array(permissions[i], 'username', 'permission')
                                .filter(function (x) {
                                    return !(x.username === currentUsername ||
                                        x.username === '*' ||
                                        x.username === narrative.workspace.owner);
                                })
                                .sort(function (a, b) {
                                    if (a.username < b.username) {
                                        return -1;
                                    } else if (a.username > b.username) {
                                        return 1;
                                    }
                                    return 0;
                                });
                        }
                        return narratives;
                    });
            });
        }


        function enhanceNarratives(narratives) {
            return narratives.map(function (item) {
                item.object = serviceUtils.objectInfoToObject(item.nar);
                item.workspace = serviceUtils.workspaceInfoToObject(item.ws);
                return item;
            })
                .filter(function (narrative) {
                    return (narrative.workspace.metadata.is_temporary !== 'true');
                })
                .map(function (item, index) {
                    item.title = item.workspace.metadata.narrative_nice_name;
                    item.owner = item.workspace.owner;
                    item.lastSaved = {
                        by: item.object.saved_by,
                        at: item.object.saveDate,
                        date: format.niceTime(item.object.saveDate)
                    };
                    item.lastModified = {
                        at: item.workspace.modDate
                    };
                    // view stuff
                    item.show = false;
                    item.rowNumber = String(index + 1);
                    item.index = index;
                    return item;
                });
        }

        function addNarrativeCreation(narratives) {
            var firstVersions = narratives.map(function (narrative) {
                return {
                    ref: [narrative.workspace.id, narrative.object.id, 1].join('/')
                };
            });

            // var workspace = new Workspace(runtime.config('services.workspace.url', {
            //     token: runtime.service('session').getAuthToken()
            // }));
            return workspaceClient.callFunc('get_object_info3', [{
                objects: firstVersions,
                includeMetadata: 1,
                ignoreErrors: 1
            }])
                .spread(function (firsts) {
                    firsts.infos.forEach(function (first, index) {
                        var firstNarrative = serviceUtils.objectInfoToObject(first);
                        narratives[index].created = {
                            by: firstNarrative.saved_by,
                            at: firstNarrative.saveDate,
                            date: format.niceTime(firstNarrative.saveDate)
                        };
                    });
                });
        }

        // WIDGET SERVICE API

        function attach(node) {
            container = node;
        }

        function start(params) {
            var currentUsername = runtime.service('session').getUsername();
            var query;
            if (!params.username || runtime.service('session').getUsername() === params.username) {
                runtime.send('ui', 'setTitle', 'Your Profile');
                query = getMyNarratives(currentUsername);
                title = 'Your Narratives';
            } else {
                runtime.send('ui', 'setTitle', 'Profile for ' + params.username);
                query = getTheirNarratives(params.username, currentUsername);
                title = 'Narratives owned by ' + params.username + ' which you have access to (shared or public)';
            }

            container.innerHTML = div({
                class: 'well'
            }, html.loading('Loading narratives...'));
            return query.then(function (found) {
                // map the narratives to objects...
                narratives = found;
                // now get the creation date ...
                if (narratives.length > 0) {
                    return addNarrativeCreation(narratives);
                }
            })
                .then(function () {
                    render();

                    ko.applyBindings({
                        narratives: narratives,
                        title: title,
                        username: params.username || runtime.service('session').getUsername(),
                        currentUsername: runtime.service('session').getUsername()
                    }, container);
                });
        }

        function stop() {

        }

        function detach() {

        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});