import React from "react";
import { Composition, registerRoot } from "remotion";
import { RomeShort, ROME_FRAMES } from "../../videos/rome_world/Rome";
const Root: React.FC = () => <Composition id="RomeShort" component={RomeShort} durationInFrames={ROME_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
