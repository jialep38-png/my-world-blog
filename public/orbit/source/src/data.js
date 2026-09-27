export const SITE = Object.freeze({ title: '思念若是一首诗', version: '0.12.3', storageKey: 'little-orbit.exploration.v1' });
// Coordinates and writing below are editable prototype content, not personal biography.
export const LANDMARKS = Object.freeze([
  { id: 'home', name: '月洞门', english: 'MOON GATE', icon: '⌂', color: '#a4b5a2', lat: 60, lon: 82, model: 'house', article: 'welcome.md', treasure: '初见的钥匙', message: '世界很大，先从认识自己开始。', summary: '关于这颗星球，以及它还没有写完的自我介绍。' },
  { id: 'journal', name: '听雨书亭', english: 'RAIN PAVILION', icon: '❋', color: '#78988b', lat: 28, lon: 55, model: 'garden', article: 'journal.md', treasure: '一枚书签', message: '把微小的发现写下来，它们终会长成花园。', summary: '用文字安放灵感，也记录日常里的小发现。' },
  { id: 'studio', name: '折纸工坊', english: 'PAPER STUDIO', icon: '◈', color: '#c9b897', lat: 25, lon: 122, model: 'studio', article: 'studio.md', treasure: '灵感齿轮', message: '不必等到完美，先让一个想法有形状。', summary: '作品、尝试，以及从想法到实现的过程。' },
  { id: 'lab', name: '流光塔', english: 'LIGHT TOWER', icon: '♜', color: '#7d9295', lat: -7, lon: 83, model: 'lighthouse', article: 'building.md', treasure: '一束微光', message: '每一次实验，都替下一步点亮一点光。', summary: '这颗小星球的开发手记与技术实验。' },
  { id: 'library', name: '竹简书阁', english: 'BAMBOO LIBRARY', icon: '▤', color: '#8a9b78', lat: 18, lon: -10, model: 'library', article: 'library.md', treasure: '折角的纸页', message: '好奇心，是可以随身携带的远方。', summary: '留给书籍、文章与值得反复阅读的句子。' },
  { id: 'observatory', name: '观星台', english: 'STAR TERRACE', icon: '◎', color: '#87939f', lat: -20, lon: 164, model: 'observatory', article: 'lookout.md', treasure: '星图碎片', message: '偶尔抬头，给未发生的故事留一个位置。', summary: '长期想做的事，以及尚未抵达的地方。' },
  { id: 'mail', name: '尺素邮亭', english: 'LETTER PAVILION', icon: '✉', color: '#a76656', lat: -30, lon: -70, model: 'mail', article: 'mail.md', treasure: '空白邮票', message: '一封真诚的来信，能让两个小世界相遇。', summary: '联系方式的预留入口；原型暂不收集信息。' },
  { id: 'camp', name: '松间茶寮', english: 'PINE TEAHOUSE', icon: '△', color: '#9f9874', lat: 52, lon: -108, model: 'camp', article: 'camp.md', treasure: '一颗松果', message: '走得慢一点，也是在认真地向前。', summary: '在忙碌之外，留一点不必急着解释的时间。' }
]);
export const landmarkById = (id) => LANDMARKS.find((item) => item.id === id);
