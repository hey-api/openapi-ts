export type AuthToken = string | undefined;

export interface Auth {
  /**
   * The token that should appear first in the Authorization header for the
   * 'http' type, when scheme is 'bearer'.
   *
   * @default 'Bearer'
   */
  bearerFormat?: string;
  /**
   * Which part of the request do we use to send the auth?
   *
   * @default 'header'
   */
  in?: 'header' | 'query';
  /**
   * Header or query parameter name.
   *
   * @default 'Authorization'
   */
  name?: string;
  scheme?: 'basic' | 'bearer';
  type: 'apiKey' | 'http';
}

export const getAuthToken = async (
  auth: Auth,
  callback: ((auth: Auth) => Promise<AuthToken> | AuthToken) | AuthToken,
): Promise<string | undefined> => {
  const token =
    typeof callback === 'function' ? await callback(auth) : callback;

  if (!token) {
    return;
  }

  if (auth.scheme === 'bearer') {
    const format =
      auth.bearerFormat !== undefined ? auth.bearerFormat : 'Bearer';
    return `${format} ${token}`;
  }

  if (auth.scheme === 'basic') {
    return `Basic ${btoa(token)}`;
  }

  return token;
};
