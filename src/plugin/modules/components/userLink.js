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
            this.username = field.value.username;
            this.realname = field.value.realname;
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
                text: 'username',
                attr: {
                    href: '"/#people/" + username'
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