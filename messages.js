var express = require('express'), mysql = require('mysql'), bodyParser = require('body-parser');
var app = express();

var pool = mysql.createPool(require('./config.json'));

var server = app

    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .listen(8081, function () {
        var host = server.address().address
        var port = server.address().port

        console.log("Server listing at http://%s:%s", host, port)
    });


app.get('/messages', function (req, res) {
    function returnData(error, results, fields) {
        if (error) throw error;

        var array = [];

        for (var i = 0; i < results.length; i++) {
            array.push(
                {
                    id: results[i].id,
                    type: results[i].type,
                    host: results[i].host,
                    title: results[i].title,
                    timestamp: results[i].timestamp,
                    content: results[i].content
                }
            );
        }

        res.json(array);
    }

    pool.query('SELECT id, type, host, title, timestamp, content from Messages' + (req.query.type != null ? " where type=?" : "") , [req.query.type], returnData);
}).get("/messages/:messageId", function (req, res) {
    pool.query('SELECT id, type, host, title, timestamp, content from Messages where id= ?', [req.params.messageId], function (error, results, fields) {
        if (error) throw error;
        var array = [];

        if (results.length > 0) {
            res.json({
                id: results[0].id,
                type: results[0].type,
                host: results[0].host,
                title: results[0].title,
                timestamp: results[0].timestamp,
                content: results[0].content
            });
        } else {
            res.json({
                "message": "not found"
            });
        }
    });
}).post("/messages", function (req, res) {
    if (req.body.type != null && req.body.content != null && req.body.host != null && req.body.title) {
        pool.query("INSERT INTO Messages (type, host, title, content) VALUES (?, ?, ?, ?)", [req.body.type, req.body.host, req.body.title, req.body.content], function (error, results, fields) {

            if (error != null) {
                res.json({
                    "message": "error"
                });
            } else {
                res.json({
                    "message": "success"
                });
            }

        });
    } else {
        res.status(400);
        res.json({
            "message": "missing attributes"
        });
    }

})