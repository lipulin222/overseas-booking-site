/*
 * 钉钉机器人推送（海外就医预约）
 * ------------------------------------------------------------
 * 提交预约后，将表单内容通过「钉钉 MCP 网关」的
 * batch_send_robot_msg_to_users 工具私发给指定接收人。
 *
 * 由于钉钉 MCP 网关不支持浏览器跨域（CORS），前端不能直接调用网关，
 * 必须经一个同源代理转发。这里前端只向同源的 endpoint 发送一个简单
 * JSON { tool, arguments }，由代理完成 MCP 握手并转发到钉钉网关。
 *
 * 本地预览：serve_demo.ps1 已内置 /api/dingtalk 代理。
 * 生产部署（GitHub Pages）：请部署 cloudflare-worker.js 作为 /api/dingtalk 代理。
 *
 * 使用前请填写下面 robotCode 与 targetUserIds：
 *   - robotCode     ：发送所用机器人的 robotCode（在钉钉开放平台 / search_my_robots 获取）
 *   - targetUserIds ：接收人的钉钉 userId 数组（即“指定人”）
 */
(function () {
  window.DingTalkConfig = window.DingTalkConfig || {
    endpoint: '/api/dingtalk',  // 同源代理地址（本地 & 生产一致）
    robotCode: '',              // TODO: 填写机器人 robotCode
    targetUserIds: []           // TODO: 填写接收人钉钉 userId 数组
  };

  // 将表单数据渲染为钉钉 markdown 消息
  window.buildDingTalkMarkdown = function (d) {
    var rows = [
      '#### 新的海外就医预约',
      '',
      '- **姓名**：' + (d.name || '未填写'),
      '- **手机号**：' + (d.phone || '未填写'),
      '- **邮箱**：' + (d.email || '未填写'),
      '- **国籍 / 所在地**：' + (d.country || '未填写'),
      '- **入境方式**：' + (d.entry || '未填写'),
      '- **可停留时长**：' + (d.stay || '未填写'),
      '- **就诊项目**：' + (d.project || '未填写'),
      '- **就诊城市**：' + (d.city || '未填写'),
      '- **就诊时间**：' + (d.date || '未填写'),
      '- **沟通方式**：' + (d.contact || '未填写'),
      '',
      '> 提交时间：' + (d.time || '')
    ];
    return rows.join('\n');
  };

  // 提交预约后调用：把表单推送到钉钉
  window.pushBookingToDingTalk = function (d) {
    var cfg = window.DingTalkConfig;
    if (!cfg.endpoint) return Promise.resolve();
    if (!cfg.robotCode || !cfg.targetUserIds || !cfg.targetUserIds.length) {
      console.warn('[DingTalk] 未配置 robotCode / targetUserIds，已跳过推送');
      return Promise.resolve();
    }
    var markdown = window.buildDingTalkMarkdown(d);
    var payload = {
      tool: 'batch_send_robot_msg_to_users',
      arguments: {
        robotCode: cfg.robotCode,
        userIds: cfg.targetUserIds,
        msgType: 'sampleMarkdownDX',
        title: '新的海外就医预约 · ' + (d.name || ''),
        markdown: markdown
      }
    };
    return fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) console.warn('[DingTalk] 推送接口返回', r.status);
      return r;
    }).catch(function (e) {
      console.warn('[DingTalk] 推送请求失败', e);
    });
  };
})();
