const path = require('path')
const express = require('express') // http://expressjs.com/
const IpUtil = require('./utils/IpUtil')
const fs = require("fs")

let fileDb = new Map();
let server;

const initApp = () => {
    let app = express();
    app.use(express.static(path.join(__dirname, 'web')))
    // 文件下载页面
    app.get('/files', function (req, res) {
        let files = Array.from(fileDb.values());
        res.json({files: files});
    });
    // 文件下载链接
    app.get('/download/:name', function (req, res) {
        let filename = req.params.name
        let filePath = fileDb.get(filename).path;
        console.log("send file: " + filePath);
        res.download(filePath)
    });
    return app;
}

// 开启服务
const startServer = (port = 5421) => {
    const app = initApp()
    let url = `http://${IpUtil.getIpAddress()}:${port}/download.html`;
    server = app.listen(port, () => {
        console.log("start success! download url: " + url)
    });
    return {success: true, message: "启动成功", url: url};
}

// 关闭服务
const stopServer = () => {
    server.close();
}

const addFile = (file) => {
    console.log("addFile: " + file);
    fileDb.set(file.name, file)
}

const removeFile = (file) => {
    console.log("removeFile: " + file);
    fileDb.delete(file.name)
}

const listFiles = () => {
    return fileDb.values();
}

// 本地测试: export NODE_ENV='test' && node index.js
if (process.env.NODE_ENV === "test") {
    let userHome = process.env.HOME || process.env.USERPROFILE;
    let testDir = path.join(userHome, "test");
    let file1 = path.join(testDir, "test1.txt");
    let file2 = path.join(testDir, "test2.txt");
    let file3 = path.join(testDir, "test3.txt");
    fs.mkdirSync(testDir, {recursive: true});
    fs.writeFileSync(file1, "test1");
    fs.writeFileSync(file2, "test2");
    fs.writeFileSync(file3, "test3");
    addFile({name: "test1.txt", path: file1});
    addFile({name: "test2.txt", path: file2});
    addFile({name: "test3.txt", path: file3});
    startServer();
} else {
    window.api = {
        startServer,
        stopServer,
        addFile,
        removeFile,
        listFiles
    }
}