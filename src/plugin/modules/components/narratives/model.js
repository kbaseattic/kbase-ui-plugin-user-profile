define([
    'bluebird',
    'kb_lib/workspaceUtils',
    'kb_lib/props',
    'kb_lib/lang'
], function (
    Promise,
    workspaceUtils,
    props,
    lang
) {
    'use strict';

    class NarrativesModel {
        constructor({runtime}) {
            this.runtime = runtime;
        }

        getNarratives(username, currentUsername) {
            if (!username || username === currentUsername) {
                return this.getMyNarratives();
            } else {
                return this.getTheirNarratives(username);
            }
        }

        getMyNarratives() {
            const narrativeService = this.runtime.service('rpc').makeClient({
                module: 'NarrativeService'
            });
            return narrativeService.callFunc('list_narratives', [{
                type: 'mine'
            }])
                .then((result) => {
                    const narratives = this.enhanceNarratives(result[0].narratives);
                    return Promise.all([
                        this.addPermissions(narratives),
                        this.addNarrativeCreation(narratives)
                    ])
                        .then(() => {
                            return narratives;
                        });
                });
        }

        getTheirNarratives(username) {
            const narrativeService = this.runtime.service('rpc').makeClient({
                module: 'NarrativeService'
            });
            // todo: coalesce these into two calls to get narratives, combine them
            // ensure uniquess, then enhance them.
            return Promise.all([
                narrativeService.callFunc('list_narratives', [{
                    type: 'shared'
                }])
                    .then((result) => {
                        const narratives = this.enhanceNarratives(result[0].narratives)
                            .filter((narrative) => {
                                return (
                                    narrative.owner === username
                                );
                            });
                        return Promise.all([
                            this.addPermissions(narratives),
                            this.addNarrativeCreation(narratives)
                        ])
                            .then(() => {
                                return narratives;
                            });
                    }),
                narrativeService.callFunc('list_narratives', [{
                    type: 'public'
                }])
                    .then((result) => {
                        const narratives = this.enhanceNarratives(result[0].narratives)
                            .filter((narrative) => {
                                return (
                                    narrative.owner === username
                                );
                            });
                        return Promise.all([
                            this.addPermissions(narratives),
                            this.addNarrativeCreation(narratives)
                        ])
                            .then(() => {
                                return narratives;
                            });
                    })
            ])
                .spread((shared, publicNarratives) => {
                    // var total = shared[0].narratives.concat(publicNarratives[0].narratives);
                    const total = shared;
                    const totalMap = {};
                    total.forEach((narrative) => {
                        totalMap[narrative.object.ref] = narrative;
                    });
                    publicNarratives.forEach((narrative) => {
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

        addPermissions(narratives, currentUsername) {
            const workspaceClient = this.runtime.service('rpc').makeClient({
                module: 'Workspace'
            });
            return Promise.try(() => {
                if (narratives.length === 0) {
                    return [];
                }
                const permParams = narratives.map((narrative) => {
                    return {
                        id: narrative.workspace.id
                    };
                });
                return workspaceClient.callFunc('get_permissions_mass', [{
                    workspaces: permParams
                }])
                    .then((result) => {
                        const permissions = result[0].perms;
                        for (let i = 0; i < permissions.length; i++) {
                            const narrative = narratives[i];
                            narrative.permissions = lang.objectToArray(permissions[i], 'username', 'permission')
                                .filter((x) => {
                                    return !(x.username === currentUsername ||
                                        x.username === '*' ||
                                        x.username === narrative.workspace.owner);
                                })
                                .sort((a, b) => {
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

        enhanceNarratives(narratives) {
            return narratives.map((item) => {
                item.object = workspaceUtils.objectInfoToObject(item.nar);
                item.workspace = workspaceUtils.workspaceInfoToObject(item.ws);
                return item;
            })
                .filter((narrative) => {
                    return (narrative.workspace.metadata.is_temporary !== 'true');
                })
                .map((item, index) => {
                    item.title = item.workspace.metadata.narrative_nice_name;
                    item.owner = item.workspace.owner;
                    item.lastSaved = {
                        by: item.object.saved_by,
                        at: item.object.saveDate
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

        addNarrativeCreation(narratives) {
            var firstVersions = narratives.map((narrative) => {
                return {
                    ref: [narrative.workspace.id, narrative.object.id, 1].join('/')
                };
            });

            const workspace = this.runtime.service('rpc').makeClient({
                module: 'Workspace'
            });
            return workspace.callFunc('get_object_info3', [{
                objects: firstVersions,
                includeMetadata: 1,
                ignoreErrors: 1
            }])
                .spread((firsts) => {
                    firsts.infos.forEach((first, index) => {
                        const firstNarrative = workspaceUtils.objectInfoToObject(first);
                        narratives[index].created = {
                            by: firstNarrative.saved_by,
                            at: firstNarrative.saveDate
                        };
                    });
                    return narratives;
                });
        }


    }

    return NarrativesModel;
});