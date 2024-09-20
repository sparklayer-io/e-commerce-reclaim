import { HTMLMotionProps, motion } from 'framer-motion';
import { FC } from 'react';

export interface FadeInProps extends HTMLMotionProps<'div'> {
    /** Animation duration in seconds, default: 1.8 */
    duration?: number;
}

/**
 * A visual effect where the content transitions from transparent to opaque.
 */
export const FadeIn: FC<FadeInProps> = ({ duration = 1.8, ...props }) => (
    <motion.div
        transition={{ duration, ease: 'linear' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        {...props}
    />
);
