const rawSiteUrl = (process.env.SITE_URL ?? '').trim();
const siteUrl = rawSiteUrl ? rawSiteUrl.replace(/\/+$/, '') : '';
const hasSiteUrl = siteUrl.length > 0;
const fallbackSiteUrl = 'https://example.invalid';

if (!hasSiteUrl && process.env.NODE_ENV === 'production') {
  console.warn(
    '[astro-whono] SITE_URL is not set. RSS will use example.invalid; canonical/og will be omitted; sitemap will not be generated and robots will not include Sitemap.'
  );
}

export const site = {
  url: hasSiteUrl ? siteUrl : fallbackSiteUrl,
  title: '霁风的小圈',
  brandTitle: 'Ji_Feng',
  author: '霁风',
  authorAvatar: 'author/avatar.jpg',
  description: '什么都发的小圈'
};

export const PAGE_SIZE_ARCHIVE = 12;
export const PAGE_SIZE_ESSAY = 12;

export { hasSiteUrl, siteUrl };
