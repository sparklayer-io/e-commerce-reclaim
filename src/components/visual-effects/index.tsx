import { HTMLMotionProps, motion } from 'framer-motion';
import { useEffect, useRef, type FC, type HTMLAttributes } from 'react';

/**
 * Unit vectors corresponding to four cardinal directions, in screen coordinates.
 */
const cardinalDirectionVectors = {
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
} as const;

/**
 * Linearly interpolates between two numbers `a` and `b`, based on the
 * interpolation factor `t`.
 * - When `t = 0` returns `a`.
 * - When `t = 1` return `b`.
 * - When `t = 0.5` returns the midpoint of `a` and `b`.
 */
const lerp = (a: number, b: number, t: number): number => (1 - t) * a + t * b;

/**
 * Restricts the value `x` to a range defined by `min` and `max`.
 */
const clamp = (min: number, max: number, x: number): number => {
    if (x < min) return min;
    if (x > max) return max;
    return x;
};

/**
 * Remaps a number `x` from one range to another.
 *
 * @param inputStart - The start value of the input range.
 * @param inputEnd - The end value of the input range.
 * @param outputStart - The start value of the output range.
 * @param outputEnd - The end value of the output range.
 * @param x - The value to remap from the input range to the output range.
 */
const remap = (
    inputStart: number,
    inputEnd: number,
    outputStart: number,
    outputEnd: number,
    x: number
): number => ((x - inputStart) / (inputEnd - inputStart)) * (outputEnd - outputStart) + outputStart;

/**
 * Calculates the `background-position-y` of an element to create a parallax
 * effect as the page is scrolled. The function expects the background image to
 * have `background-attachment: fixed` and `background-size: cover`, which
 * ensures the background image has a minimum height of 100vh and is positioned
 * relative to the viewport rather than the element itself.
 *
 * @param viewportHeight - The height of the viewport in pixels.
 * @param elementHeight - The height of the element in pixels.
 * @param elementTop - The distance from the top of the viewport to the top of the element.
 * @param parallaxStrength - A value between 0 and 1, where 0 means no parallax,
 *                           and 1 means full parallax (background fixed to viewport).
 * @return The `y` position of the background in pixels to achieve the parallax effect.
 */
const calculateBackgroundParallax = ({
    viewportHeight,
    elementHeight,
    elementTop,
    parallaxStrength,
}: {
    viewportHeight: number;
    elementHeight: number;
    elementTop: number;
    parallaxStrength: number;
}) => {
    // scrollProgress = 0, when the element is fully below the bottom edge of the viewport.
    // scrollProgress = 1, when the element is fully above the top edge of the viewport.
    const scrollProgress = clamp(0, 1, remap(viewportHeight, -elementHeight, 0, 1, elementTop));

    // If the element's height exceeds the viewport height, the background
    // (which has minimum height of 100vh) cannot scroll along with the element
    // without creating gaps. In this case, we force `parallaxStrength = 1` to
    // keep the background fixed to the viewport.
    if (elementHeight > viewportHeight) parallaxStrength = 1;

    const maxBackgroundY = ((viewportHeight + elementHeight) / 2) * (1 - parallaxStrength);
    return lerp(maxBackgroundY, -maxBackgroundY, scrollProgress);
};

interface RevealProps extends HTMLMotionProps<'div'> {
    /** Animation direction, default: "down". */
    direction?: 'up' | 'right' | 'down' | 'left';
    /** Animation duration in seconds, default: 1.4 */
    duration?: number;
}

/**
 * A visual effect that gradually reveals content from a specified direction.
 * This effect does not impact the layout of the content.
 */
export const Reveal: FC<RevealProps> = ({ direction = 'down', duration = 1.4, ...props }) => (
    <motion.div
        transition={{ duration, ease: [0.65, 0, 0.35, 1] }}
        initial={{
            clipPath: {
                up: 'inset(100% 0 0 0)',
                right: 'inset(0 100% 0 0)',
                down: 'inset(0 0 100% 0)',
                left: 'inset(0 0 0 100%)',
            }[direction],
        }}
        whileInView={{ clipPath: 'none' }}
        viewport={{ once: true }}
        {...props}
    />
);

interface FadeInProps extends HTMLMotionProps<'div'> {
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

interface FloatInProps extends HTMLMotionProps<'div'> {
    /** Animation direction, default: "up". */
    direction?: 'up' | 'right' | 'down' | 'left';
    /** Animation duration in seconds, default: 1.2 */
    duration?: number;
    /** The distance the element will travel during animation, default: 120px */
    distance?: number;
}

/**
 * A visual effect where the content drifts into place from the specified
 * direction, while transitioning from transparent to fully opaque.
 */
export const FloatIn: FC<FloatInProps> = ({
    direction = 'up',
    duration = 1.2,
    distance = 120,
    ...props
}) => (
    <motion.div
        transition={{ duration, ease: 'easeInOut' }}
        initial={{
            opacity: 0,
            x: -cardinalDirectionVectors[direction].x * distance,
            y: -cardinalDirectionVectors[direction].y * distance,
        }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        {...props}
    />
);

interface BackgroundParallaxProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * A number between 0 and 1 that defines the strength of the parallax
     * effect, default: 0.75.
     * - 0: No parallax effect, the background scrolls at the same rate as the
     *   content, similar to `background-attachment: scroll`.
     * - 1: Maximum parallax effect, the background remains fixed relative to
     *   the viewport, similar to `background-attachment: fixed`.
     */
    parallaxStrength?: number;
}

/**
 * A visual effect where the container's background image (set via CSS or inline
 * styles) scrolls at a slower rate than the foreground content, creating a
 * parallax effect. The background image is guaranteed to fully cover the
 * visible area of the container at all times, with no gaps, regardless of the
 * container size, background image dimensions, or viewport size.
 */
export const BackgroundParallax: FC<BackgroundParallaxProps> = ({
    parallaxStrength = 0.75,
    style,
    ...props
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleLayoutChange = () => {
            const elementRect = element.getBoundingClientRect();
            const backgroundPositionY = calculateBackgroundParallax({
                viewportHeight: window.innerHeight,
                elementTop: elementRect.top,
                elementHeight: elementRect.height,
                parallaxStrength,
            });
            element.style.backgroundPositionY = backgroundPositionY + 'px';
        };

        window.addEventListener('scroll', handleLayoutChange);
        window.addEventListener('resize', handleLayoutChange);
        const resizeObserver = new ResizeObserver(handleLayoutChange);
        resizeObserver.observe(element);

        return () => {
            window.removeEventListener('scroll', handleLayoutChange);
            window.removeEventListener('resize', handleLayoutChange);
            resizeObserver.disconnect();
        };
    }, [parallaxStrength]);

    return (
        <div
            ref={ref}
            style={{
                backgroundAttachment: 'fixed',
                // With `background-attachment: fixed`, the `cover` value for
                // background size is calculated relative to the viewport.
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPositionX: 'center',
                ...style,
            }}
            {...props}
        />
    );
};
