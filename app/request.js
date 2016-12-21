/**
 * 根据指定的url和参数去请求数据并接收数据
 * Created by xinxin on 2016/12/20.
 */
'use strict';
var http = require('http');
var querystring = require('querystring');
var url = require('url');//以上3个都是node的内置模块
/**
 *
 * @param options
 * {url:请求地址 必填
 * type:默认get,可选
 * params:{} 请求参数
 * callback:请求回调}
 * @param cookie
 */
module.exports = function (options, cookie) {
    var URL = url.parse(options.url);
    var type = options.type.toUpperCase() || 'GET';//如果前一个不存在，那么就是后一个，所以默认get请求
    //处理cookie
    cookie = cookie || '';
    //处理请求参数
    var contents = false;
    if (!!options.params) {//参数不为空
        contents = querystring.stringify(options.params);//转化参数对为=和&相连的形式
    }
    //如果get，参数在path中
    var path = URL.path;
    if (type === 'GET' && contents) {
        path = path + '?' + contents;
    }
    //get的请求选项
    var requestOptions = {
        host: URL.hostname,
        port: URL.port,
        path: path,
        method: type,
        headers: {
            Cookie: cookie
        }
    };
    //如果post请求，修改请求选项
    if (type === 'POST' && contents) {
        requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        requestOptions.headers['Content-Length'] = contents.length;
    }
    //发送请求
    var req = http.request(requestOptions, function (res) {
        res.setEncoding('UTF-8');
        var str = '';
        res.on('data', function (chunk) {//数据块
            str = str + chunk;
        });
        res.on('end', function () {
            var setCookie = res.headers['set-Cookie'];//保存cookie
            //结束要其他执行调用的回调
            options.callback && options.callback(str, setCookie);
        });
        res.on('error', function (e) {
            options.callback && options.callback(e);
        });

    });
    //如果是post请求要追加请求参数
    if (type === 'POST' && contents) {
        req.write(contents);
    }
    req.end();

};
