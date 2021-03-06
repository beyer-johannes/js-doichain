import chai from 'chai'
chai.Assertion.addProperty('uppercase', function () {
  var obj = this._obj;
  new chai.Assertion(obj).to.be.a('string');

  this.assert(
      obj === obj.toUpperCase() // adapt as needed
      , 'expected #{this} to be all uppercase'    // error message when fail for normal
      , 'expected #{this} to not be all uppercase'  // error message when fail for negated
  );
});
import {generateMnemonic} from '../lib/generateMnemonic'
import {validateMnemonic} from "../lib/validateMnemonic";
import {createHdKeyFromMnemonic} from "../lib/createHdKeyFromMnemonic"
import {restoreDoichainWalletFromHdKey,noEmailError} from "../lib/restoreDoichainWalletFromHdKey"
import {getAddress} from "../lib/getAddress"
import {changeNetwork, DEFAULT_NETWORK, DOICHAIN_REGTEST,DOICHAIN_TESTNET,DOICHAIN} from "../lib/network"
import {fundWallet} from "../lib/fundWallet";
import {listTransactions} from "../lib/listTransactions"
import {listUnspent} from "../lib/listUnspent";
import {getBalanceOfWallet} from "../lib/getBalanceOfWallet";
import {createNewWallet} from "../lib/createNewWallet";
import {encryptAES} from "../lib/encryptAES";
import {decryptAES} from "../lib/decryptAES";

const SEEDPHRASE = "balance blanket camp festival party robot social stairs noodle piano copy drastic"
const PASSWORD = "julianAssange2020"

describe('js-doichain', function(){
  this.timeout(0);
  describe('basic doichain functions', function(){

    it('should create a new mnemonic seed phrase', function () {
      const mnemonic = generateMnemonic()
      chai.assert.equal(mnemonic.split(' ').length,12,'mnemonic doesnt contain 12 words')
    })

    it('should validate a mnemonic seed phrase', function () {
      const mnemonic = "refuse brush romance together undo document tortoise life equal trash sun ask"
      const valid = validateMnemonic(mnemonic)
      chai.assert.equal(valid,true,"mnomnic seed phrase not valid")
    })

    it('should create a hdkey from a mnemonic without password', function() {
      const mnemonic = "refuse brush romance together undo document tortoise life equal trash sun ask"
      const hdKey = createHdKeyFromMnemonic(mnemonic)
      chai.expect(hdKey).to.have.own.property('_privateKey');
      chai.expect(hdKey).to.have.own.property('_publicKey');
    })

    it('should create a new Doichain wallet from a seed in mainnet', function () {
      changeNetwork('mainnet')
      const mnemonic = "refuse brush romance together undo document tortoise life equal trash sun ask"
      const hdKey = createHdKeyFromMnemonic(mnemonic)

     // chai.expect(() => createDoichainWalletFromHdKey(hdKey)).to.throw();
     // chai.expect(() => createDoichainWalletFromHdKey(hdKey,'alice@ci-doichain.org')).to.not.throw();

      const wallets = restoreDoichainWalletFromHdKey(hdKey,'alice@ci-doichain.org')
      // bitcoin testnet P2PKH addresses start with a 'm' or 'n'
      //chai.assert.strictEqual(wallet.addresses[0].address.startsWith('M') || wallet.addresses[0].address.startsWith('N'),true)
      //chai.expect(wallet.addresses[0].address).to.have.length(34)
      //chai.expect(wallet.addresses[0].address.substring(0,1)).to.be.uppercase
    })

    it('should create a new Doichain wallet from a seed in testnet', function () {
      changeNetwork('testnet')
      const mnemonic = "refuse brush romance together undo document tortoise life equal trash sun ask"
      const hdKey = createHdKeyFromMnemonic(mnemonic)
      const wallets = restoreDoichainWalletFromHdKey(hdKey,'alice@ci-doichain.org',DOICHAIN_TESTNET)
      //chai.assert.strictEqual(wallet.addresses[0].address.startsWith('m') || wallet.addresses[0].address.startsWith('n'),true)
      //chai.expect(wallet.addresses[0].address).to.have.length(34)
      //chai.expect(wallet.addresses[0].address.substring(0,1)).to.not.be.uppercase
    })

    it('should create a new Doichain regtest wallet and fund it with 1 DOI ', async () => {
      changeNetwork('regtest')
      //console.log('DEFAULT_NETWORK',global.DEFAULT_NETWORK)
      const mnemonic = "refuse brush romance together undo document tortoise life equal trash sun ask"
      const hdKey = createHdKeyFromMnemonic(mnemonic)
      const wallets = await restoreDoichainWalletFromHdKey(hdKey,'alice@ci-doichain.org',DOICHAIN_REGTEST)
      console.log('wallets',wallets)
      const newWallet = await createNewWallet(hdKey,wallets.length)
      console.log('newWallet',newWallet)
      chai.assert.strictEqual(newWallet.addresses[0].address.startsWith('m') || newWallet.addresses[0].address.startsWith('n'),true)
      chai.expect(newWallet.addresses[0].address).to.have.length(34)
      chai.expect(newWallet.addresses[0].address.substring(0,1)).to.not.be.uppercase
      const doi = 10
      console.log('wallets.address',newWallet.addresses[0].address)
      const funding = await fundWallet(newWallet.addresses[0].address,doi)
      console.log('funding',funding)
      const address = funding.data.address
      chai.expect(address).to.have.length(34)
      chai.expect(address.substring(0,1)).to.not.be.uppercase

      //const unspent = await listUnspent(address)
     // console.log("unspent",unspent)
      //const transactions = await listTransactions(address)
     // console.log("transactions",transactions)
    })

    it('should check the full balance of a wallets derivation path ', async () => {
      changeNetwork('regtest')
      const mnemonic = "refuse brush romance together undo document tortoise life equal trash sun ask"
      const hdKey = createHdKeyFromMnemonic(mnemonic)
      const balance = await getBalanceOfWallet(hdKey,'m/0/0/0')
      console.log('balance of ',balance)
      chai.assert.isAtLeast(balance.balance,1,"should be at least 1")
    })

    it('encrypt and decrypt seed phrase', function () {
      const encryptedSeedPhrase = encryptAES(SEEDPHRASE, PASSWORD)
      chai.assert.isAbove(encryptedSeedPhrase.length,0,"seed phrase not encrypted")
      const decryptedSeedPhrase = decryptAES(encryptedSeedPhrase, PASSWORD)
      chai.assert.equal(decryptedSeedPhrase,SEEDPHRASE,"seed phrase not decrypted")
    })

  })

});
