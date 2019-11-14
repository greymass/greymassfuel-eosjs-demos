const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { convertLegacyPublicKeys } = require('eosjs/dist/eosjs-numeric');

const fetch = require('node-fetch');

const { TextDecoder, TextEncoder } = require('util');

// Setting the endpoint to use.
const rpc = new JsonRpc('http://jungle.greymass.com', { fetch });

// The cosigner account expected to sign this transaction
const cosignerAccount = 'greymassfuel';

// The cosigner permission expected to sign this transaction
const cosignerPermission = 'cosign';

// The user account performing the transaction
const userAccount = 'greymasstest';

// The user account permission performing the transaction
const userPermission = 'voting';

// The signature provider + private key for the user account to partially sign
const signatureProvider = new JsSignatureProvider(['5K2roC8auERQDnmYEfCwMYrNqkFNfUTnYF68aknmhwzT4ojgfVw']);

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

async function main() {
  // Sign and broadcast the transaction, with two actions
  const result = await api.transact({
    actions: [
      // The first action in the transaction must be a blank `greymassnoop:noop`
      {
        // The authorization for the noop only needs to include the cosigner.
        // This action and its authorization are what pay the resource costs for the
        // entire transaction and all its actions.
        authorization: [{
          actor: cosignerAccount,
          permission: cosignerPermission,
        }],
        account: 'greymassnoop',
        name: 'noop',
        data: {}
      },
      // The second (or third, fourth...) action in the transaction can be anything
      {
        // The only authorization required is that of the user
        authorization: [{
          actor: userAccount,
          permission: userPermission,
        }],
        account: 'eosio',
        name: 'voteproducer',
        data: {
          voter: userAccount,
          proxy: 'greymassvote',
          producers: []
        },
      }
    ]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });

  console.log(result)
}

main();
