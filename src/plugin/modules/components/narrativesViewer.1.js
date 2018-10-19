define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_lib/html'
], function (
    ko,
    reg,
    gen,
    html
) {
    'use strict';

    const t = html.tag,
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


        // var narrativesToShow = filteredNarratives.filter(function (narrative, index) {
        //     if (index >= pageStart() && index <= pageEnd()) {
        //         return true;
        //     }
        // });


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
            narratives: filteredNarratives,
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

                    th('Access')
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
                td({
                    dataBind: {
                        text: '$index() + $component.pageStart() + 1'
                    }
                }),
                td(a({
                    target: '_blank',
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
                td({
                    dataBind: {
                        text: 'created.date'
                    }
                }),
                td({
                    dataBind: {
                        text: 'lastSaved.date'
                    }
                }),
                td({
                    // dataBind: {
                    //     text: 'owner === $component.currentUsername ? "you" : owner'
                    // }
                }, '?')
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

    return reg.registerComponent(component);

});