import { 
  ConnectWallet, 
  useContract, 
  Web3Button, 
  useAddress } from "@thirdweb-dev/react";
import { useState } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {

  const address = useAddress();
  const contracAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const contract = useContract(
    contracAddress,
    "signature-drop"
  ).contract;

  const [loading, setLoading] = useState(false);

  async function claim() {
    setLoading(true);
    console.log("claim() contract:", contract);
    try {
      const tx = await contract.claim(1);
      console.log("claim() tx:", tx);
      alert(`Succesfully minted NFT!`);
    } catch (error) {
      alert(error?.message);
    } finally {
      setLoading(false);
    }
  }

  async function claimWithSignature() {
    setLoading(true);
    const signedPayloadRes = await fetch("/api/generate-mint-signature", {
      method: "POST",
      body: JSON.stringify({
        address: address,
      }),
    });

    console.log("signedPayloadRes", signedPayloadRes);

    if (signedPayloadRes.status === 400) {
      alert(
        "Looks like you don't own an early access NFT :( You don't qualify for the free mint."
      );
      return;
    } else {
      try {
        const signedPayload = await signedPayloadRes.json();
        console.log("signedPayload", signedPayload);

        // Provide the generated payload to verify that it is valid
        const isValid = await contract.signature.verify(signedPayload);
        console.log("isValid", isValid);
        const tx = await contract.signature.mint(signedPayload);
        console.log("tx", tx);
        const receipt = tx.receipt; // the mint transaction receipt
        console.log("receipt", receipt);
        const mintedId = tx.id; // the id of the NFT minted
        console.log("mintedId", mintedId);
        
        alert(`Succesfully minted NFT!`);
      } catch (error) {
        alert(error?.message);
      } finally {
        setLoading(false);
      }
    }
  }


  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Claim with Signature
        </h1>

        <div className={styles.grid}>
          <ConnectWallet />
          {address && (
          <div className={styles.container}>
            <div className={styles.card}>
              <Image
                src="/icons/drop.webp"
                alt="drop"
                className={styles.cardImg}
                height={42}
                width={42}
              />
              <h2 className={styles.selectBoxTitle}>Claim NFT</h2>
              <p className={styles.selectBoxDescription}>
                Use the normal <code>claim</code> function to mint an NFT under the
                conditions of the claim phase.
              </p>

              <Web3Button
                className={styles.button} 
                contractAddress={contracAddress}
                action={() => claim()}
                theme="dark"
                disabled={loading}
              >
                {loading ? "Loading..." : "Claim"}
              </Web3Button>
            </div>

            <div className={styles.card}>
              <Image
                width={42}
                height={42}
                src="/icons/analytics.png"
                alt="signature-mint"
                className={styles.cardImg}
              />
              <h2 className={styles.selectBoxTitle}>Mint with Signature</h2>
              <p className={styles.selectBoxDescription}>
                Check if you are eligible to mint an NFT for free, by using
                signature-based minting.
              </p>

              <Web3Button
                className={styles.button}
                contractAddress={contracAddress}
                action={() => claimWithSignature()}
                theme="dark"
                disabled={loading}
              >
                {loading ? "Loading..." : "Claim With Signature"}
              </Web3Button>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
