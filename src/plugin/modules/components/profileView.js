define([
    'knockout-plus',
    'kb_common/html',
    'kb_common/bootstrapUtils',
    'kb_plugin_auth2-client'
], function (
    ko,
    html,
    BS,
    Plugin
) {
    'use strict';
    var t = html.tag,
        div = t('div'),
        span = t('span'),
        p = t('p'),
        img = t('img'),
        h3 = t('h3'),
        ul = t('ul'),
        li = t('li');

    function template() {
        return BS.buildPanel({
            type: 'default',
            title: span([
                span({
                    dataBind: {
                        text: 'profile.user.realname'
                    }
                }),
                ' (',
                span({
                    dataBind: {
                        text: 'profile.user.username'
                    }
                }),
                ')'
            ]),
            body: div({
                class: 'row'
            }, [
                div({
                    class: 'col-md-3'
                }, img({
                    style: {
                        width: '100%'
                    },
                    dataBind: {
                        attr: {
                            src: 'gravatarUrl()'
                        }
                    }
                })),
                div({
                    class: 'col-md-9'
                }, [
                    div({
                        style: {
                            fontWeight: 'bold',
                            fontSize: '120%'
                        },
                        dataBind: {
                            text: 'profile.user.realname'
                        }
                    }),

                    '<!-- ko if: $data.profile.profile.userdata -->',
                    div({
                        style: {
                            fontStyle: 'italic',
                            marginBottom: '1em'
                        },
                        dataBind: {
                            text: 'profile.profile.userdata.jobTitle'
                        }
                    }),
                    div({
                        dataBind: {
                            text: 'profile.profile.userdata.organization'
                        }
                    }),
                    div({
                        dataBind: {
                            text: 'profile.profile.userdata.department'
                        }
                    }),
                    div({
                        dataBind: {
                            text: 'profile.profile.userdata.city'
                        }
                    }),
                    div({
                        dataBind: {
                            text: 'profile.profile.userdata.state'
                        }
                    }),
                    div({
                        dataBind: {
                            text: 'profile.profile.userdata.postalCode'
                        }
                    }),
                    div({
                        dataBind: {
                            text: 'profile.profile.userdata.country'
                        }
                    }),

                    '<!-- ko if: $data.profile.profile.userdata.researchInterests &&  profile.profile.userdata.researchInterests.length > 0 -->',
                    h3('Research Interests'),
                    div({
                        dataBind: {
                            visible: 'profile.profile.userdata.researchInterests.length === 0'
                        },
                        style: {
                            fontStyle: 'italic'
                        }
                    }, 'No research interests selected'),
                    ul({
                        dataBind: {
                            foreach: 'profile.profile.userdata.researchInterests'
                        }
                    }, li({
                        dataBind: {
                            text: '$data'
                        }
                    })),
                    '<!-- /ko -->',

                    '<!-- ko if: $data.profile.profile.userdata.fundingSource &&  profile.profile.userdata.fundingSource.length > 0 -->',
                    div({
                        dataBind: {
                            if: 'profile.profile.userdata.fundingSource'
                        }
                    }, [
                        h3('Primary Funding Source'),
                        div({
                            dataBind: {
                                text: 'profile.profile.userdata.fundingSource'
                            }
                        })
                    ]),
                    '<!-- /ko -->',

                    '<!-- ko if: $data.profile.profile.userdata.affiliations &&  profile.profile.userdata.affiliations.length > 0 -->',
                    h3('Affiliations'),
                    div({
                        dataBind: {
                            visible: 'profile.profile.userdata.affiliations.length === 0'
                        },
                        style: {
                            fontStyle: 'italic'
                        }
                    }, 'No affiliations provided'),
                    div({
                        dataBind: {
                            visible: 'profile.profile.userdata.affiliations.length > 0',
                            foreach: 'profile.profile.userdata.affiliations'
                        }
                    }, div([
                        p({
                            style: {
                                fontWeight: 'bold'
                            }
                        }, [
                            span({
                                dataBind: {
                                    text: 'title'
                                }
                            }),
                            ' (',
                            span({
                                dataBind: {
                                    text: 'start_year'
                                }
                            }),
                            ' - ',
                            '<!-- ko if: $data.end_year -->',
                            span({
                                dataBind: {
                                    text: 'end_year'
                                }
                            }),
                            '<!-- /ko -->',
                            '<!-- ko if: !$data.end_year -->',
                            span({

                            }, 'present'),
                            '<!-- /ko -->',
                            ') ',
                            ' @ ',
                            span({
                                dataBind: {
                                    text: 'institution'
                                }
                            })
                        ])
                    ])),
                    '<!-- /ko -->',

                    '<!-- ko if: personalStatementDisplay().length > 0 -->',
                    h3('Research or Personal Statement'),
                    div({
                        dataBind: {
                            visible: 'personalStatementDisplay().length === 0'
                        },
                        style: {
                            fontStyle: 'italic'
                        }
                    }, 'No research statement provided'),
                    div({
                        class: 'well',
                        dataBind: {
                            visible: 'personalStatementDisplay().length > 0',
                            html: 'personalStatementDisplay()'
                        }
                    }),
                    '<!-- /ko -->',
                    '<!-- /ko -->'
                ])
            ])
        });
    }

    function buildAvatarUrl(profile) {
        switch (profile.profile.userdata.avatarOption || 'silhouette') {
        case 'gravatar':
            var gravatarDefault = profile.profile.userdata.gravatarDefault || 'identicon';
            var gravatarHash = profile.profile.synced.gravatarHash;
            if (gravatarHash) {
                return 'https://www.gravatar.com/avatar/' + gravatarHash + '?s=32&amp;r=pg&d=' + gravatarDefault;
            } else {
                return Plugin.plugin.fullPath + '/images/nouserpic.png';
            }
        case 'silhouette':
        case 'mysteryman':
        default:
            return Plugin.plugin.fullPath + '/images/nouserpic.png';
        }
    }

    /*
        incoming params is a raw user profile. We turn that into a view model
    */
    function viewModel(params) {
        // just a parasitic widget... var gravatarUrl = ko.pureComputed(function () {
        var userProfile = params.profile;
        if (!userProfile.profile) {
            userProfile.profile = {
                userdata: {}
            };
        } else if (!userProfile.profile.userdata) {
            userProfile.profile.userdata = {};
        }
        var gravatarUrl = ko.pureComputed(function () {
            return buildAvatarUrl(userProfile);
        });
        var personalStatementDisplay = ko.pureComputed(function () {
            var text = userProfile.profile.userdata.personalStatement;
            if (!text) {
                return '';
            }
            return text.replace(/\n/g, '<br>');
        });
        return {
            profile: params.profile,
            gravatarUrl: gravatarUrl,
            personalStatementDisplay: personalStatementDisplay
        };

    }

    function component() {
        return {
            template: template(),
            viewModel: viewModel
        };
    }
    ko.components.register('profile-view', component());
});