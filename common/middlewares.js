const _ = require('lodash');
const jwt = require('jsonwebtoken');
const LOG = require('./logger');
const errors = require('./errors');
const CONF = require('./conf');

exports.respAsJsonOrJsonp = respAsJsonOrJsonp;
exports.accessLog = accessLog;
exports.authentication = authentication;
exports.authForAdmin = authForAdmin;
exports.fetchAppcodeToken = fetchAppcodeToken;


async function respAsJsonOrJsonp(ctx, next) {
  let body = {};
  try {
    let data = await next();
    body = {
      errcode: 0,
      data: _.isUndefined(data) ? null : data,
      message: ''
    };
  } catch (error) {
    if (error.name !== 'InputError') {
      LOG.error({
        ctx: ctx,
        error: error
      }, 'System Error');

    } else {
      LOG.warn({
        ctx: ctx,
        error: error
      }, 'Input Error');
    }

    body = {
      errcode: error.status || 500,
      data: null,
      message: error.message
    };
  }

  let callback = ctx.query.callback;
  if (callback) {
    ctx.type = 'js';
    ctx.body = _.template('<%=callback%>(<%=result%>)')({
      callback: callback,
      result: JSON.stringify(body)
    });
  } else {
    ctx.type = 'json';
    ctx.body = JSON.stringify(body);
  }
};

async function accessLog(ctx, next) {
  let startTime = new Date();
  await next();
  if (ctx.url !== '/healthcheck.html') {
    let duration = new Date() - startTime;
    LOG.info({
      status: ctx.response.status,
      access: true,
      ip: ctx.ip.replace(/^.*([:]+)/, ''),
      duration: duration
    }, ctx.url);
  }
};

async function authentication(ctx, next) {
  let token = ctx.request.headers['X-App-Token'.toLowerCase()];
  if (!token) {
    throw new errors.InputError('X-App-Token must exist in headers');
  }
  try {
    let authInfo = jwt.verify(_.trim(token), CONF.jwtSecret);
    ctx.X_AUTH_INFO = authInfo;
  } catch (error) {
    throw new errors.InputError('X-App-Token invaild');
  }
  return next();
}


async function authForAdmin(ctx, next) {
  let token = ctx.request.headers['X-Admin-Token'.toLowerCase()];
  if (!token) {
    throw new errors.InputError('X-Admin-Token must exist in headers');
  }
  if (!_.includes(CONF.adminTokens, token)) {
    throw new errors.InputError('X-Admin-Token no perm');
  }
  return next();
}


async function fetchAppcodeToken(appcode, user_id) {
  if (!appcode) {
    throw new errors.InputError('appcode connot be empty');
  }

  if (!user_id) {
    throw new errors.InputError('user_id connot be empty');
  }

  return jwt.sign({
    version: 1.0,
    appcode: appcode,
    to_user: user_id
  }, CONF.jwtSecret);
}