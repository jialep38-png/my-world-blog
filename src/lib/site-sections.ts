export type SiteSection = {
  id: string
  label: string
  href: string
  description: string
}

export const siteSections: SiteSection[] = [
  {
    id: 'essay',
    label: '随笔',
    href: '/essay/',
    description: '长文章，想法与思考。'
  },
  {
    id: 'bits',
    label: '笔记',
    href: '/bits/',
    description: '项目复盘与实践沉淀。'
  },
  {
    id: 'archive',
    label: '归档',
    href: '/archive/',
    description: '按时间整理的公开内容。'
  },
  {
    id: 'projects',
    label: '项目',
    href: '/projects/',
    description: '做过的项目与玩过的东西。'
  },
  {
    id: 'memo',
    label: '小记',
    href: '/memo/',
    description: '日常片刻与回忆。'
  },
  {
    id: 'about',
    label: '关于',
    href: '/about/',
    description: '关于我和这个小圈。'
  }
]

export const quickLinkSections = siteSections.filter((section) =>
  ['essay', 'bits', 'archive', 'projects', 'memo'].includes(section.id)
)
