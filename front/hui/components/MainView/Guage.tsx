import * as React from 'react';
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
  GaugeValueText,
} from '@mui/x-charts/Gauge';

function GaugePointer(props: Props) {
    const { valueAngle, outerRadius, cx, cy } = useGaugeState();
  
    if (valueAngle === null) {
      // No value to display
      return null;
    }
  
    const target = {
      x: cx + outerRadius * Math.sin(props.valueAngle * Math.PI / 180),
      y: cy - outerRadius * Math.cos(props.valueAngle * Math.PI / 180),
    };
  
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="red" />
        <path
          d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
          stroke="red"
          strokeWidth={3}
        />
      </g>
    );
  }

type Props = {
    active: boolean,
    value?: number,
    valueMax?: number,
    title?: string,
    theme: any
}

export default function Guage(props: Props) {
    const [text, setText] = React.useState('');
    const [valueAngle, setValueAngle] = React.useState<number | null>(null);
    const [targetValueAngle, setTargetValueAngle] = React.useState<number | null>(null);

    React.useEffect(() => {
      if (props.active && props.value && props.valueMax) {
        const angle = (props.value / props.valueMax) * 220 - 110;
        setTargetValueAngle(angle);
      } else {
        setText('N/A');
        setTargetValueAngle(null);
        setValueAngle(null);
      }
    }, [props.active, props.value, props.valueMax]);
    React.useEffect(() => {
        if (targetValueAngle !== null) {
          const intervalId = setInterval(() => {
            if (valueAngle === null || Math.abs(valueAngle - targetValueAngle) < 1) {
              setValueAngle(targetValueAngle);
              setText(`${((((((valueAngle ? valueAngle : targetValueAngle) + 110) / 220) * 100)).toFixed(2))}%`);
            } else {
              setValueAngle(valueAngle + (targetValueAngle - valueAngle) / 10);
              setText(`${(((((valueAngle + 110) / 220) * 100)).toFixed(2))}%`);
            }
          }, 32); // 16ms = 60fps
          return () => clearInterval(intervalId);
        }
    }, [targetValueAngle, valueAngle]);
    return (
      <div className="flex flex-col">
        <GaugeContainer
          width={140}
          height={180}
          startAngle={-110}
          endAngle={110}
          value={props.value}
          valueMax={props.valueMax}
          sx={{
            marginTop: -5,
            scale: 0.4
          }}
        >
          <GaugeReferenceArc/>
          <GaugeValueArc valueAngle={valueAngle} />
          <GaugePointer valueAngle={valueAngle} />
          <GaugeValueText fontSize={28} text={text} y={160} />
        </GaugeContainer>
        <span className="self-center" style={{color: props.theme.palette.text.secondary}}>{props.title}</span>
      </div>
    );
  }