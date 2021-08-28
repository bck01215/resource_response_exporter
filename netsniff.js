if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : n }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}
var fs = require('fs');
var system = require('system');
var args = system.args;
var path = args[3];

function createHAR(address, title, startTime, resources) {
    var entries = [];
    resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;

        if (!request || !startReply || !endReply) {
            return;
        }

        entries.push({
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: -1
            },
            pageref: address
        });
    });

    return {
        log: {
            version: '1.2',
            creator: {
                name: "PhantomJS",
                version: phantom.version.major + '.' + phantom.version.minor +
                    '.' + phantom.version.patch
            },
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: page.endTime - page.startTime
                }
            }],
            entries: entries
        }
    };
}
let requested = 0;
let received = 0;
var page = require('webpage').create();
page.address = args[1];
page.resources = [];

page.onLoadStarted = function () {
    page.startTime = new Date();

};

page.onResourceRequested = function (req) {
    requested++;
    page.resources[req.id] = {
        request: req,
        startReply: null,
        endReply: null
    };
};

page.onResourceReceived = function (res) {
    if (res.stage === 'start') {

        page.resources[res.id].startReply = res;
    }
    if (res.stage === 'end') {
        received++;
        page.resources[res.id].endReply = res;
    }
};

new Promise(function () {
    page.open(page.address, function (status) {
        var har;

        if (status !== 'success') {
            console.log('FAIL to load the address');
        } else {
            page.endTime = new Date();
            page.title = page.evaluate(function () {
                return document.title;
            });
            har = createHAR(page.address, page.title, page.startTime, page.resources);
            har["failed"] = requested - received

            let content = JSON.stringify(har, undefined, 4);
            fs.write(path, content, 'w');
        }
        phantom.exit();
    })
    // expire if over 10 seconds
    setTimeout(function () {
        var har;
        har = createHAR(page.address, page.title, page.startTime, page.resources);
        har["failed"] = requested - received
        let content = JSON.stringify(har, undefined, 4);
        fs.write(path, content, 'w');

        phantom.exit();
    }, parseInt(args[2]))
});
