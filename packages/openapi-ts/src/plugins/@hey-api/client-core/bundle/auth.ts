export type AuthToken = string | undefined;

export interface Auth {
  /**
   * Which part of the request do we use to send the auth?
   *
   * @default 'header'
   */
  in?: 'header' | 'query' | 'cookie';
  /**
   * The `components.securitySchemes` key from the OpenAPI spec.
   *
   * Set only when the spec defines two or more security schemes whose `Auth`
   * shape would otherwise be identical (e.g. two `http`/`bearer` schemes used
   * by different operations), so the auth callback can pick the right token.
   * Undefined when no other scheme in the spec collides with this one.
   */
  key?: string;
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
  const token = typeof callback === 'function' ? await callback(auth) : callback;

  if (!token) {
    return;
  }

  if (auth.scheme === 'bearer') {
    return `Bearer ${token}`;
  }

  if (auth.scheme === 'basic') {
    return `Basic ${btoa(token)}`;
  }

  return token;
};
