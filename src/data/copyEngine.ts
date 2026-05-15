// 9-segment time-based copy engine for the 摸鱼倒计时 app

interface TimeSegment {
  start: number // hour (inclusive)
  end: number   // hour (exclusive)
  label: string
  messages: readonly string[]
}

const SEGMENTS: TimeSegment[] = [
  {
    start: 0, end: 6,
    label: '凌晨修仙',
    messages: [
      '深夜摸鱼，赛博苦行僧',
      '月亮都下班了，你还没',
      '凌晨的鱼，最安静，也最孤独',
      '这不叫加班，这叫通宵摸鱼',
      '还在？你是真勤奋还是摸鱼到天亮',
    ],
  },
  {
    start: 6, end: 8,
    label: '早安摸鱼',
    messages: [
      '早安，打工人！今天也是美好的摸鱼日',
      '太阳升起，上班不快感也升起',
      '早起的鱼儿有虫摸',
      '咖啡还没凉，斗志还没燃，先摸为敬',
      '黎明摸鱼，勇者无畏',
    ],
  },
  {
    start: 8, end: 9,
    label: '通勤摸鱼',
    messages: [
      '通勤途中，摸鱼预热中',
      '公交/地铁上的摸鱼是最纯粹的摸鱼',
      '挤着地铁，想着摸鱼，这就是生活',
      '正在赶往工位，心已在摸鱼路上',
      '上班前最后的自由时光，请好好珍惜',
    ],
  },
  {
    start: 9, end: 11,
    label: '上午摸鱼',
    messages: [
      '假装在认真工作中...',
      '上午摸鱼黄金时段，效率 200%',
      '在工作夹缝中寻找摸鱼的诗意',
      '会议太多，摸鱼太少，需要平衡',
      '摸鱼≠不工作，是工作之禅',
    ],
  },
  {
    start: 11, end: 13,
    label: '午饭倒计时',
    messages: [
      '肚子已经在催了，上班不如等饭香',
      '饿着肚子摸鱼，效率加倍',
      '吃饭是头等大事，其余皆摸鱼',
      '午饭前最后冲刺，摸鱼加速',
      '快了快了，再忍一忍就能去恰饭',
    ],
  },
  {
    start: 13, end: 14,
    label: '午后糊涂',
    messages: [
      '午饭已上，困意正浓，摸鱼最佳时机',
      '血糖波动期，摸鱼合情合理',
      '饭气攻心，神志不清，要求摸鱼',
      '眼皮重如鲸，键盘轻如羽，进入摸鱼半梦境',
      '午后一小时，摸鱼的黄金瞌睡时段',
    ],
  },
  {
    start: 14, end: 17,
    label: '下午觉醒',
    messages: [
      '越过昏昏欲睡，抵达清醒摸鱼',
      '下午醒来，重燃摸鱼斗志',
      '回血中，摸鱼续航启动',
      '下午茶时间，摸鱼续杯',
      '天色向晚，归心渐起，先摸为敬',
    ],
  },
  {
    start: 17, end: 18,
    label: '准备溜了',
    messages: [
      '最后一小时，做好撤退准备',
      '收拾心情，整理鱼具，准备下班',
      '桌面收拾好了吗？钥匙找到了吗？',
      '倒计时进入最后阶段，保持冷静',
      '坚持住！再忍一忍就是自由',
    ],
  },
  {
    start: 18, end: 24,
    label: '自由时间',
    messages: [
      '下班了！今天的摸鱼任务圆满完成',
      '恭喜！你成功度过了今天',
      '下班后的时间，才是真正的生活',
      '夜晚是属于自己的，好好犒劳自己',
      '摸鱼一天，收获满满，晚安',
    ],
  },
]

export interface SegmentInfo {
  label: string
  messages: readonly string[]
}

export function getSegmentInfo(hour: number): SegmentInfo {
  return SEGMENTS.find(s => hour >= s.start && hour < s.end) ?? SEGMENTS[SEGMENTS.length - 1]
}

export function getRandomMessage(hour: number): string {
  const seg = getSegmentInfo(hour)
  return seg.messages[Math.floor(Math.random() * seg.messages.length)]
}

export function getSegmentLabel(hour: number): string {
  return getSegmentInfo(hour).label
}
