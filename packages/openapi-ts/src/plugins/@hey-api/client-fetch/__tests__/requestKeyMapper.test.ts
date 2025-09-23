import { describe, expect, it } from 'vitest';

import { createClient } from '../bundle';

describe('requestKeyMapper (fetch client)', () => {
  it('remaps path and query keys before URL build', async () => {
    let capturedRequest: Request | undefined;
    const mockFetch = async (request: Request) => {
      capturedRequest = request;
      return new Response('{}', {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      });
    };

    const client = createClient({
      baseUrl: 'https://api.test',
      fetch: mockFetch as any,
    });
    await client.get({
      path: { fooBar: 123 },
      query: { barBaz: 'x' },
      requestKeyMapper: (opts: any) => {
        if (opts.path && 'fooBar' in opts.path) {
          opts.path.foo_bar = opts.path.fooBar;
          delete opts.path.fooBar;
        }
        if (opts.query && 'barBaz' in opts.query) {
          opts.query.bar_baz = opts.query.barBaz;
          delete opts.query.barBaz;
        }
      },
      url: '/r/{foo_bar}',
    });

    expect(capturedRequest).toBeTruthy();
    expect(capturedRequest!.url).toMatch(/\/r\/123\?bar_baz=x$/);
  });

  it('remaps header and body keys before serialization', async () => {
    let capturedRequest: Request | undefined;
    const mockFetch = async (request: Request) => {
      capturedRequest = request;
      return new Response('{}', {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      });
    };

    const client = createClient({
      baseUrl: 'https://api.test',
      fetch: mockFetch as any,
    });

    await client.post({
      body: { fooBar: 'baz' },
      headers: { XFizzBuzz: 'ok' },
      requestKeyMapper: (opts: any) => {
        if (opts.headers && opts.headers.get('XFizzBuzz') !== undefined) {
          opts.headers.set('X-Fizz-Buzz', opts.headers.get('XFizzBuzz'));
          opts.headers.delete('XFizzBuzz');
        }
        if (opts.body && 'fooBar' in opts.body) {
          opts.body.foo_bar = opts.body.fooBar;
          delete opts.body.fooBar;
        }
      },
      url: '/r',
    });

    expect(capturedRequest).toBeTruthy();
    // headers
    expect(capturedRequest!.headers.get('X-Fizz-Buzz')).toBe('ok');
    // body
    const body = await capturedRequest!.clone().text();
    expect(body).toBe('{"foo_bar":"baz"}');
  });

  it('remaps deep nested object properties', async () => {
    let capturedRequest: Request | undefined;
    const mockFetch = async (request: Request) => {
      capturedRequest = request;
      return new Response('{}', {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    };

    const client = createClient({
      baseUrl: 'https://api.test',
      fetch: mockFetch as any,
    });

    await client.post({
      body: {
        user: {
          personalInfo: {
            contactDetails: {
              emailAddress: 'john@example.com',
            },
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
      requestKeyMapper: (opts: any) => {
        // Deep nesting: user.personalInfo.firstName → user.personal_info.first_name
        if (opts.body?.user?.personalInfo) {
          // Level 1: personalInfo → personal_info
          opts.body.user.personal_info = opts.body.user.personalInfo;
          delete opts.body.user.personalInfo;

          const info = opts.body.user.personal_info;
          // Level 2: firstName → first_name
          if ('firstName' in info) {
            info.first_name = info.firstName;
            delete info.firstName;
          }
          // Level 2: lastName → last_name
          if ('lastName' in info) {
            info.last_name = info.lastName;
            delete info.lastName;
          }
          // Level 3: contactDetails.emailAddress → contact_details.email_address
          if (info.contactDetails) {
            info.contact_details = info.contactDetails;
            delete info.contactDetails;
            if ('emailAddress' in info.contact_details) {
              info.contact_details.email_address =
                info.contact_details.emailAddress;
              delete info.contact_details.emailAddress;
            }
          }
        }
      },
      url: '/users',
    });

    expect(capturedRequest).toBeTruthy();
    const body = await capturedRequest!.clone().text();
    const parsed = JSON.parse(body);

    expect(parsed).toEqual({
      user: {
        personal_info: {
          contact_details: {
            email_address: 'john@example.com',
          },
          first_name: 'John',
          last_name: 'Doe',
        },
      },
    });
  });

  it('remaps array items with nested properties', async () => {
    let capturedRequest: Request | undefined;
    const mockFetch = async (request: Request) => {
      capturedRequest = request;
      return new Response('{}', {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    };

    const client = createClient({
      baseUrl: 'https://api.test',
      fetch: mockFetch as any,
    });

    await client.post({
      body: {
        users: [
          {
            roles: [
              { permissions: { canEdit: true }, roleName: 'admin' },
              { permissions: { canRead: true }, roleName: 'user' },
            ],
            userInfo: { firstName: 'John', isActive: true },
          },
          {
            roles: [{ permissions: { canRead: true }, roleName: 'user' }],
            userInfo: { firstName: 'Jane', isActive: false },
          },
        ],
      },
      requestKeyMapper: (opts: any) => {
        if (opts.body?.users && Array.isArray(opts.body.users)) {
          for (const user of opts.body.users) {
            // Remap userInfo → user_info
            if (user.userInfo) {
              user.user_info = user.userInfo;
              delete user.userInfo;

              // Remap firstName → first_name, isActive → is_active
              if ('firstName' in user.user_info) {
                user.user_info.first_name = user.user_info.firstName;
                delete user.user_info.firstName;
              }
              if ('isActive' in user.user_info) {
                user.user_info.is_active = user.user_info.isActive;
                delete user.user_info.isActive;
              }
            }

            // Remap roles array items
            if (user.roles && Array.isArray(user.roles)) {
              for (const role of user.roles) {
                // roleName → role_name
                if ('roleName' in role) {
                  role.role_name = role.roleName;
                  delete role.roleName;
                }
                // permissions.canEdit → permissions.can_edit
                if (role.permissions) {
                  if ('canEdit' in role.permissions) {
                    role.permissions.can_edit = role.permissions.canEdit;
                    delete role.permissions.canEdit;
                  }
                  if ('canRead' in role.permissions) {
                    role.permissions.can_read = role.permissions.canRead;
                    delete role.permissions.canRead;
                  }
                }
              }
            }
          }
        }
      },
      url: '/users',
    });

    expect(capturedRequest).toBeTruthy();
    const body = await capturedRequest!.clone().text();
    const parsed = JSON.parse(body);

    expect(parsed).toEqual({
      users: [
        {
          roles: [
            { permissions: { can_edit: true }, role_name: 'admin' },
            { permissions: { can_read: true }, role_name: 'user' },
          ],
          user_info: { first_name: 'John', is_active: true },
        },
        {
          roles: [{ permissions: { can_read: true }, role_name: 'user' }],
          user_info: { first_name: 'Jane', is_active: false },
        },
      ],
    });
  });

  it('remaps additionalProperties with Object.keys iteration', async () => {
    let capturedRequest: Request | undefined;
    const mockFetch = async (request: Request) => {
      capturedRequest = request;
      return new Response('{}', {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    };

    const client = createClient({
      baseUrl: 'https://api.test',
      fetch: mockFetch as any,
    });

    await client.post({
      body: {
        metadata: {
          config_one: { isEnabled: true, settingValue: 'value1' },
          config_three: { isEnabled: true, settingValue: 'value3' },
          config_two: { isEnabled: false, settingValue: 'value2' },
        },
      },
      requestKeyMapper: (opts: any) => {
        if (opts.body?.metadata && typeof opts.body.metadata === 'object') {
          // Iterate over dynamic properties
          for (const key of Object.keys(opts.body.metadata)) {
            const config = opts.body.metadata[key];
            if (config && typeof config === 'object') {
              // settingValue → setting_value
              if ('settingValue' in config) {
                config.setting_value = config.settingValue;
                delete config.settingValue;
              }
              // isEnabled → is_enabled
              if ('isEnabled' in config) {
                config.is_enabled = config.isEnabled;
                delete config.isEnabled;
              }
            }
          }
        }
      },
      url: '/configs',
    });

    expect(capturedRequest).toBeTruthy();
    const body = await capturedRequest!.clone().text();
    const parsed = JSON.parse(body);

    expect(parsed).toEqual({
      metadata: {
        config_one: { is_enabled: true, setting_value: 'value1' },
        config_three: { is_enabled: true, setting_value: 'value3' },
        config_two: { is_enabled: false, setting_value: 'value2' },
      },
    });
  });

  it('remaps multi-dimensional arrays', async () => {
    let capturedRequest: Request | undefined;
    const mockFetch = async (request: Request) => {
      capturedRequest = request;
      return new Response('{}', {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    };

    const client = createClient({
      baseUrl: 'https://api.test',
      fetch: mockFetch as any,
    });

    await client.post({
      body: {
        matrix: [
          [
            { cellMeta: { dataType: 'number' }, cellValue: 1 },
            { cellMeta: { dataType: 'number' }, cellValue: 2 },
          ],
          [
            { cellMeta: { dataType: 'number' }, cellValue: 3 },
            { cellMeta: { dataType: 'number' }, cellValue: 4 },
          ],
        ],
      },
      requestKeyMapper: (opts: any) => {
        if (opts.body?.matrix && Array.isArray(opts.body.matrix)) {
          for (const row of opts.body.matrix) {
            if (Array.isArray(row)) {
              for (const cell of row) {
                // cellValue → cell_value
                if ('cellValue' in cell) {
                  cell.cell_value = cell.cellValue;
                  delete cell.cellValue;
                }
                // cellMeta → cell_meta
                if (cell.cellMeta) {
                  cell.cell_meta = cell.cellMeta;
                  delete cell.cellMeta;
                  // dataType → data_type
                  if ('dataType' in cell.cell_meta) {
                    cell.cell_meta.data_type = cell.cell_meta.dataType;
                    delete cell.cell_meta.dataType;
                  }
                }
              }
            }
          }
        }
      },
      url: '/matrix',
    });

    expect(capturedRequest).toBeTruthy();
    const body = await capturedRequest!.clone().text();
    const parsed = JSON.parse(body);

    expect(parsed).toEqual({
      matrix: [
        [
          { cell_meta: { data_type: 'number' }, cell_value: 1 },
          { cell_meta: { data_type: 'number' }, cell_value: 2 },
        ],
        [
          { cell_meta: { data_type: 'number' }, cell_value: 3 },
          { cell_meta: { data_type: 'number' }, cell_value: 4 },
        ],
      ],
    });
  });
});
