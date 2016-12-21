/**
 * Created by xinxin on 2016/12/20.
 */
'use strict';
var analyse = require('./app/analyse.js');
var bs = require('browser-sync').create();

var before = new Date();
analyse(function () {
    var end = new Date();//结束时间
    var elapsedTime= (end.getTime()-before.getTime())/1000;
    console.log('总耗时',elapsedTime,'s');
    bs.init({
        server: './app/views'
    });
    bs.reload('*.html');
});