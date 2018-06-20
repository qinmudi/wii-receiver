#!/usr/bin/env node

var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var PORT = parseInt(process.argv[2]) || 8999;

var server = http.createServer(function(req, res) {

    function error(err) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end(err.toString()); //fail
    }

    function next(from, to) {
        fs.readFile(from, function(err, content) {
            if (err) {
                error(err);
            } else {
                fs.writeFile(to, content, function(err) {
                    console.log(err,content)
                    if (err) {
                        error(err);
                    }
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('0'); //success
                });
            }
        });
    }

    if (req.url == '/') {
        // show a file upload form
        res.writeHead(200, {
            'content-type': 'text/html'
        });
        res.end('<h1 style="margin:30px auto;text-align:center;color:358ccc;">Wii-Recevicer服务已经启动完成！</h1><div style="font-size:18px;text-align:center;color:358ccc;">更多使用帮助，请查看<a target="_blank" href="http://wiidoc.qinmudi.cn/zh/">文档</a></div>');
    } else if (req.url == '/receiver' && req.method.toLowerCase() == 'post') {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            if (err) {
                error(err);
            } else {
                var to = fields['to'];
                fs.exists(to, function(exists) {
                    if (exists) {
                        fs.unlink(to, function(err) {
                            next(files.file.path, to);
                        });
                    } else {
                        fs.exists(path.dirname(to), function(exists) {
                            if (exists) {
                                next(files.file.path, to);
                            } else {
                                mkdirp(path.dirname(to), 0777, function(err) {
                                    if (err) {
                                        error(err);
                                        return;
                                    }
                                    next(files.file.path, to);
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

server.listen(PORT, function() {
    console.log(chalk.green(`接收服务已启动,端口为:${PORT}`));
});