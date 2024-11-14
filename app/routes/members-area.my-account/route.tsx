import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import type { MetaFunction } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { useState } from 'react';
import { Dialog, DialogDescription, DialogTitle } from '~/src/components/dialog/dialog';
import { Spinner } from '~/src/components/spinner/spinner';
import { initializeEcomApiForRequest } from '~/src/wix/ecom/session';
import { useAccountDetailsForm } from '~/src/wix/users';

import styles from './route.module.scss';

export async function loader({ request }: LoaderFunctionArgs) {
    const api = await initializeEcomApiForRequest(request);
    if (!api.isLoggedIn()) {
        return redirect('/login');
    }

    const user = await api.getUser();
    return { user };
}

export default function MyAccountPage() {
    const { user } = useLoaderData<typeof loader>();

    const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);

    const {
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
    } = useAccountDetailsForm(user?._id, {
        firstName: user?.contact?.firstName ?? '',
        lastName: user?.contact?.lastName ?? '',
        phoneNumber: user?.contact?.phones?.[0] ?? '',
        loginEmail: user?.loginEmail,
    });

    const onDiscardChangesClick = () => {
        setDiscardConfirmationOpen(true);
    };

    const handleDiscardChanges = () => {
        discardChanges();
        setDiscardConfirmationOpen(false);
    };

    return (
        <div>
            <div className={classNames(styles.section, styles.header)}>
                <div>
                    <h2 className="heading4">Account</h2>
                    <span className="paragraph1">View and edit your personal info below.</span>
                </div>
                <div className={styles.actions}>
                    <button
                        className={classNames('button', 'secondaryButton', 'smallButton')}
                        onClick={onDiscardChangesClick}
                    >
                        Discard
                    </button>
                    <button
                        className={classNames(
                            'button',
                            'primaryButton',
                            'smallButton',
                            styles.updateInfoButton,
                        )}
                        disabled={isUpdating}
                        onClick={updateAccountDetails}
                    >
                        {isUpdating ? <Spinner size={24} /> : 'Update Info'}
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <div>
                    <h2 className="heading5">Personal info</h2>
                    <span className="paragraph1">Update you personal information.</span>
                </div>

                <form className={styles.form}>
                    <label>
                        First Name
                        <input
                            className="textInput"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </label>

                    <label>
                        Last Name
                        <input
                            className="textInput"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </label>

                    <label>
                        Phone
                        <input
                            className="textInput"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </label>
                </form>

                <div className={styles.actions}>
                    <button
                        className={classNames('button', 'secondaryButton', 'smallButton')}
                        onClick={onDiscardChangesClick}
                    >
                        Discard
                    </button>
                    <button
                        className={classNames(
                            'button',
                            'primaryButton',
                            'smallButton',
                            styles.updateInfoButton,
                        )}
                        disabled={isUpdating}
                        onClick={updateAccountDetails}
                    >
                        {isUpdating ? <Spinner size={24} /> : 'Update Info'}
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <div>
                    <h2 className="heading5">Login info</h2>
                    <span className="paragraph1">View your login email and reset password.</span>
                </div>

                <div className={styles.loginInfoSection}>
                    <div>
                        <div>Login email:</div>
                        <div>{user?.loginEmail}</div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={classNames(
                                'button',
                                'primaryButton',
                                'smallButton',
                                styles.resetPasswordButton,
                            )}
                            disabled={isResettingPassword}
                            onClick={sendPasswordResetEmail}
                        >
                            {isResettingPassword ? <Spinner size={22} /> : 'Reset password'}
                        </button>
                    </div>
                </div>
            </div>

            <Dialog
                open={discardConfirmationOpen}
                onOpenChange={(open) => setDiscardConfirmationOpen(open)}
            >
                <DialogTitle className={styles.title}>Discard changes?</DialogTitle>
                <DialogDescription>Any changes you made will be lost.</DialogDescription>
                <div className={styles.confirmationDialogBody}>
                    <button
                        className={classNames('button', 'secondaryButton', 'smallButton')}
                        onClick={() => setDiscardConfirmationOpen(false)}
                    >
                        Keep Editing
                    </button>
                    <button
                        className={classNames('button', 'primaryButton', 'smallButton')}
                        onClick={handleDiscardChanges}
                    >
                        Discard Changes
                    </button>
                </div>
            </Dialog>
        </div>
    );
}

export const meta: MetaFunction = () => {
    return [
        { title: 'My Account | ReClaim' },
        {
            name: 'description',
            content: 'Essential home products for sustainable living',
        },
        {
            property: 'robots',
            content: 'noindex, nofollow',
        },
    ];
};
