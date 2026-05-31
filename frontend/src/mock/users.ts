export type User = {
  id: number
  username: string
  nickname: string
  avatar: string       // emoji
  projectCount: number
  followers: number
  totalLikes: number
}

export const MOCK_USERS: User[] = [
  { id: 1, username: 'codingcat', nickname: '코딩고양이', avatar: '🐱', projectCount: 12, followers: 234, totalLikes: 3400 },
  { id: 2, username: 'seagirl', nickname: '바다소녀', avatar: '🌊', projectCount: 5, followers: 89, totalLikes: 1200 },
  { id: 3, username: 'starboy', nickname: '별동이', avatar: '🌟', projectCount: 8, followers: 156, totalLikes: 2100 },
]

export const CURRENT_USER: User = {
  id: 0,
  username: 'codingnyang',
  nickname: '코딩냥이',
  avatar: '🧇',
  projectCount: 6,
  followers: 42,
  totalLikes: 424,
}
