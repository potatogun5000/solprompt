import { FC } from "react";
import Link from "next/link";

export const PendingView : FC = ({}) => {
  return (
    <div className="md:hero mx-auto p-4">
      <div className="w-full hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
            Pending
          </h1>
        </div>
        <div className="text-center mt-10">
          <p>
            Your listing has been submitted for review. <br/>
            check the status of your listings <Link href="/account" className="underline">here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
