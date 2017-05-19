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
                    })
                ])
            ])
        });
    }

    /*
        incoming params is a raw user profile. We turn that into a view model
    */
    function viewModel(params) {
        // just a parasitic widget... var gravatarUrl = ko.pureComputed(function () {
        var userProfile = params.profile;
        var gravatarUrl = ko.pureComputed(function () {
            switch (userProfile.profile.userdata.avatarOption) {
            case 'gravatar':
                return 'https://www.gravatar.com/avatar/' + userProfile.profile.synced.gravatarHash + '?s=200&amp;r=pg&d=' + userProfile.profile.userdata.gravatarDefault;
            case 'mysteryman':
                return Plugin.plugin.fullPath + '/images/nouserpic.png';
            }

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