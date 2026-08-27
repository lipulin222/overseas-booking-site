$url = 'http://localhost:8765/api/dingtalk'
$p = '{"tool":"batch_send_robot_msg_to_users","arguments":{"robotCode":"test_robot","userIds":["fake_user_id_123"],"msgType":"text","title":"预约提醒","markdown":"测试文本"}}'
try {
  $r = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Body $p -UseBasicParsing -TimeoutSec 30
  Write-Host ('[text] STATUS ' + $r.StatusCode)
  Write-Host ('BODY ' + $r.Content)
} catch {
  Write-Host ('[text] ERR ' + $_.Exception.Message)
}
