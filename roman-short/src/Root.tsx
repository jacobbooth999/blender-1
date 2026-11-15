import React from "react";
import { Composition } from "remotion";
import { RomeShort, ROME_FRAMES } from "./videos/rome/Rome";
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="RomeShort" component={RomeShort} durationInFrames={ROME_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ step: 1 }} />
    <Composition id="RomePreview" component={RomeShort} durationInFrames={Math.ceil(ROME_FRAMES / 2)} fps={15} width={1080} height={1920} defaultProps={{ step: 2 }} />
  </>
);
