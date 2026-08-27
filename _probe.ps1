$url = 'https://mcp-gw.dingtalk.com/server/e3f697ca21a83ff63130d287bd43a9f1d83c81d976224b46e02c5c0dcf1dc41a?key=9ccd0d504a5352232e96463f95bc93a9'
$hdrs = @{}
$hdrs['Accept'] = 'application/json, text/event-stream'
$call = '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_my_robots","arguments":{"currentPage":1,"pageSize":10}}}'
try {
  $r = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Headers $hdrs -Body $call -UseBasicParsing -TimeoutSec 25
  Write-Host ('CALL STATUS: ' + $r.StatusCode)
  Write-Host ('CALL BODY: ' + $r.Content)
} catch {
  Write-Host ('CALL ERR: ' + $_.Exception.Message)
}
