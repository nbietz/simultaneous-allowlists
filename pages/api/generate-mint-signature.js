import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Mumbai } from "@thirdweb-dev/chains";

const handler = async (req, res) => {
  const { address } = JSON.parse(req.body);
  console.log("address: ", address);

  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.PRIVATE_KEY,
    "mumbai"
  );

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  console.log("contract address: ", contractAddress);
  const contract = await sdk.getContract(
    contractAddress,
    "signature-drop"
  );
  //console.log("contract: ", contract);

  const teamMembers = ["0xd45De39b9046adcbd9fAF0Cc6b74De1Ea210DFB5"];
  const allowList = ["0xf5D0090D29B6701892c5fD461457F3A95Cca5A0d"];

  const determinePrice = (address) => {
    if (teamMembers.includes(address)) {
      return 0;
    }
    if (allowList.includes(address)) {
      return 0.0001;
    }
    return 0.0001;
  };

  const nftMetadata = {
    name: "Token 2 Name",
    description: "Token 2 Description",
    image: "ipfs://QmXAHQno8REz86Lpw8bzTzu7ABi8VJta9bykuEd9xKD8sK/2.png"
  };
  const startTime = new Date(0);
  const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const price = determinePrice(address);
  const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000001010"
  const payload1 = {
    metadata: "ipfs://QmbWp8q8Q6QQw3zCto1AP3GQZ9wPMfhxnTV4TsMScwUmsc/2",
    to: address,
    quantity: 1,
    price: price,
    currencyAddress: NATIVE_TOKEN_ADDRESS,
    mintStartTime: startTime,
    mintEndTime: endTime,
    royaltyRecipient: "0xd45De39b9046adcbd9fAF0Cc6b74De1Ea210DFB5",
    royaltyBps: 1000, // 10%
    primarySaleRecipient: "0xd45De39b9046adcbd9fAF0Cc6b74De1Ea210DFB5",
  };
  const payload2 = { 
    to: address,
    metadata: "ipfs://QmbWp8q8Q6QQw3zCto1AP3GQZ9wPMfhxnTV4TsMScwUmsc/2",
    currencyAddress: NATIVE_TOKEN_ADDRESS,
    price: price,
    primarySaleRecipient: "0xd45De39b9046adcbd9fAF0Cc6b74De1Ea210DFB5"
  };
  const payload = {
    to: address,
    price: price,
    mintStartTime: startTime,
  };
  console.log("payload: ", payload);

  try {
    const signedPayload = await contract.erc721.signature.generate(payload);
    console.log("signedPayload: ", signedPayload);

    return res.status(200).json({
      signedPayload: signedPayload,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export default handler;