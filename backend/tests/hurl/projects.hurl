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


# GET /projects/{id} — 비공개 프로젝트는 소유자 토큰으로 조회
GET {{base_url}}/projects/{{project_id}}
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$.title" isString
jsonpath "$.author" isString


# PUT /projects/{id} — 공개로 전환 + 제목 수정
PUT {{base_url}}/projects/{{project_id}}
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "title": "수정된 프로젝트",
  "published": true
}

HTTP 200
[Asserts]
jsonpath "$.title" == "수정된 프로젝트"


# GET /projects/{id} — 공개 프로젝트는 인증 없이 조회 가능
GET {{base_url}}/projects/{{project_id}}

HTTP 200
[Asserts]
jsonpath "$.title" isString


# DELETE /projects/{id} — 프로젝트 삭제
DELETE {{base_url}}/projects/{{project_id}}
Authorization: Bearer {{token}}

HTTP 204


# ── #39: 비공개 프로젝트 접근 제어 ─────────────────────────────────

# 타인 계정 생성 → 토큰 획득
POST {{base_url}}/auth/register
Content-Type: application/json
{
  "username": "other_{{newUuid}}",
  "nickname": "타인",
  "password": "password123"
}

HTTP 200
[Captures]
other_token: jsonpath "$.access_token"


# 비공개 프로젝트 생성 (published 기본값 false)
POST {{base_url}}/projects
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "title": "비공개 프로젝트",
  "emoji": "🔒"
}

HTTP 201
[Captures]
private_id: jsonpath "$.id"
[Asserts]
jsonpath "$.id" isString


# 비공개 프로젝트 — 인증 없이 접근 → 404
GET {{base_url}}/projects/{{private_id}}

HTTP 404


# 비공개 프로젝트 — 타인 토큰으로 접근 → 404
GET {{base_url}}/projects/{{private_id}}
Authorization: Bearer {{other_token}}

HTTP 404


# 비공개 프로젝트 — 소유자 토큰으로 접근 → 200
GET {{base_url}}/projects/{{private_id}}
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$.title" == "비공개 프로젝트"


# 비공개 프로젝트 삭제
DELETE {{base_url}}/projects/{{private_id}}
Authorization: Bearer {{token}}

HTTP 204
