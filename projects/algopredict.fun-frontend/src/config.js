import { AlgoPredictClient } from "./contracts/AlgoPredict";
import * as algokit from "@algorandfoundation/algokit-utils";

export const APP_ID = 728411903;
export const APP_ADDRESS = "YGQNEMRWMBGXFUWY4AYC7KXNM6G27MLAXRD35ABYKJHAIPRJ4SRPSENBFI";
export const APP_ADMIN = "XVE46DEMVUAPRNUF3MCMFSJ7SDUUDLGDH3M5DYFAYFK7MF4TPMBSPUQRQE";

export const TXN_URL = "https://lora.algokit.io/testnet/transaction/"

export const algorandClient = algokit.AlgorandClient.testNet();

export const Caller = new AlgoPredictClient(
  {
    resolveBy: "id",
    id: APP_ID,
  },
  algorandClient.client.algod
);
