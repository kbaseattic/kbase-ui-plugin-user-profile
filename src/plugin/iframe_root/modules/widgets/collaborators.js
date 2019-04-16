define([
    'knockout',
    'kb_lib/html',
    'kb_lib/htmlBuilders',
    'kb_lib/htmlBootstrapBuilders',
    '../components/collaborators/main'
], function (ko, html, build, bootstrapBuilder, CollaboratorsComponent) {
    'use strict';

    const t = html.tag,
        div = t('div');

    class CollaboratorsWidget {
        constructor(params) {
            this.runtime = params.runtime;
            this.hostNode = null;
            this.container = null;
            this.vm = {
                username: null,
                runtime: this.runtime
            };
        }

        // VIEW

        render() {
            let title;
            if (!this.runtime.service('session').isLoggedIn()) {
                return bootstrapBuilder.buildPanel({
                    type: 'default',
                    title: 'Collaborator Network',
                    body: 'Anonymous users don\'t have collaborators'
                });
            }
            if (this.vm.username === this.runtime.service('session').getUsername()) {
                title = 'Your Collaborator Network';
            } else {
                title = 'Your Collaborator Network in common with ' + build.safeText(this.vm.username);
            }
            return bootstrapBuilder.buildPanel({
                type: 'default',
                title: title,
                body: div({
                    dataBind: {
                        component: {
                            name: CollaboratorsComponent.quotedName(),
                            params: {
                                runtime: 'runtime',
                                username: 'username'
                            }
                        }
                    }
                })
            });
        }

        // API

        attach(node) {
            this.hostNode = node;
            this.container = node.appendChild(document.createElement('div'));
        }

        start({ username }) {
            this.vm.username = username || this.runtime.service('session').getUsername();
            this.container.innerHTML = this.render();
            ko.applyBindings(this.vm, this.container);
        }

        stop() {
            // nothing to do.
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return CollaboratorsWidget;
});
