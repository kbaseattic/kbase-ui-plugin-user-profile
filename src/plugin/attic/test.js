define([
    'kb_common/html',
    'kb_common/bootstrapUtils',
    './lib/specTest',
    './tests/profileSpec'
], function (
    html,
    BS,
    SpecTest,
    ProfileTest
) {
    var t = html.tag,
        div = t('div'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td');

    function factory(config) {
        var runtime = config.runtime;
        var container;

        function runTest(test) {
            var results = test();

            return table({
                class: 'table table-striped'
            }, [
                tr([
                    th('#'),
                    th('Test'),
                    th('Status'),
                    th('Path'),
                    th('Message')
                ])
            ].concat(results.map(function (result, index) {
                return tr([
                    td(String(index)),
                    td(result.title),
                    td(result.status),
                    td(result.path),
                    td(result.message)
                ]);
            })));
        }

        function runTests() {
            var node = container.querySelector('[data-element="specTest"]');
            node.innerHTML = [
                // runTest(SpecTest.runTests),
                runTest(ProfileTest.runTests)
            ].join('');
        }

        function layout() {
            return div({

            }, [
                div({
                    dataElement: 'specTest'
                })
            ]);
        }

        function attach(node) {
            container = node;
            container.innerHTML = layout();
        }

        function start(params) {
            runTests();
        }

        function stop() {}

        function detach() {}

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