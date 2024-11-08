import { useState } from 'react';
import { useEcomApi } from '~/src/wix/ecom';

export function useAccountDetailsForm(
    accountId: string | undefined | null,
    initialFormValue: {
        loginEmail: string | undefined | null;
        firstName: string | undefined;
        lastName: string | undefined;
        phoneNumber: string | undefined;
    },
) {
    const api = useEcomApi();

    const [currentValue, setCurrentValue] = useState(initialFormValue);

    const [firstName, setFirstName] = useState(initialFormValue?.firstName ?? '');
    const [lastName, setLastName] = useState(initialFormValue?.lastName ?? '');
    const [phone, setPhone] = useState(initialFormValue?.phoneNumber ?? '');

    const [isUpdating, setIsUpdating] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const updateAccountDetails = async () => {
        if (!accountId) {
            return;
        }

        try {
            setIsUpdating(true);
            const updatedUser = await api.updateUser(accountId, {
                contact: {
                    firstName,
                    lastName,
                    phones: [phone],
                },
            });

            setCurrentValue({
                loginEmail: updatedUser?.loginEmail,
                firstName: updatedUser?.contact?.firstName ?? '',
                lastName: updatedUser?.contact?.lastName ?? '',
                phoneNumber: updatedUser?.contact?.phones?.[0] ?? '',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const discardChanges = () => {
        setFirstName(currentValue?.firstName ?? '');
        setLastName(currentValue?.lastName ?? '');
        setPhone(currentValue?.phoneNumber ?? '');
    };

    const sendPasswordResetEmail = async () => {
        if (!currentValue?.loginEmail) {
            return;
        }

        try {
            setIsResettingPassword(true);
            await api.sendPasswordResetEmail(currentValue.loginEmail, document.location.href);
        } finally {
            setIsResettingPassword(false);
        }
    };

    return {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        phone,
        setPhone,
        isUpdating,
        isResettingPassword,
        updateAccountDetails,
        discardChanges,
        sendPasswordResetEmail,
    };
}
