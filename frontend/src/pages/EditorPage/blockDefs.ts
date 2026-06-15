import * as Blockly from 'blockly'

export let spriteListForDropdown: [string, string][] = [['와냥이', '와냥이']]

export function updateSpriteListForDropdown(sprites: Array<{ id: string; name: string }>) {
  spriteListForDropdown = sprites.length > 0
    ? sprites.map(s => [s.name, s.name] as [string, string])
    : [['(없음)', '__none__']]
}

let registered = false

export function registerBlocks() {
  if (registered) return
  registered = true
  Blockly.defineBlocksWithJsonArray([
    // ── CONTROL ──
    {
      type: 'wc_start',
      message0: '🚀 시작했을 때',
      nextStatement: null,
      colour: '#FFD23F',
      tooltip: '실행하기 버튼을 누르면 아래 블록을 실행합니다',
    },
    {
      type: 'wc_repeat',
      message0: '%1 번 반복하기',
      args0: [{ type: 'field_number', name: 'TIMES', value: 10, min: 1 }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FFD23F',
      tooltip: '블록을 N번 반복합니다',
    },
    {
      type: 'wc_forever',
      message0: '🔄 계속 반복하기',
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      colour: '#FFD23F',
      tooltip: '블록을 계속 반복합니다',
    },
    {
      type: 'wc_if',
      message0: '만약 %1 이라면',
      args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FFD23F',
      tooltip: '조건이 참이면 블록을 실행합니다',
    },
    {
      type: 'wc_if_else',
      message0: '만약 %1 이라면',
      args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      message2: '아니라면',
      message3: '%1',
      args3: [{ type: 'input_statement', name: 'ELSE' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FFD23F',
      tooltip: '조건이 참이면 첫 번째 블록, 거짓이면 두 번째 블록을 실행합니다',
    },
    {
      type: 'wc_wait',
      message0: '%1 초 기다리기',
      args0: [{ type: 'field_number', name: 'SECS', value: 1, min: 0.1, precision: 0.1 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FFD23F',
      tooltip: 'N초 동안 기다립니다',
    },
    {
      type: 'wc_stop_all',
      message0: '⏹ 모두 멈추기',
      previousStatement: null,
      colour: '#FFD23F',
      tooltip: '실행 중인 모든 블록을 멈춥니다',
    },
    {
      type: 'wc_repeat_until',
      message0: '~ 될 때까지 반복 %1',
      args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FFD23F',
      tooltip: '조건이 참이 될 때까지 반복합니다',
    },

    // ── MOTION ──
    {
      type: 'wc_move_steps',
      message0: '%1 만큼 이동하기',
      args0: [{ type: 'field_number', name: 'STEPS', value: 10 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '현재 방향으로 N만큼 이동합니다',
    },
    {
      type: 'wc_move_dir',
      message0: '%1 으로 %2 이동',
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIR',
          options: [
            ['위쪽', 'UP'],
            ['아래쪽', 'DOWN'],
            ['오른쪽', 'RIGHT'],
            ['왼쪽', 'LEFT'],
          ],
        },
        { type: 'field_number', name: 'STEPS', value: 10, min: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '방향으로 N만큼 이동합니다',
    },
    {
      type: 'wc_go_to',
      message0: 'x: %1 y: %2 로 이동',
      args0: [
        { type: 'field_number', name: 'X', value: 0 },
        { type: 'field_number', name: 'Y', value: 0 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '지정한 좌표로 이동합니다',
    },
    {
      type: 'wc_rotate',
      message0: '%1 도 회전하기',
      args0: [{ type: 'field_number', name: 'DEGREES', value: 15 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: 'N도 회전합니다',
    },
    {
      type: 'wc_reset_pos',
      message0: '처음 위치로 가기',
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '스프라이트를 처음 위치(0,0)로 이동합니다',
    },
    {
      type: 'wc_change_x',
      message0: 'x 좌표를 %1 만큼 바꾸기',
      args0: [{ type: 'field_number', name: 'DX', value: 10 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: 'x 좌표를 N만큼 바꿉니다',
    },
    {
      type: 'wc_change_y',
      message0: 'y 좌표를 %1 만큼 바꾸기',
      args0: [{ type: 'field_number', name: 'DY', value: 10 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: 'y 좌표를 N만큼 바꿉니다',
    },
    {
      type: 'wc_set_direction',
      message0: '방향을 %1 도로 정하기',
      args0: [{ type: 'input_value', name: 'VALUE', check: 'Number' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '스프라이트의 방향을 설정합니다 (90=오른쪽, 0=위, 180=아래, 270=왼쪽)',
    },
    {
      type: 'wc_bounce_wall',
      message0: '벽에서 튕기기',
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '벽에 닿으면 반대 방향으로 튕깁니다',
    },
    {
      type: 'wc_bounce_sides',
      message0: '3면에서 튕기기 (바닥 통과)',
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '왼쪽/오른쪽/위 벽에서만 튕기고 바닥은 통과합니다 (벽돌깨기 전용)',
    },
    {
      type: 'wc_glide_to',
      message0: '%1 초 동안 x: %2 y: %3 으로 이동',
      args0: [
        { type: 'field_number', name: 'SECS', value: 1, min: 0.1, precision: 0.1 },
        { type: 'field_number', name: 'X', value: 0 },
        { type: 'field_number', name: 'Y', value: 0 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: 'N초 동안 부드럽게 이동합니다',
    },

    // ── SENSING ──
    {
      type: 'wc_key_hat_up',
      message0: '↑ 위 키 눌렸을 때',
      nextStatement: null,
      colour: '#2EC4B6',
      tooltip: '위쪽 화살표 키를 누르면 아래 블록을 실행합니다',
    },
    {
      type: 'wc_key_hat_down',
      message0: '↓ 아래 키 눌렸을 때',
      nextStatement: null,
      colour: '#2EC4B6',
      tooltip: '아래쪽 화살표 키를 누르면 아래 블록을 실행합니다',
    },
    {
      type: 'wc_key_hat_left',
      message0: '← 왼쪽 키 눌렸을 때',
      nextStatement: null,
      colour: '#2EC4B6',
      tooltip: '왼쪽 화살표 키를 누르면 아래 블록을 실행합니다',
    },
    {
      type: 'wc_key_hat_right',
      message0: '→ 오른쪽 키 눌렸을 때',
      nextStatement: null,
      colour: '#2EC4B6',
      tooltip: '오른쪽 화살표 키를 누르면 아래 블록을 실행합니다',
    },
    {
      type: 'wc_key_hat_space',
      message0: '스페이스 눌렸을 때',
      nextStatement: null,
      colour: '#2EC4B6',
      tooltip: '스페이스 키를 누르면 아래 블록을 실행합니다',
    },
    {
      type: 'wc_key_pressed',
      message0: '%1 키가 눌려있는가?',
      args0: [
        {
          type: 'field_dropdown',
          name: 'KEY',
          options: [
            ['↑ 위', 'ArrowUp'],
            ['↓ 아래', 'ArrowDown'],
            ['← 왼쪽', 'ArrowLeft'],
            ['→ 오른쪽', 'ArrowRight'],
            ['스페이스', ' '],
          ],
        },
      ],
      output: 'Boolean',
      colour: '#2EC4B6',
      tooltip: '지정한 키가 지금 눌려있으면 참을 반환합니다',
    },
    {
      type: 'wc_wall_touching',
      message0: '벽에 닿았는가?',
      output: 'Boolean',
      colour: '#2EC4B6',
      tooltip: '스프라이트가 벽에 닿으면 참을 반환합니다',
    },
    {
      type: 'wc_mouse_click_hat',
      message0: '마우스를 클릭했을 때',
      nextStatement: null,
      colour: '#2EC4B6',
      tooltip: '마우스를 클릭하면 아래 블록을 실행합니다',
    },

    // ── SPEECH ──
    {
      type: 'wc_say',
      message0: '💬 %1 이라고 말하기',
      args0: [{ type: 'field_input', name: 'TEXT', text: '안녕!' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF85A1',
      tooltip: '말풍선을 표시합니다',
    },
    {
      type: 'wc_say_for',
      message0: '💬 %1 을(를) %2 초 동안 말하기',
      args0: [
        { type: 'field_input', name: 'TEXT', text: '안녕!' },
        { type: 'field_number', name: 'SECS', value: 2, min: 0.1, precision: 0.1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF85A1',
      tooltip: 'N초 동안 말풍선을 표시합니다',
    },
    {
      type: 'wc_clear_speech',
      message0: '말풍선 지우기',
      previousStatement: null,
      nextStatement: null,
      colour: '#FF85A1',
      tooltip: '말풍선을 지웁니다',
    },

    // ── LOOKS ──
    {
      type: 'wc_show',
      message0: '보이기',
      previousStatement: null,
      nextStatement: null,
      colour: '#A855F7',
      tooltip: '스프라이트를 보이게 합니다',
    },
    {
      type: 'wc_hide',
      message0: '숨기기',
      previousStatement: null,
      nextStatement: null,
      colour: '#A855F7',
      tooltip: '스프라이트를 숨깁니다',
    },
    {
      type: 'wc_set_size',
      message0: '크기를 %1 % 로 설정',
      args0: [{ type: 'field_number', name: 'SIZE', value: 100, min: 10, max: 400 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#A855F7',
      tooltip: '스프라이트 크기를 설정합니다',
    },
    {
      type: 'wc_change_size',
      message0: '크기를 %1 키우기',
      args0: [{ type: 'field_number', name: 'DELTA', value: 10 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#A855F7',
      tooltip: '스프라이트 크기를 변경합니다',
    },

    // ── SOUND (stub) ──
    {
      type: 'wc_play_sound',
      message0: '🎵 소리 재생하기',
      previousStatement: null,
      nextStatement: null,
      colour: '#3B82F6',
      tooltip: '소리를 재생합니다 (준비 중)',
    },
    {
      type: 'wc_stop_sound',
      message0: '소리 멈추기',
      previousStatement: null,
      nextStatement: null,
      colour: '#3B82F6',
      tooltip: '소리를 멈춥니다 (준비 중)',
    },

    // ── VARIABLES ──
    {
      type: 'wc_var_set',
      message0: '변수 %1 을(를) %2 으로 정하기',
      args0: [
        { type: 'field_input', name: 'NAME', text: '점수' },
        { type: 'input_value', name: 'VALUE', check: 'Number' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#10B981',
      tooltip: '변수에 값을 저장합니다',
    },
    {
      type: 'wc_var_change',
      message0: '변수 %1 을(를) %2 만큼 바꾸기',
      args0: [
        { type: 'field_input', name: 'NAME', text: '점수' },
        { type: 'input_value', name: 'VALUE', check: 'Number' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#10B981',
      tooltip: '변수 값을 N만큼 바꿉니다',
    },
    {
      type: 'wc_var_get',
      message0: '변수 %1',
      args0: [{ type: 'field_input', name: 'NAME', text: '점수' }],
      output: 'Number',
      colour: '#10B981',
      tooltip: '변수의 현재 값을 반환합니다',
    },

    // ── MATH / OPERATORS ──
    {
      type: 'wc_random',
      message0: '%1 부터 %2 사이 랜덤',
      args0: [
        { type: 'input_value', name: 'FROM', check: 'Number' },
        { type: 'input_value', name: 'TO', check: 'Number' },
      ],
      output: 'Number',
      colour: '#8B5CF6',
      tooltip: '지정 범위에서 무작위 정수를 반환합니다',
    },
    {
      type: 'wc_add',
      message0: '%1 + %2',
      args0: [
        { type: 'input_value', name: 'A', check: 'Number' },
        { type: 'input_value', name: 'B', check: 'Number' },
      ],
      output: 'Number',
      colour: '#8B5CF6',
      tooltip: '두 수를 더합니다',
    },
    {
      type: 'wc_sub',
      message0: '%1 - %2',
      args0: [
        { type: 'input_value', name: 'A', check: 'Number' },
        { type: 'input_value', name: 'B', check: 'Number' },
      ],
      output: 'Number',
      colour: '#8B5CF6',
      tooltip: '두 수를 뺍니다',
    },
    {
      type: 'wc_mul',
      message0: '%1 × %2',
      args0: [
        { type: 'input_value', name: 'A', check: 'Number' },
        { type: 'input_value', name: 'B', check: 'Number' },
      ],
      output: 'Number',
      colour: '#8B5CF6',
      tooltip: '두 수를 곱합니다',
    },
    {
      type: 'wc_div',
      message0: '%1 ÷ %2',
      args0: [
        { type: 'input_value', name: 'A', check: 'Number' },
        { type: 'input_value', name: 'B', check: 'Number' },
      ],
      output: 'Number',
      colour: '#8B5CF6',
      tooltip: '두 수를 나눕니다',
    },
    {
      type: 'wc_gt',
      message0: '%1 > %2',
      args0: [
        { type: 'input_value', name: 'A', check: 'Number' },
        { type: 'input_value', name: 'B', check: 'Number' },
      ],
      output: 'Boolean',
      colour: '#8B5CF6',
      tooltip: '왼쪽이 오른쪽보다 크면 참',
    },
    {
      type: 'wc_lt',
      message0: '%1 < %2',
      args0: [
        { type: 'input_value', name: 'A', check: 'Number' },
        { type: 'input_value', name: 'B', check: 'Number' },
      ],
      output: 'Boolean',
      colour: '#8B5CF6',
      tooltip: '왼쪽이 오른쪽보다 작으면 참',
    },
    {
      type: 'wc_eq',
      message0: '%1 = %2',
      args0: [
        { type: 'input_value', name: 'A', check: 'Number' },
        { type: 'input_value', name: 'B', check: 'Number' },
      ],
      output: 'Boolean',
      colour: '#8B5CF6',
      tooltip: '두 값이 같으면 참',
    },
    {
      type: 'wc_num_literal',
      message0: '%1',
      args0: [{ type: 'field_number', name: 'NUM', value: 0 }],
      output: 'Number',
      colour: '#8B5CF6',
      tooltip: '숫자 값',
    },

    // ── MOUSE SENSING ──
    {
      type: 'wc_mouse_x',
      message0: '마우스 x 좌표',
      output: 'Number',
      colour: '#2EC4B6',
      tooltip: '마우스 커서의 스테이지 x 좌표를 반환합니다',
    },
    {
      type: 'wc_mouse_y',
      message0: '마우스 y 좌표',
      output: 'Number',
      colour: '#2EC4B6',
      tooltip: '마우스 커서의 스테이지 y 좌표를 반환합니다',
    },
    {
      type: 'wc_set_x_to_mouse',
      message0: 'x 좌표를 마우스 위치로 설정',
      previousStatement: null,
      nextStatement: null,
      colour: '#2EC4B6',
      tooltip: '스프라이트의 x 좌표를 마우스 x 위치로 이동합니다 (패들 제어에 유용)',
    },

    // ── SCORE / LIVES ──
    {
      type: 'wc_lives_set',
      message0: '목숨을 %1 개로 설정',
      args0: [{ type: 'field_number', name: 'VALUE', value: 3, min: 0 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#F59E0B',
      tooltip: '목숨 수를 설정합니다',
    },
    {
      type: 'wc_lives_change',
      message0: '목숨 %1 개 바꾸기',
      args0: [{ type: 'field_number', name: 'DELTA', value: -1 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#F59E0B',
      tooltip: '목숨 수를 변경합니다',
    },
    {
      type: 'wc_lives_get',
      message0: '현재 목숨',
      output: 'Number',
      colour: '#F59E0B',
      tooltip: '현재 목숨 수를 반환합니다',
    },
    {
      type: 'wc_score_add',
      message0: '점수 %1 추가',
      args0: [{ type: 'input_value', name: 'VALUE', check: 'Number' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: '#F59E0B',
      tooltip: '게임 점수를 지정한 값만큼 올립니다',
    },
    {
      type: 'wc_score_reset',
      message0: '점수 초기화',
      previousStatement: null,
      nextStatement: null,
      colour: '#F59E0B',
      tooltip: '게임 점수를 0으로 초기화합니다',
    },

    // ── CLONE ──
    {
      type: 'wc_when_clone_start',
      message0: '🔴 복제되었을 때',
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '이 스프라이트가 복제되면 아래 블록을 실행합니다',
    },
    {
      type: 'wc_clone_self',
      message0: '나 자신 복제하기',
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '이 스프라이트의 복제본을 만듭니다',
    },
    {
      type: 'wc_delete_clone',
      message0: '이 복제본 삭제',
      previousStatement: null,
      nextStatement: null,
      colour: '#FF6B35',
      tooltip: '복제본이면 이 복제본을 삭제합니다',
    },

    // ── LOOKS (additional) ──
    {
      type: 'wc_delete_sprite',
      message0: '이 스프라이트 삭제',
      previousStatement: null,
      nextStatement: null,
      colour: '#A855F7',
      tooltip: '이 스프라이트를 스테이지에서 삭제합니다',
    },

    // ── PHYSICS ──
    {
      type: 'wc_set_vx',
      message0: 'x 속도를 %1 으로 설정',
      args0: [{ type: 'input_value', name: 'VALUE', check: 'Number' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#059669',
      tooltip: 'x 방향 속도를 설정합니다',
    },
    {
      type: 'wc_set_vy',
      message0: 'y 속도를 %1 으로 설정',
      args0: [{ type: 'input_value', name: 'VALUE', check: 'Number' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#059669',
      tooltip: 'y 방향 속도를 설정합니다',
    },
    {
      type: 'wc_change_vx',
      message0: 'x 속도를 %1 만큼 바꾸기',
      args0: [{ type: 'input_value', name: 'VALUE', check: 'Number' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#059669',
      tooltip: 'x 방향 속도를 N만큼 바꿉니다',
    },
    {
      type: 'wc_change_vy',
      message0: 'y 속도를 %1 만큼 바꾸기',
      args0: [{ type: 'input_value', name: 'VALUE', check: 'Number' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#059669',
      tooltip: 'y 방향 속도를 N만큼 바꿉니다',
    },
    {
      type: 'wc_apply_velocity',
      message0: '속도대로 이동하기',
      previousStatement: null,
      nextStatement: null,
      colour: '#059669',
      tooltip: '현재 속도(vx, vy)만큼 이동합니다',
    },
    {
      type: 'wc_apply_gravity',
      message0: '중력 적용 (중력: %1)',
      args0: [{ type: 'input_value', name: 'GRAVITY', check: 'Number' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#059669',
      tooltip: 'y 속도에 중력을 적용합니다 (vy -= gravity)',
    },
    {
      type: 'wc_get_vx',
      message0: 'x 속도',
      output: 'Number',
      colour: '#059669',
      tooltip: '현재 x 방향 속도를 반환합니다',
    },
    {
      type: 'wc_get_vy',
      message0: 'y 속도',
      output: 'Number',
      colour: '#059669',
      tooltip: '현재 y 방향 속도를 반환합니다',
    },
    {
      type: 'wc_get_direction',
      message0: '현재 방향',
      output: 'Number',
      colour: '#059669',
      tooltip: '현재 방향을 도(°) 단위로 반환합니다',
    },
    {
      type: 'wc_on_floor',
      message0: '바닥에 닿았는가?',
      output: 'Boolean',
      colour: '#059669',
      tooltip: '스프라이트가 바닥 벽에 닿으면 참을 반환합니다',
    },
  ])

  Blockly.Blocks['wc_touching_sprite'] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(() => spriteListForDropdown), 'SPRITE')
        .appendField('에 닿았는가?')
      this.setOutput(true, 'Boolean')
      this.setColour('#2EC4B6')
      this.setTooltip('다른 스프라이트에 닿으면 참을 반환합니다')
    }
  }

  Blockly.Blocks['wc_sprite_x_of'] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(() => spriteListForDropdown), 'SPRITE')
        .appendField('의 x 좌표')
      this.setOutput(true, 'Number')
      this.setColour('#2EC4B6')
      this.setTooltip('지정한 스프라이트의 x 좌표를 반환합니다')
    }
  }

  Blockly.Blocks['wc_sprite_y_of'] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(() => spriteListForDropdown), 'SPRITE')
        .appendField('의 y 좌표')
      this.setOutput(true, 'Number')
      this.setColour('#2EC4B6')
      this.setTooltip('지정한 스프라이트의 y 좌표를 반환합니다')
    }
  }
}

export const TOOLBOX_CONFIG = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '🔄 제어',
      colour: '#FFD23F',
      contents: [
        { kind: 'block', type: 'wc_start' },
        { kind: 'block', type: 'wc_repeat' },
        { kind: 'block', type: 'wc_forever' },
        { kind: 'block', type: 'wc_repeat_until' },
        { kind: 'block', type: 'wc_if' },
        { kind: 'block', type: 'wc_if_else' },
        { kind: 'block', type: 'wc_wait' },
        { kind: 'block', type: 'wc_stop_all' },
      ],
    },
    {
      kind: 'category',
      name: '🔴 복제',
      colour: '#FF6B35',
      contents: [
        { kind: 'block', type: 'wc_when_clone_start' },
        { kind: 'block', type: 'wc_clone_self' },
        { kind: 'block', type: 'wc_delete_clone' },
      ],
    },
    {
      kind: 'category',
      name: '🏃 움직임',
      colour: '#FF6B35',
      contents: [
        { kind: 'block', type: 'wc_move_steps' },
        { kind: 'block', type: 'wc_move_dir' },
        { kind: 'block', type: 'wc_go_to' },
        { kind: 'block', type: 'wc_change_x' },
        { kind: 'block', type: 'wc_change_y' },
        { kind: 'block', type: 'wc_glide_to' },
        { kind: 'block', type: 'wc_rotate' },
        {
          kind: 'block', type: 'wc_set_direction',
          inputs: { VALUE: { shadow: { type: 'wc_num_literal', fields: { NUM: 90 } } } },
        },
        { kind: 'block', type: 'wc_bounce_wall' },
        { kind: 'block', type: 'wc_bounce_sides' },
        { kind: 'block', type: 'wc_reset_pos' },
      ],
    },
    {
      kind: 'category',
      name: '👀 감지',
      colour: '#2EC4B6',
      contents: [
        { kind: 'block', type: 'wc_key_hat_up' },
        { kind: 'block', type: 'wc_key_hat_down' },
        { kind: 'block', type: 'wc_key_hat_left' },
        { kind: 'block', type: 'wc_key_hat_right' },
        { kind: 'block', type: 'wc_key_hat_space' },
        { kind: 'block', type: 'wc_mouse_click_hat' },
        { kind: 'block', type: 'wc_key_pressed' },
        { kind: 'block', type: 'wc_wall_touching' },
        { kind: 'block', type: 'wc_mouse_x' },
        { kind: 'block', type: 'wc_mouse_y' },
        { kind: 'block', type: 'wc_set_x_to_mouse' },
        { kind: 'block', type: 'wc_touching_sprite' },
        { kind: 'block', type: 'wc_sprite_x_of' },
        { kind: 'block', type: 'wc_sprite_y_of' },
      ],
    },
    {
      kind: 'category',
      name: '💬 말풍선',
      colour: '#FF85A1',
      contents: [
        { kind: 'block', type: 'wc_say' },
        { kind: 'block', type: 'wc_say_for' },
        { kind: 'block', type: 'wc_clear_speech' },
      ],
    },
    {
      kind: 'category',
      name: '✨ 모양',
      colour: '#A855F7',
      contents: [
        { kind: 'block', type: 'wc_show' },
        { kind: 'block', type: 'wc_hide' },
        { kind: 'block', type: 'wc_set_size' },
        { kind: 'block', type: 'wc_change_size' },
        { kind: 'block', type: 'wc_delete_sprite' },
      ],
    },
    {
      kind: 'category',
      name: '🎵 소리',
      colour: '#3B82F6',
      contents: [
        { kind: 'block', type: 'wc_play_sound' },
        { kind: 'block', type: 'wc_stop_sound' },
      ],
    },
    {
      kind: 'category',
      name: '📊 변수',
      colour: '#10B981',
      contents: [
        { kind: 'block', type: 'wc_var_set' },
        { kind: 'block', type: 'wc_var_change' },
        { kind: 'block', type: 'wc_var_get' },
      ],
    },
    {
      kind: 'category',
      name: '🏆 점수',
      colour: '#F59E0B',
      contents: [
        {
          kind: 'block',
          type: 'wc_score_add',
          inputs: { VALUE: { shadow: { type: 'wc_num_literal', fields: { NUM: 1 } } } },
        },
        { kind: 'block', type: 'wc_score_reset' },
        { kind: 'block', type: 'wc_lives_set' },
        { kind: 'block', type: 'wc_lives_change' },
      ],
    },
    {
      kind: 'category',
      name: '🔢 연산',
      colour: '#8B5CF6',
      contents: [
        { kind: 'block', type: 'wc_num_literal' },
        { kind: 'block', type: 'wc_random' },
        { kind: 'block', type: 'wc_add' },
        { kind: 'block', type: 'wc_sub' },
        { kind: 'block', type: 'wc_mul' },
        { kind: 'block', type: 'wc_div' },
        { kind: 'block', type: 'wc_gt' },
        { kind: 'block', type: 'wc_lt' },
        { kind: 'block', type: 'wc_eq' },
      ],
    },
    {
      kind: 'category',
      name: '⚡ 물리',
      colour: '#059669',
      contents: [
        { kind: 'block', type: 'wc_set_vx' },
        { kind: 'block', type: 'wc_set_vy' },
        { kind: 'block', type: 'wc_change_vx' },
        { kind: 'block', type: 'wc_change_vy' },
        { kind: 'block', type: 'wc_apply_velocity' },
        { kind: 'block', type: 'wc_apply_gravity' },
        { kind: 'block', type: 'wc_get_vx' },
        { kind: 'block', type: 'wc_get_vy' },
        { kind: 'block', type: 'wc_get_direction' },
        { kind: 'block', type: 'wc_on_floor' },
      ],
    },
  ],
}
