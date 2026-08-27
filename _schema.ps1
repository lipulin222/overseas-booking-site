$url = 'https://mcp-gw.dingtalk.com/server/e3f697ca21a83ff63130d287bd43a9f1d83c81d976224b46e02c5c0dcf1dc41a?key=9ccd0d504a5352232e96463f95bc93a9'
$hdrs = @{}
$hdrs['Accept'] = 'application/json, text/event-stream'
$body = '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
$r = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Headers $hdrs -Body $body -UseBasicParsing -TimeoutSec 20
$obj = $r.Content | ConvertFrom-Json
$tool = $obj.result.tools | Where-Object { $_.name -eq 'batch_send_robot_msg_to_users' }
$schema = $tool.inputSchema | ConvertTo-Json -Depth 10
Write-Host $schema
