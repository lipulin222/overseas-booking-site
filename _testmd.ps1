$url = 'http://localhost:8765/api/dingtalk'
$p = '{"tool":"batch_send_robot_msg_to_users","arguments":{"robotCode":"test_robot","userIds":["fake_user_id_123"],"msgType":"sampleMarkdownDX","title":"预约提醒","markdown":"#### 测试\n- 姓名：张三\n- 电话：13800000000"}}'
try {
  $r = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Body $p -UseBasicParsing -TimeoutSec 30
  Write-Host ('[sampleMarkdownDX] STATUS ' + $r.StatusCode)
  Write-Host ('BODY ' + $r.Content)
} catch {
  Write-Host ('ERR ' + $_.Exception.Message)
}
