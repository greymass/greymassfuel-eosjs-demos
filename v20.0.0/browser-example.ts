import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { convertLegacyPublicKeys } from 'eosjs/dist/eosjs-numeric';
import { AuthorityProvider, AuthorityProviderArgs } from 'eosjs/dist/eosjs-api-interfaces';
import { Action, Authorization } from 'eosjs/dist/eosjs-serialize';

// Setting the endpoint to use.
const rpc = new JsonRpc('http://jungle.greymass.com');

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
export class CosignAuthorityProvider implements AuthorityProvider {
  public rpc: JsonRpc = new JsonRpc('http://eos.greymass.com');
  public auth: Authorization = { actor: "greymassfuel", permission: "cosign" };

  constructor (rpc?: JsonRpc, auth?: Authorization) {
    this.rpc = rpc || this.rpc;
    this.auth = auth || this.auth;
  }

  async getRequiredKeys(args: AuthorityProviderArgs) {
    const transaction = args.transaction;
    // Iterate over the actions and authorizations
    transaction.actions.forEach((action: Action, ti: number) => {
      action.authorization.forEach((auth: Authorization, ai: number) => {
        // If the authorization matches the expected cosigner
        // then remove it from the transaction while checking
        // for what public keys are required
        if ( auth.actor === auth.actor && auth.permission === auth.permission ) {
          transaction.actions[ti].authorization.splice(ai, 1)
        }
      })
    });
    return convertLegacyPublicKeys((await this.rpc.fetch('/v1/chain/get_required_keys', {
      transaction,
      available_keys: args.availableKeys,
    })).required_keys);
  }
}

async function proxyVote() {
  // Pass in new authorityProvider.
  const api = new Api({
    authorityProvider: new CosignAuthorityProvider(),
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  signatureProvider.keys

  // Broadcast signed action while specifying both authorizations.
  const result = await api.transact({
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

  console.log(result)
}

proxyVote();