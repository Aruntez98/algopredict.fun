import { AlgoPredictClient } from "./contracts/AlgoPredict";
import * as algokit from "@algorandfoundation/algokit-utils";

export const APP_ID = 728438235;
export const APP_ADDRESS = "4QKM5VTA4UJGWBWBN73HBJFX6Z4BHNK3BWF4FSWK64N6E7B7FX3PBRPUP4";
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
