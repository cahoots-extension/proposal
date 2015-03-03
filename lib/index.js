/*
 * cahoots-proposal
 *
 * Copyright Cahoots.pw
 * MIT Licensed
 *
 */

'use strict';

require('webcomponents.js/webcomponents-lite');

var form = require('./form/');
var thanks = require('./thanks/');

var Component = Object.create(HTMLElement.prototype);

module.exports = function instantiate () {
    document.registerElement('cahoots-proposal', {
        prototype: Component
    });
};

Component.createdCallback = function createdCallback () {
    var self = this;
    var formular = form(this);

    formular.on('submit', function onSubmit (thread) {
        var thankyou = thanks(thread);

        self.innerHTML = '';

        self.appendChild(thankyou.el);
    });

    this.appendChild(formular.el);
};
