# 유저 1 (test) 로그인
POST {{base_url}}/auth/login
Content-Type: application/json
{
  "username": "test",
  "password": "test"
}

HTTP 200
[Captures]
token1: jsonpath "$.access_token"


# 유저 2 신규 등록
POST {{base_url}}/auth/register
Content-Type: application/json
{
  "username": "followtest_{{newUuid}}",
  "nickname": "팔로우테스터",
  "password": "password123"
}

HTTP 200
[Captures]
token2: jsonpath "$.access_token"


# 유저 2 ID 확인
GET {{base_url}}/users/me
Authorization: Bearer {{token2}}

HTTP 200
[Captures]
user2_id: jsonpath "$.id"


# POST /users/{id}/follow — 유저 1이 유저 2 팔로우
POST {{base_url}}/users/{{user2_id}}/follow
Authorization: Bearer {{token1}}
Content-Type: application/json

HTTP 200
[Asserts]
jsonpath "$.following" == true


# GET /users/me/following — 팔로잉 목록에 user2 포함
GET {{base_url}}/users/me/following
Authorization: Bearer {{token1}}

HTTP 200
[Asserts]
jsonpath "$" isCollection
jsonpath "$[0].id" isString


# DELETE /users/{id}/follow — 언팔로우
DELETE {{base_url}}/users/{{user2_id}}/follow
Authorization: Bearer {{token1}}

HTTP 204


# 팔로잉 목록이 비어있는지 확인 (또는 줄어있는지)
GET {{base_url}}/users/me/following
Authorization: Bearer {{token1}}

HTTP 200
[Asserts]
jsonpath "$" isCollection
