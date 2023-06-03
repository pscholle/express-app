/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.chartRouter = void 0;
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const path_1 = tslib_1.__importDefault(__webpack_require__(3));
const fs = tslib_1.__importStar(__webpack_require__(7));
const p = path_1.default.join(__dirname, 'assets/chart.json');
function clientErrorHandler(err, req, res, next) {
    if (!req.params.chart_id) {
        res.status(500).json({ error: 'Missing chart id ' });
    }
    else {
        next(err);
    }
}
function errorHandler(err, req, res, next) {
    console.log(err);
    res.status(500).json({ error: err.message });
}
function loadChart(chart_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            fs.readFile(p, 'utf-8', (err, data) => {
                if (err) {
                    rej(err);
                }
                res(JSON.parse(data));
            });
        });
    });
}
function chartRouter(io) {
    const router = express_1.default.Router();
    router.use(express_1.default.json({ limit: '500kb' }));
    router.use(express_1.default.urlencoded({
        extended: true,
        limit: '500kb'
    }));
    // update
    router.put('/', (req, res) => {
        const body = req.body;
        if ('datasets' in body)
            io.emit("editChartDataset", req.body, () => {
                res.send('Chart updated.');
            });
        if ('labels' in body)
            io.emit("editChartLabels", req.body, () => {
                res.send('Chart updated.');
            });
    });
    // middleware that is specific to this router
    router.use((req, res, next) => {
        console.log('Request size: ' + Number(req.headers['content-length']) / 1e6 + 'mb');
        next();
    });
    router.use(clientErrorHandler);
    // define the home page route
    router.get('/:chart_id?', (req, res, next) => {
        const id = req.params.chart_id;
        if (!id) {
            next(new Error('Missing chart_id'));
            return;
        }
        res.redirect('/assets/chart.json');
    });
    router.get('/save/:chart_id', (req, res, next) => {
        io.timeout(1000).emit('saveChart', (err, responses) => {
            if (err) {
                next(err);
            }
            else {
                if (responses.length && responses[0].config) {
                    fs.readFile(p, 'utf-8', (err, content) => {
                        const { chart_id } = req.params;
                        const storage = JSON.parse(content);
                        storage[chart_id] = responses[0].config;
                        fs.writeFile(p, JSON.stringify(storage), { encoding: 'utf-8' }, (err) => {
                            if (err) {
                                next(err);
                                return;
                            }
                            const status = responses[0].status;
                            res.status(200).json({ success: status.success, id: chart_id });
                        });
                    });
                }
                else {
                    res.json({ info: 'No chart data to save.' });
                }
            }
        });
    });
    router.get('/load/:chart_id', (req, res, next) => {
        fs.readFile(p, 'utf-8', (err, content) => {
            if (err) {
                next(err);
            }
            const { chart_id } = req.params;
            const storage = JSON.parse(content);
            const data = storage[chart_id];
            if (!data) {
                next(new Error('No data forst chart id: ' + chart_id));
                return;
            }
            io.timeout(2000).emit('loadChart', data, (err, responses) => {
                res.json(responses[0]);
            });
        });
    });
    // overwrite existing datasets
    router.post('/', (req, res, next) => {
        try {
            io.emit("new", req.body, () => {
                res.send('created new chart');
            });
        }
        catch (e) {
            next(e);
        }
    });
    router.use(errorHandler);
    return router;
}
exports.chartRouter = chartRouter;


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("fs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const path = tslib_1.__importStar(__webpack_require__(3));
const cors_1 = tslib_1.__importDefault(__webpack_require__(4));
const socket_io_1 = __webpack_require__(5);
const chart_1 = __webpack_require__(6);
const app = (0, express_1.default)();
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
const io = new socket_io_1.Server(server);
io.on('connection', (socket) => {
    console.log('new client connected');
});
app.use((0, cors_1.default)());
app.use('/chart', (0, chart_1.chartRouter)(io));
app.get('/dashboard', function (req, res) {
    res.sendFile(path.resolve('dist/packages/dashboard/index.html'));
});
app.use('/assets', express_1.default.static(path.join(__dirname, 'assets')));
app.get('/api', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    res.send('Hello');
}));
app.get('/fred/search', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const params = req.query;
}));
app.use((req, res, next) => {
    console.log('middleware logging');
    next();
});

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map