import * as express from "express";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as session from "express-session";
import { connection } from "mongoose";
import * as connectMongo from "connect-mongo";
import { resolve } from "path";
import { existsSync, mkdirSync, createWriteStream } from "fs";
import { connect } from "mongoose";
import { Util } from "../utility/class/Util";
import { api } from "./routes/api";
import * as mongoose from "mongoose";
import { setting } from "../utility/config/setting";
(<any>mongoose).Promise = global.Promise;
const MongoStore = connectMongo(session)
const logPath = resolve(__dirname, './log');
existsSync(logPath) || mkdirSync(logPath);
const now = Util.getDateString(new Date());
let accessLogFile = createWriteStream(resolve(logPath, './access_' + now + '.log'), { flags: 'a' });
let errorLogFile = createWriteStream(resolve(logPath, './error_' + now + '.log'), { flags: 'a' });
connect(`mongodb://localhost/${setting.testApiDBName}`);

const app = express();

app.set('trust proxy', 'loopback');
app.use(logger('combined', { stream: accessLogFile }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    saveUninitialized: false, // don't create session until something stored
    resave: true, //don't save session if unmodified
    secret: 'cmS00',
    store: new MongoStore({
        mongooseConnection: connection,
        touchAfter: 24 * 3600
    })
}));


app.use('/api', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err: any = new Error('Not Found');
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    err.status = 404;
    errorLogFile.write(meta + err.stack + '\n');
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
};

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

module.exports = app;