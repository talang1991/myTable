import { fork, spawn } from 'child_process';
import { resolve } from "path";

let worker = fork(resolve(__dirname, './addRowWorker.js'), [], { execArgv: ['--inspect=15777'] });
worker.on('message', function (message) {//接收工作进程计算结果
    console.log(message);
    worker.kill();
});
worker.send({ id: 'xFDq+3Ht6Eq5xtrFlB6mnA==' });