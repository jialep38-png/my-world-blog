import type { ImageMetadata } from 'astro';

const photographs = import.meta.glob<{ default: ImageMetadata }>('../assets/planets/*/*.webp', { eager: true });
const photo = (world: string, name: string) => {
  const image = photographs[`../assets/planets/${world}/${name}.webp`]?.default;
  if (!image) throw new Error(`Missing planet photograph: ${world}/${name}`);
  return image;
};

const works = [
  {
    id: 'yesterday-today', title: '昨天，今天', english: 'Yesterday, Today',
    materials: '薄膜 · 花影 · 记忆透镜', tone: 'pearl',
    thought: '想靠近的距离，也被温柔地保存。',
    description: '粉紫的薄膜、花簇和羽毛，围着一枚无字的记忆透镜。那些将触未触的距离，被轻轻折进了同一个圆里。',
    note: '先看透明薄膜与花影的叠合，再绕到侧面。圆片、羽毛与细小的连接，把柔软的外缘接回中央。',
    details: [['detail-record', '无字的记忆透镜'], ['detail-feather', '羽毛与秋日压痕']],
  },
  {
    id: 'crossover', title: '删了一百遍', english: 'Deleted a Hundred Times',
    materials: '银箔 · 相纸 · 线缆', tone: 'silver',
    thought: '删去的瞬间，在下一张里回来。',
    description: '黑白相纸、折起的银箔和不对称的线缆，围绕唱片圆盘相接。留下的划痕和空白，像反复删除、又忍不住回看的心情。',
    note: '沿着黑线看一圈，留意相纸的覆印、揭起的边角，以及银色折面之间的空隙。',
    details: [['detail-disc', '圆盘与反复显影'], ['detail-proof', '揭起的校样与留白']],
  },
  {
    id: 'poem', title: '思念若是一首诗', english: 'If Longing Were a Poem',
    materials: '青瓷 · 册页 · 月下的河', tone: 'garden',
    thought: '水流了很远，那一页还没说完。',
    description: '展开的册页与纸石相接，竹笛、青瓷和细小的风景落在其间。一条河穿过层层折页，让思念有了可以慢慢经过的地方。',
    note: '看册页的翻角与反面，也看水岸边的小路。正面像一封展开的信，绕过去，会遇见纸张另一面的安静。',
    details: [['detail-inkstone', '青瓷与纸石的层次'], ['detail-flute', '竹笛经过的河流']],
  },
  {
    id: 'rain-finale', title: '雨终曲', english: 'Rain Finale',
    materials: '冷光 · 银纱 · 悬停的瞬间', tone: 'rain',
    thought: '终曲被按停，记忆仍在雨里。',
    description: '电蓝光穿过黑银的碎片，银纱与破碎的字形交叠。像一场雨在结束之前停了下来，把湿润的照片和最后一点回声留在其中。',
    note: '让目光顺着蓝色的光，走到银纱后面。侧面与背面的材料继续相接，保存着不同方向的雨意。',
    details: [['detail-light', '黑银之间的一束蓝'], ['detail-veil', '银纱后的湿润照片']],
  },
  {
    id: 'jielan', title: '芥兰', english: 'Jie Lan',
    materials: '青绿 · 纸布 · 蓝白瓷', tone: 'green',
    thought: '绕着日常，慢慢看一圈。',
    description: '枝根托住青绿的叶，瓷片、纸签与织物包覆成一颗饱满的小星球。餐具和玻璃带来熟悉的尺度，把日常的小事认真收好。',
    note: '从叶脉看向纸的毛边，再看布褶如何经过瓷片。细小的缝线和固定件，把不同触感连接在一起。',
    details: [['detail-leaves', '层间生长的青绿'], ['detail-linen', '松开之后的折痕']],
  },
] as const;

export const planets = works.map((work, index) => ({
  ...work,
  number: String(index + 1).padStart(2, '0'),
  cover: photo(work.id, 'cover'),
  photographs: [
    ...work.details.map(([name, caption]) => ({ image: photo(work.id, name), caption })),
    { image: photo(work.id, 'side'), caption: '侧面 · 折层之间的空气' },
    { image: photo(work.id, 'back'), caption: '背面 · 另一面的连接' },
  ],
}));
export type Planet = typeof planets[number];
