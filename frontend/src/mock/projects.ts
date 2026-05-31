export type Project = {
  id: number
  title: string
  author: string        // 닉네임 (표시용)
  authorId: number
  emoji: string
  likes: number
  views: number         // 숫자 타입
  published: boolean
  description: string
  tags: string[]
}

export const MOCK_PROJECTS: Project[] = [
  { id: 1, title: '냥이 점프', author: '코딩고양이', authorId: 1, emoji: '🐱', likes: 234, views: 1200, published: true, description: '냥이와 함께 장애물을 피하며 달려가요!', tags: ['게임', '냥이', '달리기'] },
  { id: 2, title: '바다 탐험', author: '바다소녀', authorId: 2, emoji: '🌊', likes: 189, views: 876, published: true, description: '깊은 바다 속을 탐험해봐요!', tags: ['탐험', '바다'] },
  { id: 3, title: '별 수집하기', author: '별동이', authorId: 3, emoji: '🌟', likes: 312, views: 2100, published: true, description: '하늘의 별을 모두 모아봐요!', tags: ['별', '수집'] },
  { id: 4, title: '나비 미로', author: '초등코더', authorId: 4, emoji: '🦋', likes: 156, views: 654, published: true, description: '미로를 탈출하는 나비를 도와주세요.', tags: ['미로', '나비'] },
  { id: 5, title: '토끼 달리기', author: '토끼야', authorId: 5, emoji: '🐰', likes: 201, views: 920, published: true, description: '빠른 토끼를 조종해봐요!', tags: ['달리기', '토끼'] },
  { id: 6, title: '무지개 그림판', author: '색깔왕', authorId: 6, emoji: '🌈', likes: 278, views: 1500, published: true, description: '무지개 색으로 그림을 그려요!', tags: ['그림', '창작'] },
  { id: 7, title: '우주 여행', author: '우주선장', authorId: 7, emoji: '🚀', likes: 344, views: 2800, published: true, description: '우주를 누비는 모험을 떠나요!', tags: ['우주', '모험'] },
  { id: 8, title: '음악 연주', author: '피아노맨', authorId: 8, emoji: '🎵', likes: 198, views: 730, published: true, description: '나만의 음악을 만들어봐요!', tags: ['음악', '연주'] },
  { id: 9, title: '서커스 쇼', author: '마술사', authorId: 9, emoji: '🎪', likes: 167, views: 610, published: true, description: '신기한 서커스 공연을 펼쳐요!', tags: ['공연', '서커스'] },
  { id: 10, title: '정원 가꾸기', author: '초록이', authorId: 10, emoji: '🌿', likes: 145, views: 523, published: true, description: '예쁜 꽃과 나무를 키워요!', tags: ['자연', '정원'] },
]

// Dashboard용 (내 프로젝트) - authorId: 0이 현재 유저
export const MY_PROJECTS: Project[] = [
  { id: 11, title: '냥이의 대모험', author: '코딩냥이', authorId: 0, emoji: '🐱', likes: 234, views: 1200, published: true, description: '', tags: [] },
  { id: 12, title: '바다 탐험', author: '코딩냥이', authorId: 0, emoji: '🌊', likes: 89, views: 430, published: true, description: '', tags: [] },
  { id: 13, title: '별 수집 게임 (작업중)', author: '코딩냥이', authorId: 0, emoji: '🌟', likes: 0, views: 0, published: false, description: '', tags: [] },
  { id: 14, title: '나비 미로', author: '코딩냥이', authorId: 0, emoji: '🦋', likes: 56, views: 234, published: true, description: '', tags: [] },
  { id: 15, title: '토끼 달리기', author: '코딩냥이', authorId: 0, emoji: '🐰', likes: 45, views: 189, published: true, description: '', tags: [] },
  { id: 16, title: '무지개 그림판', author: '코딩냥이', authorId: 0, emoji: '🌈', likes: 0, views: 0, published: false, description: '', tags: [] },
]
