/*
 * cahoots-proposal
 *
 * Copyright Cahoots.pw
 * MIT Licensed
 *
 */

/**
 * @author André König <andre@cahoots.ninja>
 *
 */

'use strict';

var reactive = require('reactive');
var isURL = require('is-url');
var xhr = require('xhr');

var model = require('./model');

var html = require('./template.html');

require('./style.css');

module.exports = function instantiate () {
    var view = new FormView();

    return {
        el: view.el,
        on: view.on.bind(view)
    };
};

function FormView () {
    var captcha;

    this.model = model;

    this.view = reactive(html, this.model, {
        delegate: this
    });

    // Shortcut
    this.el = this.view.el;

    // Internal events
    this.$events = {
        submit: []
    };

    // Install Google reCAPTCHA script
    captcha = document.createElement('script');
    captcha.setAttribute('src', 'https://www.google.com/recaptcha/api.js');
    document.body.appendChild(captcha);
}

FormView.prototype.$update = function $update (attr, value) {
    this.view.set(attr, value);
};

FormView.prototype.$send = function $send (callback) {
    var data = {};

    var form = this.el.querySelectorAll('form')[0];
    var uri = form.getAttribute('action');
    var method = form.getAttribute('method');

    function onRequest (err, res, body) {
        if (err) {
            // TODO: Propagate the error to the UI.
            console.error('Failed to sent the submission: %s', err.toString());

            return callback(err);
        }

        if (res.statusCode !== 201) {
            // TODO: Propagate the error to the UI.
            console.error('The cahoots submission platform sent an unwanted HTTP response code: ', res.statusCode);

            return callback(err);
        }

        try {
            body = JSON.parse(body);
        } catch (err) {
            // TODO: Propagate the error to the UI.
            console.error('Failed to parse the response from the cahoots submission API.');

            return callback(err);
        }

        callback(null, body);
    }

    callback = callback || function noop () {};

    data.authorName = this.model.authorName;
    data.organizationName = this.model.organizationName;
    data.organizationInfo = this.model.organizationInfo;
    data.cahootsSource = this.model.cahootsSource;
    data.recaptcha = this.model.recaptcha;

    xhr({
        body: JSON.stringify(data),
        uri: uri,
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    }, onRequest);
};

FormView.prototype.on = function on (type, fn) {
    if (this.$events[type]) {
        this.$events[type].push(fn);
    }
};

FormView.prototype.emit = function emit (type, data) {
    var subscribers = this.$events[type];

    subscribers.forEach(function onEach (subscriber) {
        subscriber(data);
    });
};

FormView.prototype.submit = function submit () {
    var self = this;
    var errors = {};

    function onSubmit (err, thread) {
        if (err) {
            return console.error('failed to submit the form: ' + err.toString());
            // TODO: Show fatal error in the UI.
        }

        self.emit('submit', thread);
    }

    this.model.recaptcha = grecaptcha.getResponse();

    if (!this.isAuthorNameValid()) {
        errors.authorName = true;
    }

    if (!this.isOrganizationNameValid()) {
        errors.organizationName = true;
    }

    if (!this.isOrganizationInfoValid()) {
        errors.organizationInfo = true;
    }

    if (!this.isCahootsSourceValid()) {
        errors.cahootsSource = true;
    }

    if (!this.isCaptchaValid()) {
        errors.recaptcha = true;
    }

    if (Object.keys(errors).length) {
        return this.$update('errors', errors);
    }

    this.$send(onSubmit);
};

FormView.prototype.setAuthorName = function setAuthorName (e) {
    this.$update('authorName', e.target.value);
};

FormView.prototype.isAuthorNameValid = function isAuthorNameValid () {
    return !!this.model.authorName;
};

FormView.prototype.setOrganizationName = function setOrganizationName (e) {
    this.$update('organizationName', e.target.value);
};

FormView.prototype.isOrganizationNameValid = function isOrganizationNameValid () {
    return !!this.model.organizationName;
};

FormView.prototype.setOrganizationInfo = function setOrganizationInfo (e) {
    this.$update('organizationInfo', e.target.value);
};

FormView.prototype.isOrganizationInfoValid = function isOrganizationInfoValid () {
    return isURL(this.model.organizationInfo);
};

FormView.prototype.setCahootsSource = function setCahootsSource (e) {
    this.$update('cahootsSource', e.target.value);
};

FormView.prototype.isCahootsSourceValid = function isCahootsSourceValid () {
    return isURL(this.model.cahootsSource);
};

FormView.prototype.isCaptchaValid = function isCaptchaValid () {
    return this.model.recaptcha;
};
