const { Api, JsonRpc } = require('eosjs');
const rpc = new JsonRpc('https://eos.greymass.com');

const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { convertLegacyPublicKeys } = require('eosjs/dist/eosjs-numeric');

async function proxyVote() {
  // The cosigner account expected to sign this transaction
  const cosignerAccount = 'greymassfuel';

  // The cosigner permission expected to sign this transaction
  const cosignerPermission = 'active';

  // The user account performing the transaction
  const userAccount = 'greymasstest';

  // The user account permission performing the transaction
  const userPermission = 'active';

  // The signature provider + private key for the user account to partially sign
  const signatureProvider = new JsSignatureProvider(['WIFPRIVATEKEY']);

  // A custom cosigner AuthorityProvider for EOSJS v2
  // This provider overrides the checks on all keys,
  // allowing a partially signed transaction to be
  // broadcast to the API node.
  class CosignAuthorityProvider {
    async getRequiredKeys(args) {
      const { transaction } = args;
      // Iterate over the actions and authorizations
      transaction.actions.forEach((action, ti) => {
        action.authorization.forEach((auth, ai) => {
          // If the authorization matches the expected cosigner
          // then remove it from the transaction while checking
          // for what public keys are required
          if (
            auth.actor === cosignerAccount
            && auth.permission === cosignerPermission
          ) {
            delete transaction.actions[ti].authorization.splice(ai, 1)
          }
        })
      });
      return convertLegacyPublicKeys((await rpc.fetch('/v1/chain/get_required_keys', {
        transaction,
        available_keys: args.availableKeys,
      })).required_keys);
    }
  }

  // Pass in new authorityProvider
  const api = new Api({
    authorityProvider: new CosignAuthorityProvider(),
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });

  await api.transact({
    actions: [{
      account: 'eosio',
      name: 'voteproducer',
      authorization: [
        {
          actor: cosignerAccount,
          permission: cosignerPermission,
        },
        {
          actor: userAccount,
          permission: userPermission,
        }
      ],
      data: {
        voter: userAccount,
        proxy: 'greymassvote',
        producers: []
      },
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });
}

proxyVote();