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
    '../userLink',
    '../userRealnameLink',
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
    UserLinkComponent,
    UserRealnameLinkComponent,
    Model
) {
    const t = html.tag,
        div = t('div');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.username = params.username;

            this.collaborators = null;

            this.model = new Model({runtime: params.runtime});
            this.ready = ko.observable(false);

            this.messages = {
                none: 'no active search',
                notfound: 'sorry, not found',
                loading: 'loading...',
                error: 'error!'
            };

            this.model.getCollaborators([this.username])
                .then((collaborators) => {
                    this.collaborators = collaborators;
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
                        name: 'realname',
                        label: 'Name',
                        // type: 'string',
                        component: UserRealnameLinkComponent.name(),
                        width: 4,
                        sort: {
                            comparator: (a, b) => {
                                return a.realname.localeCompare(b.realname);
                            }
                        }
                    }),
                    new Column({
                        name: 'username',
                        label: 'Username',
                        component: UserLinkComponent.name(),
                        width: 2,
                        sort: {
                            comparator: (a, b) => {
                                return a.username.localeCompare(b.username);
                            }
                        }
                    }),
                    new Column({
                        name: 'inCommon',
                        label: 'In Common',
                        type: 'number',
                        format: '0,0',
                        width: 2,
                        sort: true
                    })
                ],
                rows: this.collaborators.map((user) => {
                    return new Row({
                        data: {
                            realname: {
                                realname: user.realname,
                                username: user.username
                            },
                            username: {
                                realname: user.realname,
                                username: user.username
                            },
                            inCommon: user.count
                        }
                    });
                }),
                terms: {
                    rowSynonym: ['collaborator', 'collaborators']
                },
                sort: {
                    column: 'inCommon',
                    direction: 'desc'
                }
            });
        }
    }

    function buildTable() {
        return div({
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
            buildTable(),
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