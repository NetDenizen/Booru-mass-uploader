// ==UserScript==
// @name        Booru Mass Uploader for Booru Wizard
// @description Add ability to bulk upload images to your booru; meant to be used in conjunction with Booru wizard at: https://github.com/NetDenizen/booru-wizard Original by Seedmanc.
// @namespace   https://github.com/NetDenizen/Booru-mass-uploader
// @version     1.1
// @author      NetDenizen
// @include     http*://*.booru.org/*
// @include     http://rule34.xxx/*
// @include     https://gelbooru.com/*
// @include     http://safebooru.org/*
// @include     https://moe.dev.myconan.net/*
// @include     http://behoimi.org/*
// @include     https://chan.sankakucomplex.com/*
// @include		http*://*allthefallen.moe/*
// @include     http://danbooru.donmai.us/*
// @exclude     *.png
// @exclude     *.jp*g
// @exclude     *.gif
// @exclude     *.webm

// you can add any boorus of your choice by following the pattern

// @grant       none
// @run-at      document-end
// @noframes
// ==/UserScript==

if (window.top != window.self) {
    throw 'no iframes';
}

function activateScripts(scripts, i) {
    var node   = scripts[i],
        parent = node.parentElement,
        d      = document.createElement('script');

    d.async = node.async;
    d.src = node.src;
    d.onload = function () {
        if (i < scripts.length - 1) {
            activateScripts(scripts, i + 1);
        }
    };
    parent.insertBefore(d, node);
    parent.removeChild(node);
}

if (~document.location.href.indexOf('s=mass_upload')) {
    var script = document.createElement('script');

    //if (/https:\/\/\w+\.booru\.org\//i.test(document.location.href)) {
    //    document.location.href = document.location.href.replace('https:','http:');
    //}   //booru.org does not support https uploading

    document.body.innerHTML = '<img src="https://netdenizen.github.io/Booru-mass-uploader/spinner.gif"/>';
    script.src = 'https://netdenizen.github.io/Booru-mass-uploader/js/index.html.js?v=1.1';
    script.onload = function () {
        var scripts = document.getElementsByTagName('script');

        activateScripts(scripts, 0);
    };
    document.body.appendChild(script);

} else {
    var navbar = document.getElementById('navbar') ||
        document.getElementsByClassName('flat-list2')[0] ||
        document.querySelector('#main-menu > ul') ||
        document.querySelector('nav > menu');
    var li = document.createElement("li");
    var a = document.createElement("a");
    var token = document.querySelector('meta[name="csrf-token"]');

    token = token && token.content;
    if (token) {
        localStorage.setItem('auth_token', token);
    }

    if (document.querySelector('[src*="moe-legacy"]') || document.querySelector('html.action-post') || document.querySelector('[href*="/post/upload"]')) {
        localStorage.setItem('current', 'moebooru');
    } else if (document.querySelector('[href*="/uploads/new"]') || ~document.documentElement.innerHTML.indexOf('Running Danbooru')) {
        localStorage.setItem('current', 'danbooru');
    }

    a.style.fontWeight = 'bold';
    a.appendChild(document.createTextNode('Mass Upload'));
    if ( (document.location.port === '80' && document.location.protocol === 'http') ||
         (document.location.port === '443' && document.location.protocol === 'https') ) {
        a.href = document.location.protocol + '//' + document.location.hostname + '/index.php?page=post&s=mass_upload';
    } else {
        a.href = document.location.protocol + '//' + document.location.hostname + ':' + document.location.port + '/index.php?page=post&s=mass_upload';
    }
    a.id = 'MassUploadLink';

    if( !document.getElementById('MassUploadLink') ){
        if (navbar) {
            li.appendChild(a);
            navbar.appendChild(li);
        } else {
            a.style.display='block';
            a.style.margin='auto';
            a.style.width='105px';
            document.body.insertBefore(a, document.body.firstChild);
        }
    }
}
