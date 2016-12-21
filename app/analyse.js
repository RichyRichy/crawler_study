/**
 * 分析获得的数据
 * Created by xinxin on 2016/12/20.
 */
'use strict';
var seek = require('./seeKList.js');
var seekPage = require('./seekDetail.js');
var cheerio = require('cheerio');
var nunjucks = require('nunjucks');
var fs = require('fs');

function Analyse() {

}
/**
 * 使用cheerio载入列表页面，获取具体文章的url
 */
Analyse.prototype.load = function (data, i) {
    return new Promise(function (resolve, reject) {
        var $ = cheerio.load(data);
        var pages = [];
        var els = $('.article-list li');//element list
        if (els.length === 0) {
            console.warn('load error page', i);
            resolve([]);
        }
        els.each(function (index) {
            if ($(this).attr('class') === 'hava-img') {//li有img，在其目录下直接找a标签
                pages.push($(this).children('a').attr('href'));
            } else {//li没有img，在div下找a标签
                pages.push($(this).children('div').children('.title').children('a').attr('href'));
            }

            if (index === els.length - 1) {//到了最后一个，就处理结束了
                resolve(pages);
            }
        });
    });
};
/**
 * 获得所有文章的url
 * @param data
 * @returns {Promise.<*>}，包含所有文章url的Primise[]
 */
Analyse.prototype.getPages = function (data) {
    var promises = [];
    var self = this;
    for (var i = 0; i < data.length; i++) {
        promises.push(self.load(data[i], i));//获得到具体文章url，返回值是一个Promise
    }
    var pro = Promise.all(promises);
    return pro;
}


Analyse.prototype.analyse = function (callback) {
    var self = this;
    seek().then(function (data) {//获取所有文章列表，900个
        self.getPages(data).then(function (result) {//result是一个有所有文章url的数组
            var urls  = [];
            for(let i = 0;i<result.length;i++){
                urls=urls.concat(result[i]);
            }
            seekPage(urls).then(function(res) {//调查每页的详细信息
                //https://mozilla.github.io/nunjucks/
                var renderRes = nunjucks.render('./app/tpl/index.tpl', res);//渲染模板
                fs.writeFile('./app/views/index.html', renderRes, function() {});//得到网页
                callback && callback();
            });
        })
    })
};

module.exports = function(callback) {
    new Analyse().analyse(callback);
};