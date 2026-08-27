$url = 'http://localhost:8765/api/dingtalk'
$hdrs = @{}
$hdrs['Content-Type'] = 'application/json'

$p1 = '{"tool":"search_my_robots","arguments":{"currentPage":1,"pageSize":10}}'
try {
  $r1 = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Body $p1 -UseBasicParsing -TimeoutSec 30
  Write-Host ('[search_my_robots] STATUS ' + $r1.StatusCode)
  Write-Host ('BODY ' + $r1.Content)
} catch {
  Write-Host ('[search_my_robots] ERR ' + $_.Exception.Message)
}

$p2 = '{"tool":"batch_send_robot_msg_to_users","arguments":{"robotCode":"test_robot","userIds":["fake_user_id_123"],"msgType":"markdown","title":"预约提醒","markdown":"测试"}}'
try {
  $r2 = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Body $p2 -UseBasicParsing -TimeoutSec 30
  Write-Host ('[batch_send] STATUS ' + $r2.StatusCode)
  Write-Host ('BODY ' + $r2.Content)
} catch {
  Write-Host ('[batch_send] ERR ' + $_.Exception.Message)
}
