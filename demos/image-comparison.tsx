import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { ImageComparison } from '../ui/image-comparison';
import { useTheme } from '../ui/theme';
import { PlayAgain, PlayfulDemo } from './playful-demo';

function Landscape({ night = false }: { night?: boolean }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 340" preserveAspectRatio="xMidYMid slice">
      <Rect width="320" height="340" fill={night ? '#142b3b' : '#f2d9b1'} />
      <Circle cx="233" cy="82" r="29" fill={night ? '#e9f2da' : '#ee8b54'} />
      {night && (
        <>
          <Circle cx="49" cy="71" r="2" fill="#c5dace" />
          <Circle cx="133" cy="42" r="1.5" fill="#c5dace" />
          <Circle cx="285" cy="131" r="2" fill="#c5dace" />
        </>
      )}
      <Path d="M0 188Q70 90 166 178T320 150V340H0Z" fill={night ? '#24505a' : '#a8b194'} />
      <Path d="M0 232Q112 144 224 228T320 206V340H0Z" fill={night ? '#163e45' : '#688c78'} />
      <Path d="M0 290Q160 219 320 286V340H0Z" fill={night ? '#0d2b32' : '#355f54'} />
      <Rect x="105" y="198" width="104" height="78" rx="2" fill={night ? '#486968' : '#f2e6cf'} />
      <Path d="M91 201L157 151L223 201Z" fill={night ? '#10292e' : '#b46c4d'} />
      <Rect x="146" y="231" width="23" height="45" fill={night ? '#ffc980' : '#8a634d'} />
      <Rect x="117" y="218" width="17" height="20" fill={night ? '#ffc980' : '#adc6bf'} />
      <Rect x="181" y="218" width="17" height="20" fill={night ? '#ffc980' : '#adc6bf'} />
      <Path d="M149 276Q164 297 132 340H194Q179 297 166 276" fill={night ? '#547a74' : '#d4b88b'} />
      <Path
        d="M42 277V209M27 235L42 207L57 235M24 253L42 225L60 253"
        stroke={night ? '#6d9b88' : '#254f42'}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export default function ImageComparisonDemo() {
  const { colors } = useTheme();
  const [round, setRound] = useState(0);
  const [position, setPosition] = useState(0.5);
  return (
    <PlayfulDemo
      number="05"
      title="A change of light."
      description="Same little place. Two different feelings. Drag the seam to explore."
    >
      <ImageComparison
        key={round}
        testID="comparison"
        before={<Landscape />}
        after={<Landscape night />}
        beforeLabel="Day"
        afterLabel="Night"
        aspectRatio={320 / 340}
        onPositionChange={setPosition}
      />
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.status, { color: colors.mutedForeground }]}
      >
        {Math.round(position * 100)}% daylight. A new perspective.
      </Text>
      <PlayAgain
        testID="comparison-reset"
        onPress={() => {
          setRound((value) => value + 1);
          setPosition(0.5);
        }}
      />
    </PlayfulDemo>
  );
}
const styles = StyleSheet.create({ status: { fontSize: 12, textAlign: 'center', lineHeight: 20 } });
