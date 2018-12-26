const _ = require('lodash');
const expect = require('chai').expect;
const rewire = require('rewire');

const workerHash = rewire('../service/worker-hash.js');
const confMock = {
    workers: {
        set: {
            mark: 'Set类型指标计算集群',
            instances: [
                ['http://127.0.0.1:17000', 1],
                ['http://127.0.0.1:17001', 2]
            ]
        },
        counter: {
            mark: 'Counter类型指标计算集群',
            instances: [
                ['http://127.0.0.1:27000', 1]
            ]
        },
        timing: {
            mark: 'Timing类型指标计算集群',
            instances: [
                ['http://127.0.0.1:37000', 1]
            ]
        },
        summary: {
            mark: 'Summary类型指标计算集群',
            instances: [
                ['http://127.0.0.1:47000', 1]
            ]
        }
    }
};

workerHash.__set__('CONF', confMock);

const WorkerHash = workerHash.__get__('WorkerHash');

describe('service.worker-hash', function() {
    let hash = WorkerHash({
        resetInterval: 1000
    });
    it('集群的Hash列表key应该返回正常', function() {
        expect(_.chain(hash.workersHash).keys().sortBy().value())
            .to.deep.equal(_.chain(confMock.workers).keys().sortBy().value());
    });

    it('获取指标对应的hash值符合预期', function() {
        let metric_set_0 = {
            type: 'set',
            name: 'abc'
        };
        let metric_set_1 = {
            type: 'summary',
            name: 'abc03'
        };

        let metric_set_2 = {
            type: 'wrong',
            name: 'abc03'
        };
        expect(_.chain(confMock.workers.set.instances).fromPairs().keys().value())
            .to.include(hash.get(metric_set_0));
        expect(_.chain(confMock.workers.summary.instances).fromPairs().keys().value())
            .to.include(hash.get(metric_set_1));
        expect(undefined).to.equal(hash.get(metric_set_2));
    });

    it('Hash算法的权重效果符合预期', function() {
        let res = {};
        _.each(_.range(5000), function() {
            let server = hash.get({
                type: 'set',
                name: 'abc' + _.random(5000),
                tags: {}
            });
            if (_.has(res, server)) {
                res[server] += 1;
            } else {
                res[server] = 1;
            };
        });
        let firstRate = 0;
        _.each(res, function(count, key) {
            let rate = count / confMock.workers.set.instances[key];
            if (!firstRate) {
                firstRate = rate;
            } else {
                expect(rate / firstRate > 0.8).to.be.true;
                expect(rate / firstRate < 1.2).to.be.true;
            }
        });
    });

    it('集群的Hash列表的刷新时间符合预期', function(done) {
        setTimeout(function() {
            expect(hash.resetTimes >= 1).to.be.true;
            done();
        }, 20);
    });
});
