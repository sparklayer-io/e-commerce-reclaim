import { isRouteErrorResponse } from '@remix-run/react';

/**
 * It's important to add an appropriate role and a keyboard support
 * for non-interactive HTML elements with click handlers, such as `<div onClick={handler}></div>`.
 * This function returns a basic set of attributes
 * to make the clickable element focusable and handle keyboard events.
 */
export function getClickableElementAttributes(handler: () => void) {
    return {
        role: 'button',
        tabIndex: 0,
        onClick: handler,
        onKeyUp: (event: React.KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'Space') {
                handler();
            }
        },
    };
}

export function removeQueryStringFromUrl(url: string) {
    const { origin, pathname } = new URL(url);
    return new URL(pathname, origin).toString();
}

/*
 * Retrieves the message from a thrown error.
 * - Supports Remix ErrorResponse, returned by `useRouteError()` when a loader
 *   throws `new Response(...)` or `json(...)`.
 * - Supports `Error` instances and plain objects with a `message` property.
 * - Converts objects without a `message` property to a JSON string to provide
 *   some information about the error.
 * - Falls back to converting the value to a string.
 */
export function getErrorMessage(error: unknown): string {
    // Remix ErrorResponse thrown from an action or loader:
    // - throw new Response('Oops', { status: 404 })
    // - throw json({message: 'Oops'}, { status: 404 })
    if (isRouteErrorResponse(error)) {
        if (error.data) {
            return getErrorMessage(error.data);
        } else if (error.statusText) {
            return error.statusText;
        } else {
            return String(error.status);
        }
    }

    if (typeof error == 'object' && error !== null) {
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }

        try {
            return JSON.stringify(error);
        } catch {
            // Fall through.
        }
    }

    return String(error);
}

/**
 * Merges multiple URLSearchParams instances into one URLSearchParams.
 *
 * For entries with the same key, values from subsequent URLSearchParams
 * instances will overwrite the earlier ones. For example:
 * ```js
 * const a = new URLSearchParams([['foo', '1'], ['foo', '2']])
 * const b = new URLSearchParams([['foo', '3'], ['foo', '4']])
 * const c = mergeUrlSearchParams(a, b);
 * c.toString(); // 'foo=3&foo=4'
 * ```
 */
export function mergeUrlSearchParams(...paramsArr: URLSearchParams[]): URLSearchParams {
    const result = new URLSearchParams();

    for (const params of paramsArr) {
        const overriddenParams = new Set<string>();

        for (const [key, value] of params.entries()) {
            if (result.has(key) && !overriddenParams.has(key)) {
                result.delete(key);
                overriddenParams.add(key);
            }

            result.append(key, value);
        }
    }

    return result;
}
