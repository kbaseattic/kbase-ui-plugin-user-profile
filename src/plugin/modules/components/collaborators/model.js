define([
    'bluebird',
    'kb_lib/workspaceUtils',
    'kb_lib/props'
], function (
    Promise,
    workspaceUtils,
    props
) {
    'use strict';

    class CollaboratorsModel {
        constructor({ runtime }) {
            this.runtime = runtime;
        }

        // MODEL

        getPermissions(narratives) {
            return Promise.try(() => {
                if (narratives.length === 0) {
                    return [];
                }
                const permParam = narratives.map((narrative) => {
                    return {
                        id: narrative.workspace.id
                    };
                });
                const currentUsername = this.runtime.service('session').getUsername();
                const workspaceClient = this.runtime.service('rpc').makeClient({
                    module: 'Workspace'
                });
                return workspaceClient.callFunc('get_permissions_mass', [{
                    workspaces: permParam
                }])
                    .spread(({ perms }) => {
                        perms.forEach((perm, index) => {
                            const narrative = narratives[index];
                            narrative.permissions = Object.entries(perm)
                            // filter out current user, the public user *, and the
                            // current narrative owner ()
                            // TODO: hmm, I think we may not need to do this...
                                .filter(([username,]) => {
                                    return !(username === currentUsername ||
                                            username === '*' ||
                                            username === narrative.workspace.owner);
                                });
                        });
                        return narratives;
                    });
            });
        }

        /*
                        Given the current authorized user, and a subject user that this user is inspecting,
                        provide a list of all users who share narratives in common with these two users.
                        We do this by fetching all narratives the current user can access, filtering to ensure
                        the subject user also has access (owns or is shared with), and then extracting all of
                        the users who either own the narratives or with whom they are shared. We also count
                        the number of narratives each user owns or is shared with to provide a collaboration
                        measure of strength.
                        */
        getCollaborators(commonUsers) {
            const narrativeClient = this.runtime.service('rpc').makeClient({
                module: 'NarrativeService'
            });
            const userProfileClient = this.runtime.service('rpc').makeClient({
                module: 'UserProfile'
            });
            return Promise.all([
                narrativeClient.callFunc('list_narratives', [{ type: 'mine' }]),
                narrativeClient.callFunc('list_narratives', [{ type: 'shared' }])
            ])
                .then((results) => {
                    return results
                        .reduce((accum, result) => {
                            return accum.concat(result[0].narratives);
                        }, [])
                        .map((narrative) => {
                            narrative.object = workspaceUtils.objectInfoToObject(narrative.nar);
                            narrative.workspace = workspaceUtils.workspaceInfoToObject(narrative.ws);
                            return narrative;
                        });
                })
                .then((narratives) => {
                    return this.getPermissions(narratives);
                })
                .then((narratives) => {
                    const users = {};

                    narratives.forEach((narrative) => {
                        // make sure all the list of common users (the set of users
                        // we are interesting in common collaboration with),
                        // intersect with either the owner or the set of shared users.
                        if (commonUsers.some((user) => {
                            return !(
                                narrative.workspace.owner === user ||
                                    narrative.permissions.some(([username,]) => {
                                        return username === user;
                                    })
                            );
                        })) {
                            return;
                        }

                        // Remove participants and the public user.
                        var filtered = narrative.permissions.filter(([username,]) => {
                            return !(
                                commonUsers.includes(username) ||
                                    username === '*'
                            );
                        });

                        // And what is left are all the users who are collaborating on this same narrative.
                        // okay, now we have a list of all OTHER people sharing in this narrative.
                        // All of these folks are common collaborators.

                        filtered.forEach(([username,]) => {
                            props.incrProp(users, username);
                        });
                    });

                    const usersToFetch = Object.keys(users);
                    const collaborators = Object.entries(users).reduce((collaborators, [username, count]) => {
                        collaborators[username] = {
                            count: count,
                            username: username
                        };
                        return collaborators;
                    }, {});
                    return [collaborators, usersToFetch, userProfileClient.callFunc('get_user_profile', [usersToFetch])];
                })
                .spread((collaborators, usersToFetch, [userProfiles]) => {
                    userProfiles.forEach((userProfile, index) => {
                        const username = usersToFetch[index];
                        const collaborator = collaborators[username];
                        if (!userProfile || !userProfile.user) {
                            console.warn('WARNING: user ' + username + ' is a sharing partner but has no profile.');
                            collaborator.realname = username;
                        } else {
                            collaborator.realname = userProfile.user.realname;
                        }
                    });

                    return Object.values(collaborators);
                });
        }
    }

    return CollaboratorsModel;
});