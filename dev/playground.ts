import { Sdk } from './.gen/sdk.gen';

const opencode = new Sdk();
opencode.session.create(
  {
    parentID: '',
    title: '',
  },
  {
    headers: {
      'X-Custom-Header': 'value',
    },
  },
);
opencode.session.init({
  id: '',
  messageID: '',
  modelID: '',
  providerID: '',
});
opencode.session.chat({
  agent: '',
  id: '',
  messageID: '',
  modelID: '',
  parts: [
    {
      name: '',
      type: 'agent',
    },
  ],
  providerID: '',
  system: '',
  tools: {},
});
opencode.auth.set({
  auth: {
    // access: '',
    // expires: 1,
    key: '',
    // refresh: '',
    // token: '',
    type: 'api',
  },
  id: '123',
});
opencode.postSessionByIdPermissionsByPermissionId({
  id: 'session-id',
  permissionID: 'permission-id',
  response: 'always',
});
opencode.tui.showToast({
  message: '',
  title: '',
  variant: 'error',
});
