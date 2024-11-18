export const mockLoaderData = {
    user: {
        loginEmail: 'john.doe@codux.com',
        loginEmailVerified: true,
        status: 'APPROVED',
        contactId: 'aaa-bbb',
        contact: {
            contactId: 'aaa-bbb',
            firstName: 'John',
            lastName: 'Doe',
            phones: ['+1234567890'],
            emails: [],
            addresses: [
                {
                    addressLine: 'New York',
                    city: 'New York',
                    country: 'US',
                    postalCode: '100000',
                    _id: 'aaa-bbb',
                },
            ],
            customFields: {},
        },
        profile: {
            nickname: 'John Doe',
            slug: 'jogn_d',
            photo: {
                url: '',
                height: 0,
                width: 0,
                _id: '',
            },
        },
        privacyStatus: 'PRIVATE',
        activityStatus: 'ACTIVE',
        lastLoginDate: '2024-11-18T12:35:47Z',
        _id: '35dff1e1-a3a5-4ff6-945e-a2a5d1529ec7',
        _createdDate: '2024-10-28T15:11:04Z',
        _updatedDate: '2024-10-28T15:11:04.210Z',
    },
};
