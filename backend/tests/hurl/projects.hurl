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


# GET /projects — 공개 프로젝트 목록
GET {{base_url}}/projects

HTTP 200
[Asserts]
jsonpath "$" isCollection


# GET /projects?sort=likes — 좋아요순 정렬
GET {{base_url}}/projects?sort=likes

HTTP 200
[Asserts]
jsonpath "$" isCollection


# GET /projects/me — 내 프로젝트 목록 (JWT 필요)
GET {{base_url}}/projects/me
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$" isCollection


# POST /projects — 프로젝트 생성
POST {{base_url}}/projects
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "title": "테스트 프로젝트",
  "emoji": "🐱",
  "description": "테스트용",
  "tags": ["테스트"]
}

HTTP 201
[Captures]
project_id: jsonpath "$.id"
[Asserts]
jsonpath "$.id" isString
jsonpath "$.title" == "테스트 프로젝트"


# GET /projects/{id} — 인증 없이 누구나 조회 가능
GET {{base_url}}/projects/{{project_id}}

HTTP 200
[Asserts]
jsonpath "$.title" isString
jsonpath "$.author" isString


# PUT /projects/{id} — 제목 수정
PUT {{base_url}}/projects/{{project_id}}
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "title": "수정된 프로젝트"
}

HTTP 200
[Asserts]
jsonpath "$.title" == "수정된 프로젝트"


# DELETE /projects/{id} — 프로젝트 삭제
DELETE {{base_url}}/projects/{{project_id}}
Authorization: Bearer {{token}}

HTTP 204
