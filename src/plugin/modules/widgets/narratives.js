define([
    'knockout',
    'kb_lib/html',
    'kb_lib/htmlBuilders',
    'kb_lib/htmlBootstrapBuilders',
    '../components/narratives/main'
], function (
    ko,
    html,
    build,
    bootstrapBuilder,
    NarrativesComponent
) {
    'use strict';

    const t = html.tag,
        div = t('div');

    class NarrativesWidget {
        constructor({runtime}) {
            this.runtime = runtime;
            this.hostNode = null;
            this.container = null;
            this.vm = {
                providedUsername: null,
                currentUsername: null,
                runtime: this.runtime
            };
        }

        // VIEW

        render() {
            let title;
            if (!this.vm.providedUsername || this.vm.providedUsername === this.vm.currentUsername) {
                title = 'Your Narratives';
            } else {
                title = 'Narratives owned by ' +
                        build.safeText(this.vm.providedUsername) +
                        ' to which you have access (shared or public)';
            }
            return bootstrapBuilder.buildPanel({
                type: 'default',
                title: title,
                body:  div({
                    dataBind: {
                        component: {
                            name: NarrativesComponent.quotedName(),
                            params: {
                                runtime: 'runtime',
                                username: 'providedUsername',
                                currentUsername: 'currentUsername'
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

        start({username}) {
            this.vm.providedUsername = username;
            this.vm.currentUsername = this.runtime.service('session').getUsername();

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

    return NarrativesWidget;
});