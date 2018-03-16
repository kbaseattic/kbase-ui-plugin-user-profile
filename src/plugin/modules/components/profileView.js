/*
Profile model:

user
    usernmae (set from auth2 account)
    realname (synced from auth2 account)
userdata
    organization
    department
    jobTitle
    jobTitleOther
    affiliations
        title
        organization
        started
        ended
    city
    state
    zip
    country
    researchInterests
    primaryFundingSource
    researchStatement
    avatarOption
    gravatarDefault
synced
    gravatarHash
preferences

*/
define([
    'knockout-plus',
    'kb_common/html',
    'kb_common/bootstrapUtils',
    'kb_plugin_user-profile'
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
        var researchStatementDisplay = ko.pureComputed(function () {
            var text = userProfile.profile.userdata.researchStatement;
            if (!text) {
                return '';
            }
            return text.replace(/\n/g, '<br>');
        });
        return {
            profile: params.profile,
            gravatarUrl: gravatarUrl,
            researchStatementDisplay: researchStatementDisplay
        };

    }   
    
    function buildAvatarUrl(profile) {
        switch (profile.profile.userdata.avatarOption || 'gravatar') {
        case 'gravatar':
            var gravatarDefault = profile.profile.userdata.gravatarDefault || 'identicon';
            var gravatarHash = profile.profile.synced.gravatarHash;
            if (gravatarHash) {
                return 'https://www.gravatar.com/avatar/' + gravatarHash + '?s=500&amp;r=pg&d=' + gravatarDefault;
            } else {
                return Plugin.plugin.fullPath + '/images/nouserpic.png';
            }
        case 'silhouette':
        case 'mysteryman':
        default:
            return Plugin.plugin.fullPath + '/images/nouserpic.png';
        }
    }

    function buildProfilePanel() {
        return BS.buildPanel({
            type: 'default',
            attributes: {
                dataKBTesthookPanel: 'profile'
            },
            title: span([
                span({
                    dataBind: {
                        text: 'profile.user.realname'
                    }
                }),
                ' (',
                span({
                    dataKBTesthookField: 'username',
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
                    // div([
                    //     'username: ' ,
                    //     span({
                    //         style: {
                    //             fontFamily: 'monospace'
                    //         },
                    //         dataBind: {
                    //             text: 'profile.user.username'
                    //         }
                    //     })
                    // ]),
                   

                    '<!-- ko if: $data.profile.profile.userdata -->',
                    div({
                        style: {
                            fontStyle: 'italic',
                            marginBottom: '1em'
                        }
                    }, [
                        '<!-- ko if: profile.profile.userdata.jobTitle !== "Other" -->',
                        span({
                            dataBind: {
                                text: 'profile.profile.userdata.jobTitle'
                            }
                        }),
                        '<!-- /ko -->',
                        '<!-- ko if: profile.profile.userdata.jobTitle === "Other" -->',
                        span({
                            dataBind: {
                                text: 'profile.profile.userdata.jobTitleOther'
                            }
                        }),
                        '<!-- /ko -->'
                    ]),
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
                    // LOCATION
                    div({
                        dataBind: {
                            if: 'profile.profile.userdata.country === "United States"'
                        }
                    }, [
                        div([
                            span({
                                dataBind: {
                                    text: 'profile.profile.userdata.city'
                                }
                            }),
                            ', ',
                            span({
                                dataBind: {
                                    text: 'profile.profile.userdata.state'
                                }
                            }),
                            span({
                                dataBind: {
                                    text: 'profile.profile.userdata.postalCode'
                                },
                                style: {
                                    marginLeft: '10px'
                                }
                            })
                        ]),
                        div({
                            dataBind: {
                                text: 'profile.profile.userdata.country'
                            }
                        })
                    ]),

                    div({
                        dataBind: {
                            if: 'profile.profile.userdata.country !== "United States"'
                        }
                    }, [
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
                        })
                    ]),
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
                    }, li([
                        span({
                            dataBind: {
                                text: '$data'
                            }
                        }),
                        '<!-- ko if: $data === "Other" -->',
                        span({
                            dataBind: {
                                text: '" - " + ($component.profile.profile.userdata.researchInterestsOther || "")'
                            }
                        }),
                        '<!-- /ko -->'
                    ])),
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
                    ul({
                        dataBind: {
                            visible: 'profile.profile.userdata.affiliations.length > 0',
                            foreach: 'profile.profile.userdata.affiliations'
                        }
                    }, li([
                        p({

                        }, [
                            span({
                                dataBind: {
                                    text: 'title'
                                }
                            }),
                            ' (',
                            span({
                                dataBind: {
                                    text: 'started'
                                }
                            }),
                            ' - ',
                            '<!-- ko if: $data.ended -->',
                            span({
                                dataBind: {
                                    text: 'ended'
                                }
                            }),
                            '<!-- /ko -->',
                            '<!-- ko if: !$data.ended -->',
                            span({

                            }, 'present'),
                            '<!-- /ko -->',
                            ') ',
                            ' @ ',
                            span({
                                dataBind: {
                                    text: 'organization'
                                }
                            })
                        ])
                    ])),
                    '<!-- /ko -->',

                    '<!-- ko if: researchStatementDisplay().length > 0 -->',
                    h3('Research or Personal Statement'),
                    div({
                        dataBind: {
                            visible: 'researchStatementDisplay().length === 0'
                        },
                        style: {
                            fontStyle: 'italic'
                        }
                    }, 'No research statement provided'),
                    div({
                        class: 'well',
                        dataBind: {
                            visible: 'researchStatementDisplay().length > 0',
                            html: 'researchStatementDisplay()'
                        }
                    }),
                    '<!-- /ko -->',
                    '<!-- /ko -->'
                ])
            ])
        });
    }

    function template() {
        return div({
            dataKBTesthookComponent: 'profile-view'
        }, buildProfilePanel());
    }

    function component() {
        return {
            template: template(),
            viewModel: viewModel
        };
    }

    // note that this component is provided as a globally known component: 'profile-view'
    return component;
});