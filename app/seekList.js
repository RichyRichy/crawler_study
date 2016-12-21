/**
 * 获取简书热门文章的文章列表，
 * 获取前100页，每页9条数据
 * Created by xinxin on 2016/12/20.
 */
'use strict';
var request = require('./request.js');


var times = 0;
var totalPage = 20;
var pages = [];//每页数据为一个page
function Seek() {

}
//创建一个Promise,给seek调用
Seek.prototype.createPromise = function (i) {
    var options = {
        url: 'http://www.jianshu.com/collections/16/notes?order_by=likes_count&page=' + i,
        type: 'get'
    };
    //返回一个Promise
    return new Promise(function (resolve, reject) {
        options.callback = function (data, _setCookie) {
            resolve(data);
        };
        request(options, null);
    })
};

/**
 *  递归的请求，每次并发的请求5个
 */
Seek.prototype.seek = function (callback) {
    var self = this;
    times++;
    var ot = times;
    //一次执行5个异步请求
    var promise = Promise.all([
        self.createPromise(times),
        self.createPromise(++times),
        self.createPromise(++times),
        self.createPromise(++times),
        self.createPromise(++times)
    ]);
    promise.then(function (result) {
        console.log('seekList totals', times);
        //将获得的所有html文本放到pages中
        pages = pages.concat(result);
        if (times < totalPage) {
            //递归
            self.seek(callback);
        } else {
            //发送给其调用者
            callback(pages);
        }
    })
};
/**
 * 同时发起100个请求，会导致部分请求失败
 */
// Seek.prototype.seek = function() {
//     var self = this;
//     var promises = [];
//     for (var i = 1; i <= 100; i++) {
//         var promise = self.createPromise(i);
//         promises.push(promise);
//     }
//     var pro = Promise.all(promises);
//     return pro;
// }
module.exports = function () {
    var seek = new Seek();
    /**
     * resolve回调，用来处理所有页的信息
     */
    return new Promise(function (resolve, reject) {
        seek.seek(function (pages) {
            resolve(pages);
        });
    });
};
