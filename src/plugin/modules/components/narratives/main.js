/*eslint {"strict": ["error", "global"]} */
'use strict';
define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_knockout/lib/viewModelBase',
    '../table/main',
    '../table/types',
    'kb_lib/html',
    'kb_lib/htmlBuilders',
    '../narrativeLink',
    './model'
], function (
    ko,
    reg,
    gen,
    ViewModelBase,
    TableComponent,
    {Table, Column, Row},
    html,
    build,
    NarrativeLinkComponent,
    Model
) {
    const t = html.tag,
        div = t('div');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            // this.title = params.title;
            this.runtime = params.runtime;
            this.username = params.username;
            this.currentUsername = params.currentUsername;
            this.ready = ko.observable(false);

            this.model = new Model({runtime: this.runtime});

            this.model.getNarratives(this.username, this.currentUsername)
                .then((narratives) => {
                    this.narratives = narratives;
                    this.populateTable();
                    this.ready(true);
                })
                .catch((err) => {
                    console.error('ERROR', err);
                });
        }

        populateTable() {
            this.table = new Table({
                columns: [
                    new Column({
                        name: 'title',
                        label: 'Title',
                        // type: 'string',
                        component: NarrativeLinkComponent.name(),
                        width: 4,
                        sort: {
                            comparator: (a, b) => {
                                return a.title.localeCompare(b.title);
                            }
                        }
                    }),
                    new Column({
                        name: 'createdAt',
                        label: 'Created',
                        type: 'date',
                        format: 'MMM DD, YYYY @ hh:mm a',
                        width: 2,
                        sort: true
                    }),
                    new Column({
                        name: 'lastSavedAt',
                        label: 'Last saved',
                        type: 'date',
                        format: 'MMM DD, YYYY @ hh:mm a',
                        width: 2,
                        sort: true
                    }),
                    // new Column({
                    //     name: 'access',
                    //     label: 'Access',
                    //     width: 1
                    // })
                ],
                rows: this.narratives.map((narrative) => {
                    return new Row({
                        data: {
                            title: {
                                title: narrative.title,
                                workspaceId: narrative.workspace.id,
                                objectId: narrative.object.id
                            },
                            createdAt:  narrative.created.at,
                            lastSavedAt: narrative.lastSaved.at,
                            access: 'todo'
                        }
                    });
                }),
                terms: {
                    rowSynonym: ['narrative', 'narratives']
                }
            });

            this.messages = {
                none: 'no active search',
                notfound: 'sorry, not found',
                loading: 'loading...',
                error: 'error!'
            };
        }
    }

    function buildNarrativesTable() {
        return div({
            style: {
                // height: '30em',
                // display: 'flex',
                // flexDirection: 'column'
            },
            dataBind: {
                component: {
                    name: TableComponent.quotedName(),
                    params: {
                        link: 'bus',
                        table: 'table',
                        messages: 'messages'
                    }
                }
            }
        });
    }

    function buildLoading() {
        return build.loading();
    }

    function template() {
        return div(gen.if('ready',
            buildNarrativesTable(),
            buildLoading()));
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});