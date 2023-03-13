import { FC } from 'react';
import Image from 'next/image'
import Text from './Text';
import Link from "next/link";
import dynamic from 'next/dynamic';
import React, { useState } from "react";
import { useAutoConnect } from '../contexts/AutoConnectProvider';
import NetworkSwitcher from './NetworkSwitcher';
import NavElement from './nav-element';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export const AppBar: React.FC = () => {
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <div>
      {/* NavBar / Header */}
      <div className="navbar flex h-20 flex-row md:mb-2 shadow-lg text-neutral-content">
        <div className="navbar-start align-items-center">
          <div className="hidden sm:inline w-22 h-22 md:p-2 ml-10 flex-row flex">
            <div className="flex flex-row">
<Image
  alt="idc"  
  src="https://media.discordapp.net/attachments/948164874561781761/1083634852382916658/x1kEpyABAgQIDAQcqBEEQgQIECAgEO3AQIECBAgMBBw6IMSRSBAgAABAg7dBggQIECAwEDAoQ9KFIEAAQIECDh0GyBAgAABAgMBhz4oUQQCBAgQIODQbYAAAQIECAwEHPqgRBEIECBAgIBDtwECBAgQIDAQcOiDEkUgQIAAAQIO3QYIECBAgMBAIE4dTvSxp7NAAAAAElFTkSuQmCC.png"
    width={60}
    height={60}

/>
            <Text variant="sub-heading" className="ml-1 pt-3">
             solprompt.io 
            </Text>
            </div>
          </div>
          <WalletMultiButtonDynamic className="btn-ghost btn-sm relative flex md:hidden text-lg " />
        </div>

        {/* Nav Links */}
        {/* Wallet & Settings */}
        <div className="navbar-end">
          <div className="hidden md:inline-flex align-items-center justify-items gap-6">
          <NavElement
            label="Home"
            href="/"
            navigationStarts={() => setIsNavOpen(false)}
          />
          <NavElement
            label="Marketplace"
            href="/market"
            navigationStarts={() => setIsNavOpen(false)}
          />
          <NavElement
            label="Account"
            href="/account"
            navigationStarts={() => setIsNavOpen(false)}
          />
          <NavElement
            label="Sell"
            href="/sell"
            navigationStarts={() => setIsNavOpen(false)}
          />
          <WalletMultiButtonDynamic className="btn-ghost btn-sm rounded-btn text-lg mr-6 " />
        </div>
          <label
              htmlFor="my-drawer"
              className="btn-gh items-center justify-between md:hidden mr-6"
              onClick={() => setIsNavOpen(!isNavOpen)}>
              <div className="HAMBURGER-ICON space-y-2.5 ml-5">
              <div className={`h-0.5 w-8 bg-purple-600 ${isNavOpen ? 'hidden' : ''}`} />
              <div className={`h-0.5 w-8 bg-purple-600 ${isNavOpen ? 'hidden' : ''}`} />
              <div className={`h-0.5 w-8 bg-purple-600 ${isNavOpen ? 'hidden' : ''}`} />
            </div>
            <div className={`absolute block h-0.5 w-8 animate-pulse bg-purple-600 ${isNavOpen ? "" : "hidden"}`}
              style={{ transform: "rotate(45deg)" }}>
            </div>
            <div className={`absolute block h-0.5 w-8 animate-pulse bg-purple-600 ${isNavOpen ? "" : "hidden"}`}
              style={{ transform: "rotate(135deg)" }}>
            </div>
        </label>
        </div>
      </div>
    </div>
  );
};
