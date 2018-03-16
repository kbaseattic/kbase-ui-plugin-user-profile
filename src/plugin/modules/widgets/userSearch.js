define([
    'jquery',
    'bluebird',
    './userProfileBase',
    'kb_service/client/userProfile',
    'kb_common/html',
    'kb_common/bootstrapUtils'
], function (
    $,
    Promise,
    SocialWidget,
    UserProfileService,
    html,
    BS
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        a = t('a'),
        form = t('form'),
        label = t('label'),
        input = t('input'),
        table = t('table'),
        tr = t('tr'),
        td = t('td');

    function factory(config) {
        var runtime = config.runtime;
        var container;
        var places = {};
        var searchText;
        var searchResults = [];

        function renderLayout() {
            container.innerHTML = BS.buildPanel({
                type: 'default',
                title: 'Find Other Users',
                body: div({
                    class: 'UserSearch'
                }, [
                    div({
                        dataPlaceholder: 'search'
                    }),
                    form({
                        class: 'form'
                    }, [
                        div({
                            dataField: 'search_text',
                            style: {
                                textAlign: 'center'
                            }
                        }, label({
                            for: 'search_text_field'
                        }, [
                            'Search ',
                            input({
                                type: 'text',
                                id: 'search_text_field',
                                autocomplete: 'off'
                            })
                        ]))
                    ]),
                    div({
                        dataPlaceholder: 'alert'
                    }),
                    div({
                        dataPlaceholder: 'content'
                    })
                ])
            });
            places = {
                alert: container.querySelector('[data-placeholder="alert"]'),
                content: container.querySelector('[data-placeholder="content"]')
            };
        }

        function refresh() {
            if (!searchText || searchText.length < 3) {
                places.alert.innerHTML = 'Please enter 3 or more characters';
                places.content.innerHTML = '';
                return;
            }
            places.alert.innerHTML = 'Found ' + searchResults.length + ' users';
            renderResults();
        }

        function renderResults() {
            if (searchResults.length === 0) {
                places.content.innerHTML = '';
                return;
            }

            places.content.innerHTML = div({
                class: 'search-results'
            }, div({
                class: 'results-wrapper'
            }, div({
                class: 'results-container'
            }, table({
                class: 'results'
            }, searchResults.map(function (result) {
                return tr([
                    td({
                        style: {
                            paddingTop: '6px'
                        }
                    }, [
                        a({
                            href: ['#people', result.username].join('/'),
                            style: {
                                display: 'block'
                            }
                        }, result.realname),
                        div({
                            style: {
                                fontStyle: 'italic'
                            }
                        }, result.username)
                    ])
                ]);
            })))));
        }

        function renderError(err) {
            places.alert.innerHTML = err.message;
        }

        function render() {
            var userProfileClient = new UserProfileService(runtime.config('services.user_profile.url'), {
                token: runtime.service('session').getAuthToken()
            });

            if (searchText && searchText.length < 3) {
                refresh();
            } else {
                userProfileClient.filter_users({
                    filter: searchText
                })
                    .then(function (users) {
                        users.sort(function (a, b) {
                            if (a.realname) {
                                if (b.realname) {
                                    var aName = a.realname.toLowerCase();
                                    var bName = b.realname.toLowerCase();
                                    if (aName < bName) {
                                        return -1;
                                    } else if (aName > bName) {
                                        return 1;
                                    } else {
                                        return 0;
                                    }
                                } else {
                                    return -1;
                                }
                            } else {
                                return 0;
                            }
                        });
                        searchResults = users;
                        refresh();
                    })
                    .catch(function (err) {
                        renderError(err);
                    });
            }
        }

        // SERVICE API

        function attach(node) {
            container = node;
            renderLayout();
        }

        function start() {
            var control = container.querySelector('[data-field="search_text"] input');
            control.addEventListener('keyup', function (e) {
                // Reset on search cancel
                if ((e.key === undefined && e.keyCode === 27) || e.key === 'Esc' || e.key === 'Escape') {
                    control.value = '';
                    searchResults = [];
                } else {
                    searchText = e.target.value;
                }
                render();
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