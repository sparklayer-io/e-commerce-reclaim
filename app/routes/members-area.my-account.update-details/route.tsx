import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { initializeEcomApiForRequest } from '~/src/wix/ecom/session';

export async function action({ request }: ActionFunctionArgs) {
    const api = await initializeEcomApiForRequest(request);
    const formData = await request.formData();

    const userId = formData.get('userId') as string | undefined;

    if (!userId) {
        throw new Error('Missing user id');
    }

    const firstName = formData.get('firstName') as string | undefined;
    const lastName = formData.get('lastName') as string | undefined;
    const phoneNumber = formData.get('phoneNumber') as string | undefined;

    await api.updateUser(userId, {
        contact: {
            firstName,
            lastName,
            phones: phoneNumber ? [phoneNumber] : [],
        },
    });

    return redirect('/members-area/my-account');
}
