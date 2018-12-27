# metric-gateway

metric-gateway 负责指标的收集工作

gateway 接收指标后，经过一系列处理和统计，最后通过一致性哈希将结果发送到对应的
metric-worker 集群，由 worker 完成指标的聚合计算和推送工作。

## NodeJS 版本

确保 `NodeJS` 版本大于 `8.9.0`

检查版本

```bash
node -v
```

更新node版本方法

```bash
sudo npm install -g n  # n是一个方便的node版本管理工具
n 8.9.0  # 安装8.9.0版的nodejs
npm -v # 重新检查版本，若版本为改变，可以执行 source ~/.bashrc
```

## 开发

```sh
$ npm i

# 启动（监视代码改变，自动重启）
$ pm2 start dev.pm2.config.js

# 删除
$ pm2 delete dev.pm2.config.js

# 查看日志
$ pm2 logs dev.pm2.config.js

```

## 线上

```sh
$ npm i --production

# 启动
$ pm2 start prod.pm2.config.js

# 重启
$ pm2 restart prod.pm2.config.js

# 关闭
$ pm2 stop prod.pm2.config.js

# 删除
$ pm2 delete prod.pm2.config.js
```

## 测试

```sh
# 开发中测试（监视代码改变）
$ npm test

# 代码测试覆盖率
$ npm run coverage
```

## 接口

### /healthcheck.html  `GET`

判断服务是否存在的接口，主要供NG调用

### /v1/metric/send  `POST`

接收外部推送数据的接口，本项目提供服务的主要接口

headers:

```sh
X-App-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoxLCJhcHBjb2RlIjoib3BzX21ldHJpY2d3IiwidG9fdXNlciI6Inh4eHguemhhbyIsImlhdCI6MTU0NTczNTczMH0.Aj8srWIjyFwxhcMrZlCxyNlP44uLG0iiR31ynyYd4Bw
Content-Type: application/json
```

body:

```javascript
{
    "metrics":[
        {
            "name":"memSize",
            "type":"set",
            "value":34.4
        },
        {
            "name":"orderCount",
            "type":"counter",
            "value":90
        },
        {
            "type":"timing",
            "name":"requestTime",
            "sum":405,
            "max":100,
            "min":12,
            "count":8
        },
        {
            "type":"summary",
            "name":"latency",
            "data_type":"tdigest",
            "value":"1.2~45~2.4~30~4.4~78~19.7~70",
            "output":{
                "common":[
                    "min",
                    "max",
                    "count"
                ],
                "percentiles":[
                    5,
                    95,
                    99
                ]
            }
        }
    ]
}
```

### /v1/fetch_appcode_token  `POST`

获取appcode的token接口

## 指标类型

### set

set 类型的指标，在一个指标周期（比如1分钟）中只会取最后一个值，是最普通的的指标类型。

该指标不需要在一个周期内做任何聚合操作，所以这种类型的指标可以复写（也就是说，你可以为这种类型的指标指定时间戳，该时间戳可以是过去的，也可以是将来的）

### counter

counter 类型的指标，可用于记录qps等场景。

在一个指标周期（比如1分钟）可以发生变化，可以增加，也可以减小。该指标需要在一个周期内做聚合操作，所以不可以指定时间戳（也就是说，只能按照当前时间戳计算）。
该指标最后输出一个汇总值（即周期内所有值的求和）。

### timing

timing 类型的指标，可用于记录代码执行时间。
每次update指定一个value和count（默认为1），该指标最后输出一组汇总值（最大值，最小值，总和，总数量，平均值）
需要在一个周期内做聚合操作，所以不可以指定时间戳（也就是说，只能按照当前时间戳计算）。

### summary
summary 是一种更加复杂的统计类型指标，会输出一组汇总值，如平均值，总和，总数量，百分位数（P90，P99等）。

该指标需要在一个周期内做聚合操作，所以不可以指定时间戳（也就是说，只能按照当前时间戳计算）。

该指标的的输入支持两种类型：元数据（raw）和t-digest序列化字符串（tdigest）