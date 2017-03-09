var MapList = {
    create: function () {
        return {
            list: [],
            map: {}
        };
    },
    add: function (ml, e) {
        for (var i in ml.list) {
            if (ml.list[i] == undefined) {
                ml.list[i] = e;
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
                return;
            }
        }
        ml.map[e.id] = undefined;
    },
    get: function (ml, id) {
        return ml[id];
    },
    call: function (ml, fn) {
        var args = arguments.slice(2);
        args.unshift(null);
        for (var i in ml.list) {
            if (ml.list[i]) {
                args[0] = ml.list[i];
                fn.apply(undefined, args);
            }
        }
    },
};
