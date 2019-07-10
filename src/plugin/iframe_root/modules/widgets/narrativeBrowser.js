define([
    'bluebird',
    'knockout',
    'kb_lib/html',
    'kb_lib/htmlBuilders',
    'kb_lib/jsonRpc/dynamicServiceClient',
    'kb_lib/jsonRpc/genericClient',
    'kb_lib/htmlBootstrapBuilders',
    'kb_common/format',
    'kb_common/utils',
    'kb_service/utils',
    '../components/narrativesViewer'
], function (
    Promise,
    ko,
    html,
    build,
    DSClient,
    ServiceClient,
    BS,
    format,
    Utils,
    serviceUtils,
    NarrativesViewerComponent
) {
    'use strict';

    const t = html.tag,
        div = t('div');

    function factory(config) {
        var runtime = config.runtime;
        var container;
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
                            name: NarrativesViewerComponent.quotedName(),
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
            return narrativeServiceClient
                .callFunc('list_narratives', [
                    {
                        type: 'mine'
                    }
                ])
                .then(function (result) {
                    return enhanceNarratives(result[0].narratives);
                })
                .then(function (narratives) {
                    return addPermissions(narratives);
                });
        }

        function getTheirNarratives(username) {
            return Promise.all([
                narrativeServiceClient
                    .callFunc('list_narratives', [
                        {
                            type: 'shared'
                        }
                    ])
                    .then(function (result) {
                        return enhanceNarratives(result[0].narratives);
                    })
                    .then(function (narratives) {
                        return narratives.filter(function (narrative) {
                            return narrative.owner === username;
                        });
                    }),
                narrativeServiceClient
                    .callFunc('list_narratives', [
                        {
                            type: 'public'
                        }
                    ])
                    .then(function (result) {
                        return enhanceNarratives(result[0].narratives);
                    })
                    .then(function (narratives) {
                        return narratives.filter(function (narrative) {
                            return narrative.owner === username;
                        });
                    })
            ]).spread(function (shared, publicNarratives) {
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
                return workspaceClient
                    .callFunc('get_permissions_mass', [
                        {
                            workspaces: permParams
                        }
                    ])
                    .then(function (result) {
                        var permissions = result[0].perms;
                        for (var i = 0; i < permissions.length; i++) {
                            var narrative = narratives[i];
                            narrative.permissions = Utils.object_to_array(permissions[i], 'username', 'permission')
                                .filter(function (x) {
                                    return !(
                                        x.username === currentUsername ||
                                        x.username === '*' ||
                                        x.username === narrative.workspace.owner
                                    );
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
            return narratives
                .map(function (item) {
                    item.object = serviceUtils.objectInfoToObject(item.nar);
                    item.workspace = serviceUtils.workspaceInfoToObject(item.ws);
                    return item;
                })
                .filter(function (narrative) {
                    return narrative.workspace.metadata.is_temporary !== 'true';
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
            return workspaceClient
                .callFunc('get_object_info3', [
                    {
                        objects: firstVersions,
                        includeMetadata: 1,
                        ignoreErrors: 1
                    }
                ])
                .spread(function (firsts) {
                    firsts.infos.forEach(function (first, index) {
                        var firstNarrative = serviceUtils.objectInfoToObject(first);
                        narratives[index].created = {
                            by: firstNarrative.saved_by,
                            at: firstNarrative.saveDate,
                            date: format.niceTime(firstNarrative.saveDate)
                        };
                    });
                    return narratives;
                });
        }

        // WIDGET SERVICE API

        function attach(node) {
            container = node;
        }

        function start(params) {
            var currentUsername = runtime.service('session').getUsername();
            var query;
            // TODO: move this logic into the component
            if (!params.username || runtime.service('session').getUsername() === params.username) {
                query = getMyNarratives(currentUsername);
                title = 'Your Narratives';
            } else {
                query = getTheirNarratives(params.username, currentUsername);
                title =
                    'Narratives owned by ' +
                    build.safeText(params.username) +
                    ' to which you have access (shared or public)';
            }

            container.innerHTML = div(
                {
                    class: 'well'
                },
                build.loading('Loading narratives...')
            );
            return query
                .then(function (narratives) {
                    // now get the creation date ...
                    if (narratives.length > 0) {
                        return addNarrativeCreation(narratives);
                    } else {
                        return narratives;
                    }
                })
                .then(function (narratives) {
                    render();

                    ko.applyBindings(
                        {
                            narratives: narratives,
                            title: title,
                            username: params.username || runtime.service('session').getUsername(),
                            currentUsername: runtime.service('session').getUsername()
                        },
                        container
                    );
                });
        }

        function stop() {}

        function detach() {}

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
