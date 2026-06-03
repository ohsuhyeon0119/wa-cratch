# JWT 토큰 획득
POST {{base_url}}/auth/login
Content-Type: application/json
{
  "username": "test",
  "password": "test"
}

HTTP 200
[Captures]
token: jsonpath "$.access_token"


# 테스트용 프로젝트 생성
POST {{base_url}}/projects
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "title": "좋아요 테스트 프로젝트",
  "emoji": "❤️",
  "description": "좋아요 기능 테스트용",
  "tags": []
}

HTTP 201
[Captures]
project_id: jsonpath "$.id"


# POST /projects/{id}/like — 좋아요 추가
POST {{base_url}}/projects/{{project_id}}/like
Authorization: Bearer {{token}}
Content-Type: application/json

HTTP 200
[Asserts]
jsonpath "$.liked" == true
jsonpath "$.likes" isInteger


# POST /projects/{id}/like 재호출 — 좋아요 취소 (토글)
POST {{base_url}}/projects/{{project_id}}/like
Authorization: Bearer {{token}}
Content-Type: application/json

HTTP 200
[Asserts]
jsonpath "$.liked" == false
jsonpath "$.likes" isInteger


# 비로그인 좋아요 → 401
POST {{base_url}}/projects/{{project_id}}/like
Content-Type: application/json

HTTP 401


# GET /projects/liked — 좋아요한 프로젝트 목록 (빈 배열도 200)
GET {{base_url}}/projects/liked
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$" isCollection
