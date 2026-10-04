import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { getMenu } from '$lib/server/api/menu';
import { publicContext } from '$lib/server/context';

export const load: PageServerLoad = async (event) => {
	const result = await getMenu(publicContext(event));

	if (!result.ok) error(result.status === 404 ? 404 : 503, result.message);

	return { menu: result.data };
};
