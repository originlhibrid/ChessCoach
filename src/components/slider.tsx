import { Grid, Slider as MuiSlider, Typography } from "@mui/material";
import { PrimitiveAtom, useAtom } from "jotai";

interface Props {
  atom: PrimitiveAtom<number>;
  min: number;
  max: number;
  label: string;
  xs?: number;
}

export default function Slider({ min, max, label, atom, xs }: Props) {
  const [value, setValue] = useAtom(atom);

  return (
    <Grid
      item
      container
      xs={xs ?? 10}
      justifyContent="center"
      alignItems="center"
    >
      <Typography
        id={`input-${label}`}
        gutterBottom
        textAlign="left"
        width="100%"
      >
        {label}
      </Typography>
      <MuiSlider
        min={min}
        max={max}
        marks={Array.from({ length: max - min + 1 }, (_, i) => ({
          value: i + min,
          label: `${i + min}`,
        }))}
        valueLabelDisplay="off"
        value={value}
        onChange={(_, value) => setValue(value as number)}
        aria-labelledby={`input-${label}`}
      />
    </Grid>
  );
}