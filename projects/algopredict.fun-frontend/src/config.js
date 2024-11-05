import { AlgoPredictClient } from "./contracts/AlgoPredict";
import * as algokit from "@algorandfoundation/algokit-utils";

export const APP_ID = 728439464;
export const APP_ADDRESS = "6C64VETLAKL4JNL6TQLUD5BYXIAC2FTS47P6FIX5SZY5PHBV5D7PZCUE2Q";
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
