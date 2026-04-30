type CoordinateProps = {
  lat?: string;
  lon?: string;
  block?: string;
  className?: string;
};

/**
 * Coordinate — small kicker rendering a "lat·lon" or "block" stamp.
 * Mostly decorative; reinforces the "field journal / terminal" frame.
 */
export const Coordinate = ({ lat, lon, block, className }: CoordinateProps) => {
  return (
    <span className={`coordinate inline-flex items-center gap-2 ${className ?? ""}`}>
      {lat && lon ? (
        <span>
          ⌖ {lat} / {lon}
        </span>
      ) : null}
      {block ? <span>▤ blk {block}</span> : null}
    </span>
  );
};
