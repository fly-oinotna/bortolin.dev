import { makePage } from '@keystatic/astro/ui';
// @ts-expect-error modulo virtuale fornito da integration.mjs
import config from 'virtual:keystatic-config';

export const Keystatic = makePage(config);
