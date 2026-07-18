import { GameProvider } from "@/contexts/GameProvider";
import { GameShell } from "@/components/GameShell";
import React from "react";

export default function Home() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
