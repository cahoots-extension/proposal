/*
 * cahoots-proposal
 *
 * Copyright Cahoots.pw
 * MIT Licensed
 *
 */

'use strict';

var reactive = require('reactive');

var model = require('./model');

var html = require('./template.html');
require('./style.css');

module.exports = function instantiate (thread) {
    var view = new ThanksView(thread);

    return {
        el: view.el
    };
};

function ThanksView (thread) {
    this.model = model;
    this.model.thread = thread;

    this.view = reactive(html, this.model, {
        delegate: this
    });

    // Shortcut
    this.el = this.view.el;
}
