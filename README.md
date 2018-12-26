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

/healthcheck.html

判断服务是否存在的接口，主要供NG调用


/v1/metric/send

接收外部推送数据的接口，本项目提供服务的主要接口

/v1/fetch_appcode_token

获取appcode的token接口