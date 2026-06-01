# 먼저 JWT 토큰 획득
POST {{base_url}}/auth/login
Content-Type: application/json
{
  "username": "test",
  "password": "test"
}

HTTP 200
[Captures]
token: jsonpath "$.access_token"


# GET /activity — 최근 활동 목록 (JWT 필요)
GET {{base_url}}/activity
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$" isCollection


# GET /activity — 토큰 없음 → 401
GET {{base_url}}/activity

HTTP 401
