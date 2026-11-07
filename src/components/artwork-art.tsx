import type { Artwork } from "@/lib/data";

// Generative placeholder art: each listing gets a seeded composition so 80+ works look distinct without image files.
function rng(seed: number) {
  let a = seed * 9301 + 49297;
  return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
}

export function ArtworkArt({ artwork, className, style: boxStyle, framed = false }: { artwork: Pick<Artwork, "art" | "width" | "height" | "title">; className?: string; style?: React.CSSProperties; framed?: boolean }) {
  const { style, palette, seed } = artwork.art;
  const r = rng(seed);
  const W = 100, H = Math.round((artwork.height / artwork.width) * 100);
  const [bg, c1, c2, c3] = palette;
  const shapes: React.ReactNode[] = [];

  switch (style) {
    case "bands": {
      let y = 0; let i = 0;
      while (y < H) { const h = 8 + r() * 30; shapes.push(<rect key={i} x={0} y={y} width={W} height={h + 1} fill={palette[i % 4]} />); y += h; i++; }
      break;
    }
    case "sun": {
      const cy = H * (0.3 + r() * 0.2);
      shapes.push(<rect key="g" x={0} y={H * 0.66} width={W} height={H} fill={c2} />, <rect key="g2" x={0} y={H * 0.68} width={W} height={H} fill={c3} opacity={0.35} />,
        <circle key="h" cx={50 + (r() - 0.5) * 30} cy={cy} r={W * 0.3} fill={c2} opacity={0.45} />, <circle key="s" cx={50 + (r() - 0.5) * 30} cy={cy} r={W * 0.2} fill={c1} />);
      break;
    }
    case "grid": {
      const step = 8 + Math.floor(r() * 6);
      for (let x = step; x < W; x += step) shapes.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} stroke={c1} strokeWidth={0.4} />);
      for (let y = step; y < H; y += step) shapes.push(<line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} stroke={c1} strokeWidth={0.4} />);
      shapes.push(<rect key="f" x={step * 2} y={step * 2} width={step * 2} height={step} fill={c3} />, <rect key="f2" x={step * 5} y={step * 4} width={step} height={step * 2} fill={c2} opacity={0.6} />);
      break;
    }
    case "arch": {
      const w = 40 + r() * 25;
      shapes.push(<path key="a" d={`M ${50 - w / 2} ${H} L ${50 - w / 2} ${H * 0.5} A ${w / 2} ${w / 2} 0 0 1 ${50 + w / 2} ${H * 0.5} L ${50 + w / 2} ${H} Z`} fill={c1} />,
        <circle key="c" cx={50} cy={H * 0.25} r={6} fill={c3} />, <rect key="l" x={0} y={H * 0.92} width={W} height={H} fill={c2} />);
      break;
    }
    case "blobs": {
      for (let i = 0; i < 6; i++) shapes.push(<ellipse key={i} cx={r() * W} cy={r() * H} rx={8 + r() * 22} ry={8 + r() * 18} fill={palette[1 + (i % 3)]} opacity={0.85} />);
      break;
    }
    case "stripes": {
      const w = 4 + r() * 6;
      for (let x = 0, i = 0; x < W; x += w, i++) shapes.push(<rect key={i} x={x} y={0} width={w * 0.7} height={H} fill={palette[1 + (i % 3)]} />);
      break;
    }
    case "rings": {
      const cx = 30 + r() * 40, cy = H * (0.5 + r() * 0.3);
      for (let i = 6; i > 0; i--) shapes.push(<circle key={i} cx={cx} cy={cy} r={i * 11} fill={palette[i % 4]} opacity={0.9} />);
      break;
    }
    case "blocks": {
      for (let i = 0; i < 7; i++) shapes.push(<rect key={i} x={r() * 80} y={r() * (H - 20)} width={12 + r() * 35} height={10 + r() * 30} fill={palette[1 + (i % 3)]} opacity={0.92} />);
      break;
    }
    case "wave": {
      for (let i = 0; i < 6; i++) {
        const y = (H / 6) * i + 6; const a = 4 + r() * 6;
        shapes.push(<path key={i} d={`M0 ${y} Q 25 ${y - a} 50 ${y} T 100 ${y} V ${H} H 0 Z`} fill={palette[(i % 3) + 1]} opacity={0.75} />);
      }
      break;
    }
    case "tilt": {
      shapes.push(<polygon key="p" points={`0,${H} ${W},${H * 0.35} ${W},${H} `} fill={c1} />, <polygon key="q" points={`0,${H * 0.2} ${W * 0.7},0 ${W * 0.2},${H * 0.7}`} fill={c2} opacity={0.8} />,
        <rect key="w" x={W * 0.55} y={H * 0.12} width={W * 0.3} height={H * 0.38} fill={bg} stroke={c3} strokeWidth={1.2} />);
      break;
    }
  }

  const svg = (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={artwork.title} style={{ display: "block", width: "100%", height: "100%" }}>
      <rect width={W} height={H} fill={bg} />
      {shapes}
    </svg>
  );

  if (!framed) return <div className={className} style={{ aspectRatio: `${W} / ${H}`, ...boxStyle }}>{svg}</div>;
  return (
    <div className={`wall ${className ?? ""}`}>
      <div className="wall-frame" style={{ aspectRatio: `${W} / ${H}` }}>{svg}</div>
    </div>
  );
}
