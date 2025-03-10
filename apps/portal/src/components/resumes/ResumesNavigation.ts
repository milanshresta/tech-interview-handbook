import type { ProductNavigationItems } from '~/components/global/ProductNavigation';

const navigation: ProductNavigationItems = [
  { children: [], href: '/resumes/submit', name: 'Submit for review' },
  {
    children: [],
    href: '/resumes/features',
    name: 'Features',
  },
  {
    children: [],
    href: '/resumes/about',
    name: 'About Us',
  },
  {
    children: [],
    href: 'https://www.techinterviewhandbook.org/resume/',
    name: 'Resume Guide',
    target: '_blank',
  },
];

const config = {
  googleAnalyticsMeasurementID: 'G-VFTWPMW1WK',
  navigation,
  showGlobalNav: false,
  title: 'Resumes',
  titleHref: '/resumes',
};

export default config;
