/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { bytesToHex, numberToBytes, pad, toHex, trim } from "viem";
import { signTypedData } from "@wagmi/core";
import { config } from "@/app/utils/config";
import { initializeClient } from "@/app/utils/publicClient";
import { useAccount, useWriteContract } from "wagmi";
import contractABI from "@/usdc.json";
import axios from "axios";

const client = initializeClient();

export default function NewPostTab() {
  const { writeContractAsync } = useWriteContract();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [sign, setSign] = useState("");
  const [validAfter, setValidAfter] = useState("");
  const [validBefore, setValidBefore] = useState("");
  const [nonce, setNonce] = useState("");
  const { address, isConnected } = useAccount();
  const [isParticipating, setIsParticipating] = useState(false);

  const validateAddress = (address: string): `0x${string}` => {
    return address.startsWith("0x")
      ? (address as `0x${string}`)
      : (`0x${address}` as `0x${string}`);
  };

  const getSign = async () => {
    try {
      const validFrom = validateAddress(from);
      const validTo = validateAddress(to);

      const nonceBytes = bytesToHex(
        numberToBytes(parseInt(nonce), { size: 32 }),
        { size: 32 }
      );
      const validNonce = nonceBytes.startsWith("0x")
        ? nonceBytes
        : `0x${nonceBytes}`;

      const valueBigInt = BigInt(value);
      const validAfterBigInt = BigInt(validAfter);
      const validBeforeBigInt = BigInt(validBefore);

      const signature = await signTypedData(config, {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        domain: {
          name: "USD Coin",
          version: "2",
          chainId: BigInt(1),
          verifyingContract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
        primaryType: "TransferWithAuthorization",
        message: {
          from: validFrom,
          to: validTo,
          value: valueBigInt,
          validAfter: validAfterBigInt,
          validBefore: validBeforeBigInt,
          nonce: validNonce as `0x${string}`,
        },
      });

      console.log("Signature:", signature);

      setSign(signature);
      try {
        const response = await axios.post("/api/initiateTransaction", {
          initiator: address,
          sender: from,
          receiver: to,
          amount: value,
          validAfter: validAfter,
          validBefore: validBefore,
          chainId: 1,
          sign: signature,
          nonce: nonce,
        });

        console.log("API response:", response.data);
        // Handle the API response as needed
      } catch (apiError) {
        console.error("API call error:", apiError);
        // Handle API error
      }
    } catch (error) {
      console.error("Error signing data:", error);
    }
  };

  const handleTransfer = async () => {
    if (!isConnected) {
      alert("Please connect your account to participate.");
      return;
    }

    console.log("hello");

    try {
      setIsParticipating(true);
      console.log("hehe");
      const tx = await writeContractAsync({
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        account: address,
        abi: contractABI,
        functionName: "transferWithAuthorization",
        args: [
          from,
          to,
          value,
          validAfter,
          validBefore,
          // trim(toHex(nonce)),
          pad(validateAddress(nonce)),
          sign,
        ],
      });
      console.log(tx);
      const receipt = await client.waitForTransactionReceipt({ hash: tx });
      console.log(receipt);

      if (receipt) {
        setIsParticipating(false);
        window.location.reload();
      }
    } catch (error) {
      console.log("Error participating:", error);
    } finally {
      setIsParticipating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">
          USDC 712 Approval
        </h1>
        <p className="text-xl font-medium text-center text-gray-700 mb-6">
          Send your USDC without using any gas!
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700">From Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md text-black"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Enter 'from' address"
            />
          </div>
          <div>
            <label className="block text-gray-700">To Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md text-black"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Enter 'to' address"
            />
          </div>
          <div>
            <label className="block text-gray-700">
              Value (in USDC smallest unit)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-md text-black"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value (e.g., 1000000)"
            />
          </div>
          <div>
            <label className="block text-gray-700">
              Valid After (Unix timestamp)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-md text-black"
              value={validAfter}
              onChange={(e) => setValidAfter(e.target.value)}
              placeholder="Enter 'valid after' timestamp"
            />
          </div>
          <div>
            <label className="block text-gray-700">
              Valid Before (Unix timestamp)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-md text-black"
              value={validBefore}
              onChange={(e) => setValidBefore(e.target.value)}
              placeholder="Enter 'valid before' timestamp"
            />
          </div>
          <div>
            <label className="block text-gray-700">Nonce</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md text-black"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              placeholder="Enter nonce"
            />
          </div>
          <div className="flex justify-center">
            {/* <p>{sign}</p> */}
            <button
              className="mt-4 bg-indigo-700 text-white px-4 py-2 rounded-md"
              onClick={getSign}
            >
              Get Sign
            </button>
            <button
              className="mt-4 bg-indigo-700 text-white px-4 py-2 rounded-md"
              onClick={handleTransfer}
            >
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
