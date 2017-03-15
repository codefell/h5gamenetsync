var MapList = {
    create: function () {
        return {
            list: [],
            map: {}
        };
    },
    sortOnId: function (ml) {
        ml.list.sort(function (a, b) {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id == b.id) {
                return 0;
            }
            return 1;
        });
    },
    add: function (ml, e) {
        for (var i in ml.list) {
            if (ml.list[i] == undefined) {
                ml.list[i] = e;
                ml.map[e.id] = e;
                return;
            }
        }
        ml.list.push(e);
        ml.map[e.id] = e;
    },
    del: function (ml, e) {
        for (var i in ml.list) {
            if (ml.list[i] == e) {
                ml.list[i] = undefined;
                ml.map[e.id] = undefined;
                return;
            }
        }
        ml.map[e.id] = undefined;
    },
    get: function (ml, id) {
        return ml.map[id];
    },
    call: function (ml, fn) {
        var args = util.arrCopy(arguments).slice(2);
        args.unshift(null);
        for (var i in ml.list) {
            if (ml.list[i]) {
                args[0] = ml.list[i];
                fn.apply(undefined, args);
            }
        }
    },
};
