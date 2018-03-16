define([
    'kb_common/html'
], function (
    html
) {
    function ViewModel(config) {
        var vm = config.model;
        if (!vm) {
            throw new Error('The vm must be supplied in the "model" property');
        }

        // The vm should be a simple object ...

        // TODO: recursively...
        function assignIds(model) {
            Object.keys(model).forEach(function (nodeName) {
                var node = model[nodeName];
                if (!node.id) {
                    node.id = html.genId();
                }
                if (node.model) {
                    assignIds(node.model);
                }
            });
        }
        assignIds(vm);

        function get(path) {
            var l = path.split('.');

            function getPath(vm, p) {
                var vmNode = vm[p[0]];
                if (vmNode) {
                    if (p.length > 1) {
                        if (vmNode.model) {
                            return getPath(vmNode.model, p.slice(1));
                        } else {
                            throw new Error('Path does not exist: ' + p.join('.'));
                        }
                    } else {
                        return vmNode;
                    }
                }
            }
            return getPath(vm, l);
        }

        function getElement(containerOrPath, names) {
            var container;
            if (typeof containerOrPath === 'string') {
                container = get(containerOrPath).node;
            } else {
                container = containerOrPath;
            }
            if (!container) {
                console.error('ERROR', containerOrPath, container);
                throw new Error('Could not get vm node: ' + containerOrPath);
            }
            if (typeof names === 'string') {
                names = names.split('.');
            }
            if (names.length === 0) {
                return container;
            }
            var selector = names.map(function (name) {
                return '[data-element="' + name + '"]';
            }).join(' ');

            var node = container.querySelector(selector);

            return node;
        }

        function bindVmNode(vmNode) {
            if (!vmNode.disabled &&
                (vmNode.node === null || vmNode.node === undefined) &&
                vmNode.id) {
                var node = document.getElementById(vmNode.id);
                if (node === null) {
                    // throw new Error('bind failed, node not found with id: ' + vmNode.id);
                    return;
                }
                vmNode.node = node;

                // bind any events now.
                if (vmNode.on) {
                    Object.keys(vmNode.on).forEach(function (eventType) {
                        var handler = vmNode.on[eventType];
                        handler.bind(vmNode);
                        vmNode.node.addEventListener(eventType, function () {
                            try {
                                handler();
                            } catch (ex) {
                                console.error('Error in event handler for ' + eventType, ex);
                            }
                        });
                    });
                }
            }
        }

        function bindAll() {
            function bindModel(model) {
                Object.keys(model).forEach(function (key) {
                    bindVmNode(model[key]);
                    if (model[key].model) {
                        bindModel(model[key].model);
                    }
                });
            }
            bindModel(vm);
        }

        function setHTML(vmPath, content) {
            var vmNode = get(vmPath);
            if (!vmNode) {
                return;
            }
            if (!vmNode.node) {
                return;
            }
            // var domNode = getElement(vmNode.node, elementPath);
            // if (!domNode) {
            //     return;
            // }
            vmNode.node.innerHTML = content;
        }

        function bind(path) {
            var vmNode = get(path);
            if (!vmNode) {
                return;
            }
            vmNode.node = document.getElementById(vmNode.id);
        }

        return {
            bindAll: bindAll,
            bind: bind,
            get: get,
            setHTML: setHTML,
            getElement: getElement
        };
    }

    return {
        ViewModel: ViewModel
    };
});