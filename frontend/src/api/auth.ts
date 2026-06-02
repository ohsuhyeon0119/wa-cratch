import client from './client'

export type UserResponse = {
  id: string
  username: string
  nickname: string
  avatar: string
  projectCount: number
  totalLikes: number
}

export type TokenResponse = {
  access_token: string
  token_type: string
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const response = await client.post<TokenResponse>('/auth/login', {
    username,
    password,
  })
  return response.data
}

export async function register(
  username: string,
  nickname: string,
  password: string
): Promise<TokenResponse> {
  const response = await client.post<TokenResponse>('/auth/register', {
    username,
    nickname,
    password,
  })
  return response.data
}

export async function getMe(): Promise<UserResponse> {
  const response = await client.get<UserResponse>('/users/me')
  return response.data
}
