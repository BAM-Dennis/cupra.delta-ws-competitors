"use client";

import { demoLeaderboard, demoProgress } from "@/lib/demoData";
import { participantScore } from "@/lib/participant";
import { useLocalSession } from "@/lib/useLocalSession";
import { Background } from "../shared/Background";
import { AppHeader } from "./AppHeader";
import { ArgueScreen } from "./ArgueScreen";
import { DevBar } from "./DevBar";
import { JoinScreen } from "./JoinScreen";
import { MatrixScreen, RevealScreen } from "./MatrixScreens";
import { ResultScreen } from "./ResultScreen";
import { ExploreScreen, LobbyScreen, PersonaScreen } from "./Screens";

/** Teilnehmer-App: ein Screen-Wechsel pro Phase, kein Routing im Flow. */
export function ParticipantApp({ code }: { code: string }) {
  const s = useLocalSession(code);
  const { config, state, me } = s;

  if (!s.loaded) return <Background variant="blur" />;

  if (!me) {
    return (
      <>
        <JoinScreen config={config} code={code} onJoin={s.join} />
        <DevBar state={state} dispatch={s.dispatch} />
      </>
    );
  }

  const score = participantScore(me);
  const progress = demoProgress(config, state.phase, state.round, me);

  let body: React.ReactNode;
  switch (state.phase) {
    case "lobby":
      body = <LobbyScreen me={me} participants={progress.participants} />;
      break;
    case "persona":
      body = <PersonaScreen config={config} round={state.round} />;
      break;
    case "explore":
      body = <ExploreScreen config={config} round={state.round} />;
      break;
    case "argue":
      body = (
        <ArgueScreen
          key={state.round}
          config={config}
          round={state.round}
          me={me}
          onSubmit={(text) => s.submitArgument(state.round, text)}
          onFinish={() => s.finishRound(state.round)}
        />
      );
      break;
    case "matrix":
      body = <MatrixScreen config={config} me={me} onSubmit={s.submitMatrix} />;
      break;
    case "reveal":
      body = <RevealScreen config={config} me={me} />;
      break;
    case "leaderboard":
    case "ended":
      body = <ResultScreen config={config} me={me} leaderboard={demoLeaderboard(config, state.phase, state.round, me)} />;
      break;
  }

  return (
    <>
      <Background variant="blur" />
      <div className="relative flex flex-1 flex-col px-5 pb-[max(16px,env(safe-area-inset-bottom))]">
        <AppHeader config={config} phase={state.phase} round={state.round} score={score} displayName={me.displayName} />
        {body}
      </div>
      <DevBar state={state} dispatch={s.dispatch} onLeave={s.leave} />
    </>
  );
}
