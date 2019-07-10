define([
    'knockout',
    'kb_knockout/registry',
    'kb_lib/html'
], function (
    ko,
    reg,
    html
) {
    'use strict';

    class ViewModel {
        constructor({field}) {
            this.title = field.value.title;
            this.workspaceId = field.value.workspaceId;
            this.objectId = field.value.objectId;
        }
    }

    const t = html.tag,
        div = t('div'),
        a = t('a');

    const style = html.makeStyles({
        component: {
            css: {
                overflowX: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
            }
        }
    });

    function template() {
        return div({
            class: style.classes.component
        }, a({
            target: '_blank',
            dataBind: {
                text: 'title',
                attr: {
                    href: '"/narrative/ws." + workspaceId + ".obj." + objectId'
                }
            }
        }));
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template(),
            stylesheet: style.sheet
        };
    }

    return reg.registerComponent(component);
});