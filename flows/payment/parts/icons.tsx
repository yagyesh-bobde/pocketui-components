import Svg, { Path } from 'react-native-svg';

export function PaymentIcon({
  color,
  kind,
}: {
  color: string;
  kind: 'arrow' | 'delete' | 'sparkle';
}) {
  const path =
    kind === 'arrow'
      ? 'M5 7l5 5-5 5m8-10 5 5-5 5'
      : kind === 'delete'
        ? 'M9 5h12v14H9l-7-7 7-7zm3 4 6 6m0-6-6 6'
        : 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" accessible={false}>
      <Path
        d={path}
        stroke={color}
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
