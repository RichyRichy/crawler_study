/**
 * 根据文章详情url组成的urls数组，进入文章，分别去查找计算里面有多少个代码块
 * Created by xinxin on 2016/12/21.
 */
"use strict";
var request = require('./request');
var fs = require('fs');
var cheerio = require('cheerio');

var times = 0;
var pages = [];
//post with code block number is 0
var zeroCount = 0;
//post with code block number is 1-10
var oneToTen = 0;
//post with code block number is 11-20
var elToTwe = 0;
//post with code block number is above 20
var beyondTwe = 0;

function Seek() {

}

Seek.prototype.createPromise = function (url) {
    var options = {
        url: 'http://www.jianshu.com' + url,
        type: 'get'
    };
    return new Promise(function (resolve, reject) {
        options.callback = function (data, _setCookie) {
            var $ = cheerio.load(data);
            var title = $('h1.title').text();
            var codes = $('code').length;
            if (codes === 0) {
                zeroCount++;
            } else if (codes <= 10) {
                oneToTen++;
            } else if (codes <= 20) {
                elToTwe++;
            } else {
                beyondTwe++;
            }
            resolve({
                title: title,
                codes: codes
            });
        };
        request(options, null);//cookie为null
    })
};
/**
 *  The request of the recursive，every five concurrent per request
 */
Seek.prototype.seek = function (urls, callback) {
    var self = this;
    var promises = [];
    var flag = 0;
    for (let i = 0; i < 5; i++) {
        promises.push(self.createPromise(urls[times]));
        times++;
        if (times === urls.length) {
            break;
        }
    }
    var promise = Promise.all(promises);
    promise.then(function (result) {
        console.log('seekDetail totals:', times);
        //push 遇到数组参数时，把整个数组参数作为一个元素；而 concat 则是拆开数组参数，一个元素一个元素地加进去。
        // push 直接改变当前数组；concat 不改变当前数组。
        if (typeof result !== 'string') {
            pages = pages.concat(result);
        } else {
            pages.push(result);
        }
        //递归条件
        if (times < urls.length) {
            self.seek(urls, callback);
        } else {
            callback(pages);
        }
    });
};
/**
 *
 * @param urls url数组
 * @returns {Promise}
 */
module.exports = function (urls) {
    var seek = new Seek();
    return new Promise(function (resolve, reject) {
        seek.seek(urls, function (pages) {
            var result = {
                items: pages,
                zeroCount: zeroCount,
                oneToTen: oneToTen,
                elToTwe: elToTwe,
                beyondTwe: beyondTwe
            }
            resolve(result);
        });

    });
}