const Eos = require('eosjs');

async function proxyVote() {
  // The cosigner account expected to sign this transaction.
  const cosignerAccount = 'greymassfuel';

  // The cosigner permission expected to sign this transaction.
  const cosignerPermission = 'active';

  // The user account performing the transaction.
  const userAccount = 'greymasstest';

  // The user account permission performing the transaction.
  const userPermission = 'active';

  // The endpoint to use.
  const httpEndpoint = 'https://jungle.greymass.com';

  // The id of the chain used.
  const chainId = 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473';

  // The signature provider + private key for the user account to partially sign.
  const keyProvider = ['WIFPRIVATEKEY'];

  // Connect to a testnet or mainnet.
  const eos = Eos({httpEndpoint, chainId, keyProvider});

  // Broadcast signed action while specifying both authorizations.
  const result = await eos.voteproducer(
    userAccount,
    'greymassvote',
    [],
    {
      broadcast: true,
      sign: true,
      authorization: [
        {"actor":cosignerAccount,"permission":cosignerPermission},
        {"actor":userAccount,"permission":userPermission}
      ],
    }
  );

  console.log(result);
}

proxyVote();
