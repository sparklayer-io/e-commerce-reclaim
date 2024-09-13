import { Header } from '../header/header';
import styles from './site-wrapper.module.scss';

export const SiteWrapper = ({ children }: React.PropsWithChildren) => {
    return (
        <div>
            <Header />
            <main className={styles.main}>{children}</main>
            {/* Footer */}
        </div>
    );
};
