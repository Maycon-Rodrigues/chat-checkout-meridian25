import { StellarSdk, Horizon } from "@stellar/stellar-sdk";

// Configurar a transação
// export const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
//   fee: StellarSdk.BASE_FEE,
//   networkPassphrase: StellarSdk.Networks.PUBLIC,
// })
//   .addOperation(
//     StellarSdk.Operation.pathPaymentStrictSend({
//       sendAsset: new StellarSdk.Asset(
//         "USDC",
//         "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
//       ), // Emissor USDC
//       sendAmount: "100", // Quantidade de USDC a enviar
//       destination: "GDESTINATIONACCOUNTID...", // Conta de destino
//       destAsset: StellarSdk.Asset.native(), // XLM (asset nativo)
//       destMin: "95", // Quantidade mínima de XLM que o destinatário deve receber
//       path: [], // Deixe vazio para o Stellar encontrar o melhor caminho
//     }),
//   )
//   .setTimeout(180)
//   .build();

// Exemplo com JavaScript SDK
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export async function getAccountAssets(publicKey) {
  try {
    const account = await server.accounts().accountId(publicKey).call();

    // Lista todos os balances (assets)
    account.balances.forEach((balance) => {
      if (balance.asset_type === "native") {
        console.log(`XLM: ${balance.balance}`);
      } else {
        console.log(
          `${balance.asset_code} (${balance.asset_issuer}): ${balance.balance}`,
        );
      }
    });

    return account.balances;
  } catch (error) {
    console.error("Erro ao buscar conta:", error);
  }
}
