# POST /agent/chat — JWT 없이 요청 → 401
POST {{base_url}}/agent/chat
Content-Type: application/json
{
  "message": "안녕",
  "history": [],
  "project_context": { "title": "테스트", "blocks_json": {} },
  "nickname": "테스터"
}

HTTP 401


# 로그인하여 토큰 발급
POST {{base_url}}/auth/login
Content-Type: application/json
{
  "username": "test",
  "password": "test"
}

HTTP 200
[Captures]
agent_token: jsonpath "$.access_token"


# POST /agent/chat — JWT 포함, 유효한 메시지 → 200 + text/event-stream
POST {{base_url}}/agent/chat
Authorization: Bearer {{agent_token}}
Content-Type: application/json
{
  "message": "안녕! 나는 누구야?",
  "history": [],
  "project_context": { "title": "테스트 프로젝트", "blocks_json": {} },
  "nickname": "테스터"
}

HTTP 200
[Asserts]
header "Content-Type" contains "text/event-stream"
body contains "data:"
