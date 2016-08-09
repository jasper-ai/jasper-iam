import scopes from './scopes'

export default {
  'god-mode': Object.keys(scopes),
  'iam-super': Object.keys(scopes).filter(s => s.match(/^iam:/)),
  'iam-admin': Object.keys(scopes).filter(s => s.match(/^iam:.+(!:delete)$/)),
  'iam-user': Object.keys(scopes).filter(s => s.match(/^iam:.+(!:(write|delete))$/)),
  'data-super': Object.keys(scopes).filter(s => s.match(/^data:/)),
  'data-admin': Object.keys(scopes).filter(s => s.match(/^data:.+(!:delete)$/)),
  'data-user': Object.keys(scopes).filter(s => s.match(/^data:.+(!:(write|delete))$/)),
  'worker-user': Object.keys(scopes).filter(s => s.match(/^worker:/))
}
