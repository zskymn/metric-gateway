const fs = require('fs');

const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const compress = require('koa-compress');

const mws = require('./common/middlewares');
const LOG = require('./common/logger');

const metric = require('./service/metric');

const CONF = require('./common/conf');

function run() {
  const app = new Koa();
  app.proxy = true;

  // middlewares
  app.use(mws.accessLog);
  app.use(compress());
  app.use(bodyparser({
    jsonLimit: '50mb'
  }));

  // router
  setRouter(app);

  app.on('error', function (err, ctx) {
    if (err.code !== 'ECONNABORTED' && err.code !== 'HPE_INVALID_EOF_STATE') {
      LOG.error({
        error: err,
        ctx: ctx
      }, 'System Error');
    } else {
      LOG.warn({
        error: err,
        ctx: ctx
      }, 'Input Error');
    }
  });
  return app;
}

function setRouter(app) {
  let router = Router();
  router.get('/',
    async (ctx) => {
      ctx.body = 'welcome to metric gateway';
    });

  router.get('/healthcheck.html',
    async (ctx) => {
      if (fs.existsSync(CONF.healthcheckFile)) {
        ctx.status = 200;
        ctx.body = 'ok';
      } else {
        ctx.status = 404;
      }
    });

  router.post('/v1/metric/send',
    mws.respAsJsonOrJsonp,
    mws.authentication,
    async (ctx) => {
      ctx.response.set('Access-Control-Allow-Origin', '*');
      return metric.send(ctx.X_AUTH_INFO, ctx.request.body);
    });

  router.options('/v1/metric/send',
    async (ctx) => {
      ctx.response.set('Access-Control-Allow-Headers', 'x-requested-with,content-type,X-App-Token');
      ctx.response.set('Access-Control-Allow-Origin', '*');
      ctx.response.set('Access-Control-Allow-Methods', 'POST');
      ctx.body = 'ok';
    });

  router.get('/v1/fetch_appcode_token',
    mws.respAsJsonOrJsonp,
    mws.authForAdmin,
    async (ctx) => {
      return mws.fetchAppcodeToken(ctx.query.appcode, ctx.query.user_id);
    });

  app.use(router.routes(), router.allowedMethods());

}

if (!module.parent) {
  run().listen(process.env.PORT || 6066);
} else {
  exports.run = run;
}
