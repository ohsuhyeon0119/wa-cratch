# POST /auth/register — 회원가입 성공
POST {{base_url}}/auth/register
Content-Type: application/json
{
  "username": "testuser_{{newUuid}}",
  "nickname": "새유저",
  "password": "password123"
}

HTTP 200
[Asserts]
jsonpath "$.access_token" isString
jsonpath "$.token_type" == "bearer"


# POST /auth/login — 로그인 성공 (test 계정)
POST {{base_url}}/auth/login
Content-Type: application/json
{
  "username": "test",
  "password": "test"
}

HTTP 200
[Captures]
token: jsonpath "$.access_token"
[Asserts]
jsonpath "$.access_token" isString
jsonpath "$.token_type" == "bearer"


# POST /auth/login — 잘못된 비밀번호 → 401
POST {{base_url}}/auth/login
Content-Type: application/json
{
  "username": "test",
  "password": "wrongpassword"
}

HTTP 401


# GET /users/me — 유효한 JWT로 유저 정보 조회
GET {{base_url}}/users/me
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$.username" == "test"
jsonpath "$.nickname" isString
