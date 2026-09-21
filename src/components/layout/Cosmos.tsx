/**
 * Site-wide cosmic background: deep space, faint nebula washes and slow star
 * layers. Pure CSS so it is free to run behind every section.
 */
export function Cosmos() {
  return (
    <div aria-hidden className="cosmos">
      <div className="cosmos-nebula cosmos-nebula-a" />
      <div className="cosmos-nebula cosmos-nebula-b" />
      <div className="cosmos-nebula cosmos-nebula-c" />
      <div className="cosmos-stars cosmos-stars-a" />
      <div className="cosmos-stars cosmos-stars-b" />
      <div className="cosmos-stars cosmos-stars-c" />
      <div className="grain cosmos-grain" />
    </div>
  );
}
