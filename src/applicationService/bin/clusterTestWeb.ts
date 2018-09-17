#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../clusterAppTest');
var debug = require('debug')('mycms:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

const cluster = require('cluster');

if (cluster.isMaster) {

    // 跟踪 http 请求
    let numReqs = 0;

    // 计算请求数目
    function messageHandler(msg) {
        numReqs += 1;
        console.log(`numReqs = ${numReqs}`);
        if (numReqs === numCPUs) {
            process.send({
                onListen: true
            });
        }
    }

    // 启动 worker 并监听包含 notifyRequest 的消息
    const numCPUs = require('os').cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    for (const id in cluster.workers) {
        cluster.workers[id].on('message', messageHandler);
    }

} else {

    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);
    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);


    // 通知 master 进程接收到了请求
}
/**
 * Create HTTP server.
 */

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
    process.send({
        onListen: true
    });
}