import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Svg width={55} height={67} viewBox="0 0 55 67" fill="none" {...props}>
      <Path
        d="M49.535 14.697c.673.33 1.21.818 1.59 1.447.38.628.596 1.254.698 3.004l.964 16.703 1.35 23.401a7.31 7.31 0 01-7.297 7.731H7.475a7.31 7.31 0 01-7.297-7.73l2.087-36.158.004-.074.224-3.873c.093-1.618.285-2.275.615-2.862l.04-.071.043-.071a3.766 3.766 0 011.589-1.447c.66-.325 1.31-.498 3.056-.504H46.38c1.82 0 2.483.173 3.155.504z"
        fill="#fff"
      />
      <Path
        d="M13.867 38.964c0 6.28 5.95 11.37 13.29 11.37 7.341 0 13.292-5.09 13.292-11.37"
        stroke="#457AFF"
        strokeWidth={6.091}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M37.697 19.472V15.41c0-6.728-4.723-12.182-10.549-12.182S16.6 8.683 16.6 15.41v4.116"
        stroke="#294999"
        strokeWidth={4.873}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
