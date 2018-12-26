const expect = require('chai').expect;
const rewire = require('rewire');

const conf = rewire('../common/conf.js');

const defaultsConf = conf.__get__('defaults');
const getConf = conf.__get__('getConf');

describe('common.conf', function () {
  it('node env is undefined', function () {
    let CONF = getConf();
    expect(CONF.env).to.equal('dev');
  });

  it('node env is dev', function () {
    let CONF = getConf('dev');
    expect(CONF.env).to.equal('dev');
    expect(CONF.jwtSecret).to.equal(defaultsConf.jwtSecret);
  });

  it('node env is test', function () {
    let CONF = getConf('test');
    expect(CONF.env).to.equal('test');
  });

  it('node env is prod', function () {
    let CONF = getConf('prod');
    expect(CONF.env).to.equal('prod');
  });

  it('node env is beta', function () {
    let CONF = getConf('beta');
    expect(CONF.env).to.equal('beta');
  });

});
