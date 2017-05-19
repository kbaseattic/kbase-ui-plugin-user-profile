define([
    'knockout-plus',
    'kb_service/client/userProfile',
    'kb_common/html'
], function (
    ko,
    UserProfileService,
    html
) {
    'use strict';
    var t = html.tag,
        div = t('div');

    function factory(config) {
        var runtime = config.runtime;
        var container;

        // SUPPORT
        function getProfile(username) {
            var userProfileClient = new UserProfileService(runtime.config('services.user_profile.url'), {
                token: runtime.service('session').getAuthToken()
            });
            return userProfileClient.get_user_profile([username])
                .then(function (profiles) {
                    if (profiles.length === 0) {
                        throw new Error('Profile not found');
                    }
                    return profiles[0];
                });
        }

        // SERVICE API

        function attach(node) {
            container = node;
        }

        function start(params) {
            return getProfile(params.username || runtime.service('session').getUsername())
                .then(function (profile) {
                    container.innerHTML = div({
                        dataBind: {
                            component: {
                                name: '"profile-view"',
                                params: {
                                    runtime: 'runtime',
                                    profile: 'profile'
                                }
                            }
                        }
                    });
                    ko.applyBindings({
                        runtime: runtime,
                        profile: profile
                    }, container);
                })
                .catch(function (err) {
                    console.error('got error', err);
                });
        }

        function stop() {
            return null;
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