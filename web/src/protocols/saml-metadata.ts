export type MetadataEndpoint = {
  kind: string;
  binding: string;
  location: string;
  responseLocation: string;
  index: string;
  isDefault: string;
};

export type MetadataRole = {
  kind: "Identity Provider" | "Service Provider" | "Other SAML role";
  protocolSupport: string;
  endpoints: MetadataEndpoint[];
  nameIdFormats: string[];
  certificates: Array<{ use: string; count: number }>;
};

export type MetadataEntity = {
  entityId: string;
  id: string;
  validUntil: string;
  validity: "expired" | "valid" | "unknown";
  cacheDuration: string;
  roles: MetadataRole[];
};

export type MetadataReport = {
  rootType: "EntityDescriptor" | "EntitiesDescriptor";
  signaturePresent: boolean;
  entities: MetadataEntity[];
  findings: Array<{ severity: "high" | "medium" | "info"; title: string; description: string }>;
};

export type MetadataInspectionResult =
  | { ok: true; report: MetadataReport }
  | { ok: false; error: string };

const METADATA_NS = "urn:oasis:names:tc:SAML:2.0:metadata";
const ASSERTION_NS = "urn:oasis:names:tc:SAML:2.0:assertion";
const SIGNATURE_NS = "http://www.w3.org/2000/09/xmldsig#";
const MAX_INPUT_LENGTH = 1024 * 1024;
const MAX_ENTITIES = 50;
const MAX_ENDPOINTS = 100;
const MAX_CERTIFICATES = 20;
const MAX_TEXT_LENGTH = 500;
const ENDPOINT_NAMES = new Set(["SingleSignOnService", "SingleLogoutService", "ArtifactResolutionService", "AssertionConsumerService", "ManageNameIDService", "NameIDMappingService"]);

function directChildren(element: Element, namespace: string, name: string): Element[] {
  return Array.from(element.children).filter((node) => node.namespaceURI === namespace && node.localName === name);
}

function descendants(element: Element, namespace: string, name: string): Element[] {
  const found: Element[] = [];
  const pending = Array.from(element.children).reverse();
  while (pending.length) {
    const node = pending.pop()!;
    if (node.namespaceURI === namespace && node.localName === name) found.push(node);
    const children = Array.from(node.children);
    for (let index = children.length - 1; index >= 0; index -= 1) {
      pending.push(children[index]);
    }
  }
  return found;
}

function safeEndpoint(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return value.slice(0, MAX_TEXT_LENGTH);
    return `${url.origin}${url.pathname}${url.search ? "?[query omitted]" : ""}`.slice(0, MAX_TEXT_LENGTH);
  } catch {
    return value.slice(0, MAX_TEXT_LENGTH);
  }
}

function parseRole(element: Element): MetadataRole {
  const roleName = element.localName;
  const kind = roleName === "IDPSSODescriptor" ? "Identity Provider"
    : roleName === "SPSSODescriptor" ? "Service Provider" : "Other SAML role";
  const endpoints: MetadataEndpoint[] = [];
  for (const endpoint of Array.from(element.children).filter((node) => node.namespaceURI === METADATA_NS && ENDPOINT_NAMES.has(node.localName))) {
    if (endpoints.length >= MAX_ENDPOINTS) break;
    const location = endpoint.getAttribute("Location") ?? "";
    endpoints.push({
      kind: endpoint.localName,
      binding: (endpoint.getAttribute("Binding") ?? "").slice(0, MAX_TEXT_LENGTH),
      location: safeEndpoint(location),
      responseLocation: safeEndpoint(endpoint.getAttribute("ResponseLocation") ?? ""),
      index: endpoint.getAttribute("index") ?? "",
      isDefault: endpoint.getAttribute("isDefault") ?? "",
    });
  }

  const certificates = directChildren(element, METADATA_NS, "KeyDescriptor")
    .flatMap((descriptor) => descendants(descriptor, SIGNATURE_NS, "X509Certificate").map(() => descriptor.getAttribute("use") || "unspecified"))
    .slice(0, MAX_CERTIFICATES);
  const counts = new Map<string, number>();
  certificates.forEach((use) => counts.set(use, (counts.get(use) ?? 0) + 1));

  return {
    kind,
    protocolSupport: (element.getAttribute("protocolSupportEnumeration") ?? "").slice(0, MAX_TEXT_LENGTH),
    endpoints,
    nameIdFormats: directChildren(element, ASSERTION_NS, "NameIDFormat").slice(0, 50).map((node) => (node.textContent ?? "").trim().slice(0, MAX_TEXT_LENGTH)),
    certificates: [...counts].map(([use, count]) => ({ use, count })),
  };
}

