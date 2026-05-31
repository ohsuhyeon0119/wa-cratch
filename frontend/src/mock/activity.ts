export type ActivityType = 'like' | 'view' | 'remix'

export type Activity = {
  type: ActivityType
  icon: string
  text: string         // JSX가 아닌 순수 string
  actor: string
  projectTitle: string
  time: string
}

export const MOCK_ACTIVITY: Activity[] = [
  { type: 'like', icon: '❤️', actor: '별동이', projectTitle: '냥이의 대모험', text: '별동이님이 "냥이의 대모험"을 좋아해요!', time: '10분 전' },
  { type: 'view', icon: '👁️', actor: '바다소녀', projectTitle: '바다 탐험', text: '바다소녀님이 "바다 탐험"을 봤어요', time: '1시간 전' },
  { type: 'remix', icon: '🔁', actor: '초등코더', projectTitle: '냥이의 대모험', text: '초등코더님이 "냥이의 대모험"을 리믹스했어요!', time: '3시간 전' },
  { type: 'like', icon: '❤️', actor: '우주선장', projectTitle: '나비 미로', text: '우주선장님이 "나비 미로"를 좋아해요!', time: '어제' },
]
