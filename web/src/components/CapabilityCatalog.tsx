import { CAPABILITY_CATALOG } from "../capabilities";
import type { CapabilityId } from "../capabilities";

export function CapabilitySummary({ capability, onViewCatalog }: {
  capability: (typeof CAPABILITY_CATALOG)[number];
  onViewCatalog: () => void;
}) {
  return <aside className="capability-summary" role="note" aria-label={`${capability.name} capability scope`}>
    <div className="capability-summary-heading">
      <span className="capability-mode">{capability.mode}</span>
      <strong>{capability.protocolScope}</strong>
    </div>
    <p>{capability.supported}</p>
    <button className="capability-link" onClick={onViewCatalog} type="button">View full coverage and exclusions</button>
  </aside>;
}

export function CapabilityCatalog({ onSelect }: { onSelect: (id: CapabilityId) => void }) {
  return <section className="coverage-catalog" aria-labelledby="coverage-title">
    <header className="hero coverage-hero">
      <p className="eyebrow">Protocol Studio / Coverage</p>
      <h1 id="coverage-title">See what each tool supports and where it stops.</h1>
      <p className="intro">This inventory describes current behavior and its limits. Local inspection and synthetic simulations are not standards validation or live interoperability.</p>
    </header>
    <div className="coverage-notice" role="note">
      <strong>Current validation boundary</strong>
      <span>No current feature performs cryptographic verification, standards/profile validation, or live interoperability. Those capabilities are not implemented.</span>
    </div>
    <div className="coverage-grid">
      {CAPABILITY_CATALOG.map((capability) => <article className="coverage-card" key={capability.id}>
        <div className="coverage-card-heading">
          <span className="capability-mode">{capability.mode}</span>
          <button className="coverage-tool-link" onClick={() => onSelect(capability.id)} type="button">Open tool</button>
        </div>
        <h2>{capability.name}</h2>
        <dl>
          <div><dt>Protocol / format scope</dt><dd>{capability.protocolScope}</dd></div>
          <div><dt>Supported behavior</dt><dd>{capability.supported}</dd></div>
          <div><dt>Does not establish</dt><dd>{capability.exclusions}</dd></div>
        </dl>
      </article>)}
    </div>
  </section>;
}
