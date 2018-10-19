define([
    'knockout'
], function (
    ko
) {
    'use strict';

    class Column {
        constructor({name, label, type, format, sort, width, style, noSelect, component}) {
            this.name = name;
            this.label = label;
            this.type = type;
            this.format = format;
            // let sortObject;
            // if (sort) {
            //     if (typeof sort === '')
            //     sortObject = {
            //         active: ko.observable(false),
            //         direction: ko.observable('ascending')
            //     };
            // }
            this.sort = sort;
            this.width = width || 1;
            this.style = style || {};
            this.noSelect = noSelect || false;
            this.component = component || null;
        }
    }

    class Row {
        constructor({data}) {
            this.mode = 'normal';
            // this.id ?
            this.over = ko.observable(false);
            this.data = Object.entries(data).reduce((row, [key, value]) => {
                row[key] =  {
                    value: value
                };
                return row;
            }, {});
        }
    }

    class Table {
        constructor({rows, columns, terms, sort} = {}) {
            this.rows = ko.observableArray(rows || []);
            this.selectedRows = ko.observableArray();
            this.columns = columns;
            this.terms = terms;
            if (sort) {
                this.initialSort = sort;
            } else {
                this.initialSort = {
                    column: columns[0].name,
                    direction: 'desc'
                };
            }

            this.columnMap = columns.reduce((columnMap, column) => {
                columnMap[column.name] = column;
                return columnMap;
            }, {});


            this.isLoading = ko.observable();
            this.pageSize = ko.observable();
            this.state = ko.observable();
            this.errorMessage = ko.observable();
            this.env = {
                selectedRows: this.selectedRows
            };
            this.actions = {};
            this.sortBy = (column) => {
                this.sort.direction(this.sort.direction()==='ascending'? 'descending' : 'ascending');
                // this.columns.forEach((column) => {
                //     if (column.sort) {
                //         column.sort.active(false);
                //     }
                // });
                // column.sort.active(true);
                this.sort.column(column);
            };
            this.rowAction = null;
            this.sort = {
                column: ko.observable(this.columnMap[this.initialSort.column]),
                direction: ko.observable(this.initialSort.direction)
            };
        }
    }

    return {Column, Row, Table};
});