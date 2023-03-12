// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';
import Text from "../../components/Text"
// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  return (
  <div className="md:hero mx-auto p-4">
    <div className="md:hero-content flex flex-col">
      <div className="mt-6">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
          Prompt Marketplace of the Future
        </h1>
        <h1 className="text-right text-3xl md:pl-12 font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-teal-500">
            built on Solana
          </span>
        </h1>
      </div>
      <h4 className="md:w-full text-2x1 md:text-xl text-center text-slate-300 my-2 font-bold">
        <p>
          Buy Powerful Prompts<br/>
          Earn SOL with creativity
        </p>
      </h4>
      <div className="flex flex-col mt-2">
        <div className="flex flex-row justify-center">
        <Link
            href={'./market'}
        >

          <button className="px-8 m-2 btn text-black bg-white" onClick={() => {}}>
            <span>Purchase a Prompt</span>
          </button>
        </Link>
        <Link
            href={'./sell'}
        >
          <button
            className="px-8 m-2 btn text-white bg-teal-700"
            onClick={() => {}}
          >
            <span>Sell a Prompt</span>
          </button>
        </Link>
        </div>
      </div>
      <div className="w-full text-left font-bold">
        <Text variant='paragraph'>
          Featured Prompts
        </Text>
        <hr/>
      </div>
      <div className="w-full text-left font-bold">
        <Text variant='paragraph'>
          Best Prompts
        </Text>
        <hr/>
      </div>
      <div className="w-full text-left font-bold">
        <Text variant='paragraph'>
          New Prompts
        </Text>
        <hr/>
      </div>
    </div>
  </div>
  );
};
