define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_knockout/lib/viewModelBase',
    'kb_knockout/components/table',
    'kb_lib/html'
], function (
    ko,
    reg,
    gen,
    ViewModelBase,
    table,
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

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);
            this.narratives = ko.observableArray(params.narratives);
            this.title = params.title;
            this.username = params.username;
            this.currentUsername = params.currentUsername;

            this.pageSizeInput = ko.observable('10');

            this.pageSize = ko.pureComputed(() => {
                if (this.pageSizeInput().length === 0) {
                    return 10;
                }
                return parseInt(this.pageSizeInput());
            });

            this.total = this.narratives().length;

            this.search = ko.observable();

            this.subscribe(this.search, (newValue) => {
                if (newValue.length > 0) {
                    this.pageStart(0);
                }
            });

            this.searchText = ko.pureComputed(() => {
                if (!this.search()) {
                    return;
                }
                return this.search().toLowerCase();
            });

            this.sortColumns = ['title', 'saved', 'created'].map((value) => {
                return {
                    label: value,
                    value: value
                };
            });
            this.sortBy = ko.observable('saved');

            this.sortDirections = ['asc', 'desc'].map((value) => {
                return {
                    label: value,
                    value: value
                };
            });
            this.sortDirection = ko.observable('desc');

            this.filteredNarratives = this.narratives.filter((narrative) => {
                const text = this.searchText();
                if (!text || text.length === 0) {
                    return true;
                }
                if (narrative.title.toLowerCase().indexOf(text) >= 0) {
                    return true;
                }
                return false;
            });

            this.len = ko.pureComputed(() => {
                return this.filteredNarratives().length;
            });

            this.pageStart = ko.observable(0);
            this.pageEnd = ko.pureComputed(() => {
                return Math.min(this.pageStart() + this.pageSize(), this.len()) - 1;
            });

            this.searchSummary = ko.pureComputed(() => {
                if (this.filteredNarratives().length === this.total) {
                    return '';
                }
                return 'found ' + this.filteredNarratives().length + ' of ' + this.total;
            });

            this.more = ko.pureComputed(() => {
                var left = this.len() - this.pageEnd() - 1;
                if (left === 0) {
                    return '';
                }
                return 'and ' + left + ' more...';
            });

            this.pageSizes = [5, 10, 20, 50, 100].map((value) => {
                return {
                    label: String(value),
                    value: String(value)
                };
            });

            // SUBS

            this.subscribe(this.sortBy, () => {
                this.sortIt();
            });

            this.subscribe(this.sortDirection, () => {
                this.sortIt();
            });

            this.sortIt();
        }

        sortIt() {
            this.narratives.sort((a, b) => {
                var comparison;
                switch (this.sortBy()) {
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
                if (this.sortDirection() === 'desc') {
                    return comparison * -1;
                }
                return comparison;
            });
        }


        // var narrativesToShow = filteredNarratives.filter(function (narrative, index) {
        //     if (index >= pageStart() && index <= pageEnd()) {
        //         return true;
        //     }
        // });


        // filteredNarratives.subscribe(function (newValue) {
        //     last(newValue.length);
        // });


        doPrev() {
            if (this.pageStart() > 0) {
                this.pageStart(this.pageStart() - 1);
            }
        }

        doNext() {
            if (this.pageStart() + this.pageSize() < this.len()) {
                this.pageStart(this.pageStart() + 1);
            }
        }

        doFirst() {
            this.pageStart(0);
        }

        doLast() {
            this.pageStart(Math.max(this.len() - this.pageSize(), 0));
        }

        doPrevPage() {
            if (this.pageStart() > this.pageSize()) {
                this.pageStart(this.pageStart() - this.pageSize());
            } else {
                this.doFirst();
            }
        }


        doNextPage() {
            if (this.pageEnd() < this.len() - this.pageSize()) {
                this.pageStart(this.pageStart() + this.pageSize());
            } else {
                this.doLast();
            }
        }

        sortByCreated() {
            if (this.sortBy() === 'created') {
                if (this.sortDirection() === 'asc') {
                    this.sortDirection('desc');
                } else {
                    this.sortDirection('asc');
                }
            } else {
                this.sortBy('created');
                this.sortDirection('desc');
            }
        }

        sortByLastSaved() {
            if (this.sortBy() === 'saved') {
                if (this.sortDirection() === 'asc') {
                    this.sortDirection('desc');
                } else {
                    this.sortDirection('asc');
                }
            } else {
                this.sortBy('saved');
                this.sortDirection('desc');
            }
        }

        sortByTitle() {
            if (this.sortBy() === 'title') {
                if (this.sortDirection() === 'asc') {
                    this.sortDirection('desc');
                } else {
                    this.sortDirection('asc');
                }
            } else {
                this.sortBy('title');
                this.sortDirection('asc');
            }
        }

        getColor(index) {
            var base = index % 7;
            var color = (9 + base).toString(16);
            return '#' + color + color + color;
        }

        // return {
        //     narratives: filteredNarratives,
        //     title: title,
        //     filteredNarratives: filteredNarratives,
        //     pageStart: pageStart,
        //     pageEnd: pageEnd,
        //     len: len,
        //     total: total,
        //     doPrev: doPrev,
        //     doNext: doNext,
        //     doFirst: doFirst,
        //     doLast: doLast,
        //     doPrevPage: doPrevPage,
        //     doNextPage: doNextPage,
        //     search: search,
        //     searchSummary: searchSummary,
        //     pageSizeInput: pageSizeInput,
        //     pageSizes: pageSizes,
        //     sortColumns: sortColumns,
        //     sortBy: sortBy,
        //     more: more,
        //     sortDirections: sortDirections,
        //     sortDirection: sortDirection,
        //     sortByCreated: sortByCreated,
        //     sortByLastSaved: sortByLastSaved,
        //     sortByTitle: sortByTitle,
        //     getColor: getColor,
        //     username: params.username,
        //     currentUsername: params.currentUsername
        // };
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
                    foreach: 'filteredNarratives'
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
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);

});