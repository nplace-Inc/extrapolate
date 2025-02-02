import Layout from "@/components/layout";
import Balancer from "react-wrap-balancer";
import { motion } from "framer-motion";
import { FADE_DOWN_ANIMATION_VARIANTS } from "@/lib/constants";
import { Twitter } from "@/components/shared/icons";
import { useUploadModal } from "@/components/home/upload-modal";
import { Wallet } from "lucide-react";
import PhotoBooth from "@/components/home/photo-booth";
import { redis } from "@/lib/upstash";
import Tooltip from "@/components/shared/tooltip";
import { nFormatter } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
	setUserAddress(userAddress);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        alert('连接 MetaMask 钱包失败，请重试。');
      }
    } else {
      alert('请先安装 MetaMask 扩展。');
    }
  }
  
  async function generateImage() {
  if (!userAddress) {
    alert('请先连接您的 MetaMask 钱包。');
    return;
  }
  setIsGenerating(true);
  try {
    const response = await fetch('https://flask-web-ukekpiikru.cn-hangzhou.fcapp.run/address2image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: userAddress }),
    });

    if (response.ok) {
      setIsGenerating(false);
      const data = await response.json();
      const base64Image = data.image;
      setGeneratedImage(`data:image/png;base64,${base64Image}`);
    } else {
      setIsGenerating(false);
      throw new Error('Error generating image');
    }
  } catch (error) {
    setIsGenerating(false);
    console.error('Error generating image:', error);
    alert('生成图片失败，请重试。');
  }
}
  
  
  return (
    <Layout>
      <motion.div
        className="max-w-2xl px-5 xl:px-0"
        initial="hidden"
        whileInView="show"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        <motion.h1
          className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <Balancer>AI 算命</Balancer>
        </motion.h1>
        <motion.p
          className="mt-6 text-center text-gray-500 md:text-xl"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <Balancer ratio={0.6}>
            Ever wondered how AI assesses your NFT collection taste and personality?{" "}
            <Tooltip
              content={
                <div className="flex flex-col items-center justify-center space-y-3 p-10 text-center sm:max-w-xs">
                  <p className="text-sm text-gray-700">
                    Any photos you upload are automatically deleted after 24
                    hours.
                  </p>
                  <a
                    href="https://github.com/steven-tey/extrapolate"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-4 rounded-full border border-black bg-black py-1.5 px-5 text-sm text-white transition-all hover:bg-white hover:text-black"
                  >
                    See how it works
                  </a>
                </div>
              }
            >
              <span className="hidden cursor-default underline decoration-dotted underline-offset-2 transition-colors hover:text-gray-800 sm:block">
                100% free and privacy-friendly
              </span>
            </Tooltip>
          </Balancer>
        </motion.p>
        <motion.div variants={FADE_DOWN_ANIMATION_VARIANTS} className="-mb-4">
          {!isConnected ? (
            <button
              className="group mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-black bg-black px-6 py-3 text-lg text-white transition-colors hover:bg-white hover:text-black"
              onClick={connectWallet}
            >
              <Wallet className="h-5 w-5 text-white group-hover:text-black" />
              <p>Connect Wallet</p>
            </button>
          ) : (
            <button
              className="group mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-black bg-black px-6 py-3 text-lg text-white transition-colors hover:bg-white hover:text-black"
              onClick={generateImage}
            >
              <Wallet className="h-5 w-5 text-white group-hover:text-black" />
              <p>{isGenerating ? "Generating..." : "Generate"}</p>
            </button>
          )}
	{generatedImage && (
	  <img
	    className="block mx-auto h-auto max-w-lg shadow-lg rounded max-w-full h-auto align-middle border-none mt-6 max-w-full z-9999"
	    src={generatedImage}
	    alt="Generated Image"
	  />
	)}
        </motion.div>
      </motion.div>
    </Layout>
  );
}

export async function getStaticProps() {
  // const count = await redis.dbsize();
  return {
    props: {},
    revalidate: 60,
  };
}
