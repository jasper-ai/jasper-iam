import keymirror from 'keymirror'

// scope === <service>:<domain(s)>:action
export default keymirror({
  'iam:auth:check': null,
  'iam:authenticate': null,
  'iam:pwreset': null,
  'iam:tokens:create': null,
  'iam:tokens:read': null,
  'iam:tokens:delete': null,
  'iam:users:create': null,
  'iam:users:read': null,
  'iam:users:delete': null,
  'data:bots:read': null,
  'data:bots:write': null,
  'data:bots:delete': null,
  'data:emails:read': null,
  'data:emails:write': null,
  'data:emails:delete': null,
  'data:integrations:read': null,
  'data:integrations:write': null,
  'data:integrations:delete': null,
  'data:phonenumbers:read': null,
  'data:phonenumbers:write': null,
  'data:phonenumbers:delete': null,
  'data:profiles:read': null,
  'data:profiles:write': null,
  'data:profiles:delete': null,
  'worker:query': null
})
