"use client";

import { demoLeaderboard, demoProgress } from "@/lib/demoData";
import { participantScore } from "@/lib/participant";
import { useLocalSession } from "@/lib/useLocalSession";
import { Background } from "../shared/Background";
import { AppHeader } from "./AppHeader";
import { ArgueScreen } from "./ArgueScreen";
import { FeaturesScreen, InterviewScreen, MotivesRevealScreen, PersonaIntroScreen, SummaryWaitScreen } from "./Comp2Screens";
import { DevBar } from "./DevBar";
import { JoinScreen } from "./JoinScreen";
import { MatrixScreen, RevealScreen } from "./MatrixScreens";
import { ResultScreen } from "./ResultScreen";
import { ExploreScreen, LobbyScreen, PersonaScreen } from "./Screens";

/** Teilnehmer-App: ein Screen-Wechsel pro Phase, kein Routing im Flow. Verzweigt nach Workshop-Typ. */
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
  const round = state.round;

  let body: React.ReactNode = null;
  switch (state.phase) {
    case "lobby":
      body = <LobbyScreen me={me} participants={progress.participants} />;
      break;
    case "persona":
      body = config.type === "competitor-1" ? <PersonaScreen config={config} round={round} /> : <PersonaIntroScreen config={config} round={round} />;
      break;
    case "interview":
      if (config.type === "competitor-2") body = <InterviewScreen key={round} config={config} round={round} me={me} onAsk={(q) => s.askQuestion(round, q)} />;
      break;
    case "motives":
      if (config.type === "competitor-2") body = <MotivesRevealScreen config={config} round={round} me={me} />;
      break;
    case "explore":
      body = (
        <ExploreScreen
          config={config}
          round={round}
          guidance={
            config.type === "competitor-2"
              ? {
                  title: `Look for what serves ${config.rounds[round].persona.name}'s motives`,
                  items: config.rounds[round].persona.motives.map((pm) => config.motives.find((m) => m.id === pm.motiveId)?.label ?? pm.motiveId),
                }
              : undefined
          }
        />
      );
      break;
    case "argue":
      if (config.type === "competitor-1")
        body = (
          <ArgueScreen key={round} config={config} round={round} me={me} onSubmit={(text) => s.submitArgument(round, text)} onFinish={() => s.finishRound(round)} />
        );
      break;
    case "features":
      if (config.type === "competitor-2")
        body = (
          <FeaturesScreen
            key={round}
            config={config}
            round={round}
            me={me}
            onSubmit={(text, motiveId) => s.submitFeature(round, text, motiveId)}
            onFinish={() => s.finishRound(round)}
          />
        );
      break;
    case "matrix":
      if (config.type === "competitor-1") body = <MatrixScreen config={config} me={me} onSubmit={s.submitMatrix} />;
      break;
    case "reveal":
      if (config.type === "competitor-1") body = <RevealScreen config={config} me={me} />;
      break;
    case "summary":
      if (config.type === "competitor-2") body = <SummaryWaitScreen config={config} me={me} />;
      break;
    case "leaderboard":
    case "ended":
      body = <ResultScreen config={config} me={me} leaderboard={demoLeaderboard(config, state.phase, round, me)} />;
      break;
  }

  return (
    <>
      <Background variant="blur" />
      <div className="relative flex flex-1 flex-col px-5 pb-[max(16px,env(safe-area-inset-bottom))]">
        <AppHeader config={config} phase={state.phase} round={round} score={score} displayName={me.displayName} />
        {body}
      </div>
      <DevBar state={state} dispatch={s.dispatch} onLeave={s.leave} />
    </>
  );
}
