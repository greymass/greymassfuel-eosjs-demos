GREYMASS | FUEL
---

These demos use [eosjs](https://github.com/EOSIO/eosjs) and the `greymassfuel` account to cosign transactions using the `ONLY_BILL_FIRST_AUTHORIZER` feature of EOSIO. If you're interested in a similar demo using Scatter/Transit, please visit [greymass/greymassfuel-transit-demo](https://github.com/greymass/greymassfuel-transit-demo/).

#### What is ONLY_BILL_FIRST_AUTHORIZER?

This feature of EOSIO allows an 3rd party account to cover the network resource costs (CPU/NET) for a transaction created by any user.

###### Note to app/dapp developers:

If you are interested in working with Greymass to bring this feature to your users, feel free to reach out to us either via email (team@greymass.com) or join our [telegram channel](https://t.me/greymass). We are in the very early stages of this project and eventually plan to offer it as a paid turn-key solution. This will help to offset the costs of our current and future API infrastructure.

---

### Example Repository Structure

The repository shows examples for the primary of versions eosjs in use within the EOSIO ecosystem.

- v20.0.0 - fully functional
- v16.0.9 - **does NOT work for all accounts** (see [eosjs@pull/604](https://github.com/EOSIO/eosjs/pull/604))

Each version specific folder contains two files:

- ***browser-example.html***: creates a cosignable transaction within an HTML page that can run in a browser
- ***browser-example.js***: creates a cosignable transaction in within a javascript file that can be included in a build process that supports imports
- ***server-example.js***: creates a cosignable transaction using a server side script

### Running Examples

All examples are set to use the Jungle testnet, via our jungle.greymass.com APIs, and have a private key embedded in them for the [`greymasstest`](https://jungle.bloks.io/account/greymasstest#keys) account for the `voting` permission. This permission can **only** call the `voteproducer` action for the purposes of the demo.

##### Browser

Open the `browser-example.html` file in your browser and click the button.

##### Server

Install the appropriate packages via yarn/npm and run the script.

As a note - switching between the two examples requires switching versions of eosjs. The commands below (`yarn add ...`) should accomplish this for you.

**Running the v20.0.0 Example:**

```
cd greymassfuel-eosjs-demos
yarn add eosjs node-fetch
node v20.0.0/server-example.js
```

**Running the v16.0.9 Example:**

```
cd greymassfuel-eosjs-demos
yarn add eosjs@16.0.9 node-fetch
node v16.0.9/server-example.js
```

### Integration into Greymass API Infrastructure

Greymass has deployed a modified version of our [cosigner-prototype](https://github.com/greymass/eosio-cosigner-nodejs) to our public APIs infrastructure, available for the following chains:

- Jungle: [jungle.greymass.com](https://jungle.greymass.com)
- EOS: [eos.greymass.com](https://eos.greymass.com)

This invisible service layer is set to intercept native `/v1/chain/push_transaction` API calls and determine if the data submitted is valid and capable of being cosigned for. Any request that fails this validation is forwarded directly to the normal transaction APIs and unaffected.

For both current networks this is deployed on, the `greymassfuel` account and the `cosign` permission are used. These permissions and allowed contract/actions can be viewed on bloks.io using the following links:

- [`greymassfuel` on EOS](https://bloks.io/account/greymassfuel#keys)
- [`greymassfuel` on Jungle](https://jungle.bloks.io/account/greymassfuel#keys)

The [`greymassfuel`](https://jungle.bloks.io/account/greymassfuel#keys) account on the Jungle testnet has ample CPU/NET resources and you are free to test against using these examples. The [`greymassfuel`](https://bloks.io/account/greymassfuel#keys) account on the EOS network on the other hand doesn't have many resources (at the time of this writing), so it will likely be less usable for demo purposes.

A quota has also been established on the EOS API infrastructure, only allowing a specific number of transactions per account. The Jungle API does not have this restriction.

### Have spare resources on EOS? Delegate/Donate

The [`greymassfuel`](https://bloks.io/account/greymassfuel) account on the EOS network is being configured to allow a certain amount of transactions per day, per account, on a first-come first-serve basis. This is currently live through the [eos.greymass.com](https://eos.greymass.com) public API endpoint.

This configuration allows users (with a compatible wallet) who are unable to perform transactions (due to their own resources being low) to perform select actions they otherwise wouldn't be able to. The [`greymassfuel`](https://bloks.io/account/greymassfuel) account covers the resource costs for these actions. The list of actions currently available for cosigning can be seen on the [`greymassfuel`](https://bloks.io/account/greymassfuel#keys) under the `cosign` permission.

If you have extra network resources on EOS, you can contribute to this pool by delegating tokens (as CPU) to [`greymassfuel`](https://bloks.io/account/greymassfuel). **Do NOT use the `transfer` flag while delegating**. By delegating tokens, you will retain full ownership of your tokens, full voting rights, and will only be conveying the rights to use those tokens as resources.

If you'd like to make an actual donation to this effort, you are free to transfer tokens to the [`greymassfund`](https://bloks.io/account/greymassfund) account. Any tokens sent to the [`greymassfund`](https://bloks.io/account/greymassfund) directly will be considered donations and not refunded.

### Important notes to those developing custom solutions

Using a server side cosigner like this presents a number of risks to the account which is cosigning, and for that reason the follow best practices are recommended:

- Use a specific cosigning account + permission with explicitly defined actions.
- Do NOT stake tokens directly to the cosigning account, or give the account control of anything that has value. Delegate resources to it from a secured account, or rent resources for it via REX.
- Do NOT use the active or owner key for cosigning, as potential attackers could then use those keys to sign malicious transactions on behalf of the cosigner.
- Do NOT grant blanket permissions (`eosio::` or `eosio.token::`) to the cosigning permission in a way which allows actions that could alter the account.