function parseEntity(element: Element, now: number, inheritedValidUntil: string): MetadataEntity {
  const validUntil = element.getAttribute("validUntil") || inheritedValidUntil;
  const validUntilTime = validUntil ? Date.parse(validUntil) : Number.NaN;
  const validity = !Number.isFinite(validUntilTime) ? "unknown" : validUntilTime <= now ? "expired" : "valid";
  const roleNodes = Array.from(element.children).filter((node) => node.namespaceURI === METADATA_NS && /Descriptor$/.test(node.localName) && node.localName !== "EntityDescriptor");
  return {
    entityId: (element.getAttribute("entityID") ?? "").slice(0, MAX_TEXT_LENGTH),
    id: (element.getAttribute("ID") ?? "").slice(0, MAX_TEXT_LENGTH),
    validUntil,
    validity,
    cacheDuration: (element.getAttribute("cacheDuration") ?? "").slice(0, MAX_TEXT_LENGTH),
    roles: roleNodes.map(parseRole),
  };
}

export function inspectSamlMetadata(input: string, now = Date.now()): MetadataInspectionResult {
  const xml = input.trim().replace(/^\uFEFF/, "");
  if (!xml) return { ok: false, error: "Paste SAML metadata XML to inspect." };
  if (xml.length > MAX_INPUT_LENGTH) return { ok: false, error: "Metadata is too large to inspect (maximum 1 MiB)." };
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xml)) return { ok: false, error: "DOCTYPE and entity declarations are not accepted by this local viewer." };

  let document: Document;
  try {
    document = new DOMParser().parseFromString(xml, "application/xml");
  } catch {
    return { ok: false, error: "The XML document could not be parsed." };
  }
  if (!document.documentElement || document.documentElement.localName === "parsererror" || document.getElementsByTagName("parsererror").length > 0) {
    return { ok: false, error: "The input is not well-formed XML." };
  }
  const root = document.documentElement;
  const entityRoot = root.namespaceURI === METADATA_NS && root.localName === "EntityDescriptor";
  const entitiesRoot = root.namespaceURI === METADATA_NS && root.localName === "EntitiesDescriptor";
  if (!entityRoot && !entitiesRoot) return { ok: false, error: "Expected a SAML 2.0 EntityDescriptor or EntitiesDescriptor root element." };

  const nodes = entityRoot ? [root] : descendants(root, METADATA_NS, "EntityDescriptor");
  if (nodes.length > MAX_ENTITIES) return { ok: false, error: `Too many entities to inspect (maximum ${MAX_ENTITIES}).` };
  const entities = nodes.map((node) => {
    let parent = node.parentElement;
    while (parent && parent !== root && !(parent.namespaceURI === METADATA_NS && parent.localName === "EntitiesDescriptor")) {
      parent = parent.parentElement;
    }
    const inheritedValidUntil = parent?.namespaceURI === METADATA_NS && parent.localName === "EntitiesDescriptor"
      ? parent.getAttribute("validUntil") ?? ""
      : "";
    return parseEntity(node, now, inheritedValidUntil);
  });
  const signaturePresent = descendants(root, SIGNATURE_NS, "Signature").length > 0;
  const findings: MetadataReport["findings"] = [{ severity: "info", title: "Metadata trust not established", description: "This viewer does not verify an XML signature, authenticate the source, or determine whether these endpoints or keys are trusted." }];
  if (!signaturePresent) findings.push({ severity: "high", title: "No XML signature element found", description: "No ds:Signature element was found in the metadata document. The source and contents remain unauthenticated." });
  else findings.push({ severity: "info", title: "Signature element present, not verified", description: "A ds:Signature element was detected; cryptographic validity, signature coverage, and signer trust were not checked." });
  if (!entities.length) findings.push({ severity: "medium", title: "No entity descriptors found", description: "The EntitiesDescriptor contains no EntityDescriptor elements." });
  if (entities.some((entity) => entity.validity === "expired")) findings.push({ severity: "high", title: "Metadata validity window expired", description: "At least one entity descriptor has a validUntil timestamp that has passed. This date check does not establish trust or acceptance." });
  if (entities.some((entity) => entity.validity === "unknown")) findings.push({ severity: "medium", title: "Metadata validity is unknown", description: "At least one entity has no parseable validUntil timestamp. This viewer does not infer freshness from cacheDuration." });
  if (entities.some((entity) => !entity.entityId)) findings.push({ severity: "medium", title: "Entity ID missing", description: "At least one EntityDescriptor has no entityID value." });

  return { ok: true, report: { rootType: entityRoot ? "EntityDescriptor" : "EntitiesDescriptor", signaturePresent, entities, findings } };
}
