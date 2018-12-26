const expect = require('chai').expect;

const errors = require('../common/errors.js');

describe('common.errors', function () {
  it('InputError对象测试', function () {
    let error = new errors.InputError('input error');
    expect(error.message).to.equal('input error');
    expect(error.status).to.equal(400);
    expect(error.name).to.equal('InputError');
  });

  it('SystemError对象测试', function () {
    let error = new errors.SystemError('system error');
    expect(error.message).to.equal('system error');
    expect(error.status).to.equal(500);
    expect(error.name).to.equal('SystemError');
  });
});
