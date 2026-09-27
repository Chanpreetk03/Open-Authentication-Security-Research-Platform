export type SamlFinding = {
  severity: "high" | "medium" | "info";
  title: string;
  description: string;
};

export type SamlAttribute = {
  name: string;
  format: string;
  values: string[];
};

export type SamlAssertion = {
  id: string;
  version: string;
  issueInstant: string;
  issuer: string;
  nameId: string;
  nameIdFormat: string;
  conditions: {
    notBefore: string;
    notOnOrAfter: string;
    audiences: string[];
  };
  subjectConfirmations: Array<{ method: string; recipient: string; inResponseTo: string; notOnOrAfter: string }>;
  authentication: Array<{ authnInstant: string; sessionIndex: string; contextClass: string }>;
  attributes: SamlAttribute[];
  signed: boolean;
};

export type SamlReport = {
  inputEncoding: "XML" | "Base64 XML";
  rootType: "Response" | "Assertion";
  response: {
    id: string;
    version: string;
    issueInstant: string;
    destination: string;
    inResponseTo: string;
    issuer: string;
    statusCode: string;
    statusMessage: string;
    signed: boolean;
  } | null;
  assertions: SamlAssertion[];
  encryptedAssertionCount: number;
  findings: SamlFinding[];
};

export type SamlInspectionResult =
  | { ok: true; report: SamlReport }
  | { ok: false; error: string };

const SAML_ASSERTION_NS = "urn:oasis:names:tc:SAML:2.0:assertion";
const SAML_PROTOCOL_NS = "urn:oasis:names:tc:SAML:2.0:protocol";
const XML_SIGNATURE_NS = "http://www.w3.org/2000/09/xmldsig#";
const MAX_INPUT_LENGTH = 256 * 1024;
const MAX_ASSERTIONS = 20;
const MAX_ATTRIBUTES = 100;
const MAX_VALUES_PER_ATTRIBUTE = 20;
const MAX_DISPLAY_VALUE_LENGTH = 500;

function text(element: Element | null | undefined): string {
  return element?.textContent?.trim() ?? "";
}

function child(element: Element, namespace: string, localName: string): Element | null {
  for (const candidate of Array.from(element.children)) {
    if (candidate.namespaceURI === namespace && candidate.localName === localName) return candidate;
  }
  return null;
}

function children(element: Element, namespace: string, localName: string): Element[] {
  return Array.from(element.children).filter((candidate) => candidate.namespaceURI === namespace && candidate.localName === localName);
}

function descendants(element: Element, namespace: string, localName: string): Element[] {
  const found: Element[] = [];
  function visit(parent: Element) {
    for (const candidate of Array.from(parent.children)) {
      if (candidate.namespaceURI === namespace && candidate.localName === localName) found.push(candidate);
      visit(candidate);
    }
  }
  visit(element);
  return found;
}

function truncate(value: string): string {
  return value.length > MAX_DISPLAY_VALUE_LENGTH ? `${value.slice(0, MAX_DISPLAY_VALUE_LENGTH)}... (truncated)` : value;
}

function safeEndpoint(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return value;
    return truncate(`${url.origin}${url.pathname}${url.search ? "?[query omitted]" : ""}`);
  } catch {
    return truncate(value);
  }
}

function decodeInput(input: string): { xml: string; encoding: SamlReport["inputEncoding"] } | { error: string } {
  const trimmed = input.trim().replace(/^\uFEFF/, "");
  if (!trimmed) return { error: "Paste raw SAML XML or a Base64-encoded SAMLResponse." };
  if (trimmed.length > MAX_INPUT_LENGTH) return { error: "Input is too large to inspect (maximum 256 KiB)." };
  if (trimmed.startsWith("<")) return { xml: trimmed, encoding: "XML" };

  let encoded = trimmed;
  if (/^SAMLResponse=/i.test(encoded)) {
    try {
      encoded = new URLSearchParams(encoded).get("SAMLResponse") ?? "";
    } catch {
      return { error: "The SAMLResponse form value could not be decoded." };
    }
  }
  encoded = encoded.replace(/\s/g, "");
  if (!encoded || !/^[A-Za-z0-9+/_=-]+$/.test(encoded) || /=.+/.test(encoded) || encoded.length % 4 === 1) {
    return { error: "Input must be raw XML or valid Base64-encoded SAMLResponse data." };
  }

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return { xml: new TextDecoder("utf-8", { fatal: true }).decode(bytes), encoding: "Base64 XML" };
  } catch {
    return { error: "SAMLResponse must be Base64-encoded UTF-8 XML." };
  }
}

function subjectConfirmations(assertion: Element) {
  return descendants(assertion, SAML_ASSERTION_NS, "SubjectConfirmation").map((confirmation) => {
    const data = child(confirmation, SAML_ASSERTION_NS, "SubjectConfirmationData");
    return {
      method: confirmation.getAttribute("Method") ?? "",
      recipient: safeEndpoint(data?.getAttribute("Recipient") ?? ""),
      inResponseTo: data?.getAttribute("InResponseTo") ?? "",
      notOnOrAfter: data?.getAttribute("NotOnOrAfter") ?? "",
    };
  });
}

function parseAssertion(element: Element): SamlAssertion {
  const subject = child(element, SAML_ASSERTION_NS, "Subject");
  const nameId = subject ? child(subject, SAML_ASSERTION_NS, "NameID") : null;
  const conditions = child(element, SAML_ASSERTION_NS, "Conditions");
  const audienceRestrictions = conditions ? children(conditions, SAML_ASSERTION_NS, "AudienceRestriction") : [];
  const audiences = audienceRestrictions.flatMap((restriction) => children(restriction, SAML_ASSERTION_NS, "Audience").map(text));
  const authentication = children(element, SAML_ASSERTION_NS, "AuthnStatement").map((statement) => {
    const context = child(statement, SAML_ASSERTION_NS, "AuthnContext");
    return {
      authnInstant: statement.getAttribute("AuthnInstant") ?? "",
      sessionIndex: statement.getAttribute("SessionIndex") ?? "",
      contextClass: text(context ? child(context, SAML_ASSERTION_NS, "AuthnContextClassRef") : null),
    };
  });
  const attributes = children(element, SAML_ASSERTION_NS, "AttributeStatement")
    .flatMap((statement) => children(statement, SAML_ASSERTION_NS, "Attribute"))
    .slice(0, MAX_ATTRIBUTES)
    .map((attribute) => ({
      name: attribute.getAttribute("Name") ?? "(unnamed attribute)",
      format: attribute.getAttribute("NameFormat") ?? "",
      values: children(attribute, SAML_ASSERTION_NS, "AttributeValue")
        .slice(0, MAX_VALUES_PER_ATTRIBUTE)
        .map((value) => truncate(text(value))),
    }));

  return {
    id: element.getAttribute("ID") ?? "",
    version: element.getAttribute("Version") ?? "",
    issueInstant: element.getAttribute("IssueInstant") ?? "",
    issuer: text(child(element, SAML_ASSERTION_NS, "Issuer")),
    nameId: truncate(text(nameId)),
    nameIdFormat: nameId?.getAttribute("Format") ?? "",
    conditions: {
      notBefore: conditions?.getAttribute("NotBefore") ?? "",
      notOnOrAfter: conditions?.getAttribute("NotOnOrAfter") ?? "",
      audiences,
    },
    subjectConfirmations: subjectConfirmations(element),
    authentication,
    attributes,
    signed: children(element, XML_SIGNATURE_NS, "Signature").length > 0,
  };
}

export function inspectSaml(input: string): SamlInspectionResult {
  const decoded = decodeInput(input);
  if ("error" in decoded) return { ok: false, error: decoded.error };
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(decoded.xml)) {
    return { ok: false, error: "DOCTYPE and entity declarations are not accepted by this local viewer." };
  }

  let document: Document;
  try {
    document = new DOMParser().parseFromString(decoded.xml, "application/xml");
  } catch {
    return { ok: false, error: "The XML document could not be parsed." };
  }
  if (!document.documentElement || document.documentElement.localName === "parsererror" || document.getElementsByTagName("parsererror").length > 0) {
    return { ok: false, error: "The input is not well-formed XML." };
  }

  const root = document.documentElement;
  const rootIsResponse = root.namespaceURI === SAML_PROTOCOL_NS && root.localName === "Response";
  const rootIsAssertion = root.namespaceURI === SAML_ASSERTION_NS && root.localName === "Assertion";
  if (!rootIsResponse && !rootIsAssertion) {
    return { ok: false, error: "Expected a SAML 2.0 Response or Assertion root element." };
  }

  const assertionElements = rootIsAssertion ? [root] : descendants(root, SAML_ASSERTION_NS, "Assertion");
  const encryptedAssertionCount = descendants(root, SAML_ASSERTION_NS, "EncryptedAssertion").length;
  if (assertionElements.length > MAX_ASSERTIONS) {
    return { ok: false, error: `Too many assertions to inspect (maximum ${MAX_ASSERTIONS}).` };
  }
  const assertions = assertionElements.map(parseAssertion);
  const response = rootIsResponse ? {
    id: root.getAttribute("ID") ?? "",
    version: root.getAttribute("Version") ?? "",
    issueInstant: root.getAttribute("IssueInstant") ?? "",
    destination: safeEndpoint(root.getAttribute("Destination") ?? ""),
    inResponseTo: root.getAttribute("InResponseTo") ?? "",
    issuer: text(child(root, SAML_ASSERTION_NS, "Issuer")),
    statusCode: descendants(root, SAML_PROTOCOL_NS, "StatusCode")[0]?.getAttribute("Value") ?? "",
    statusMessage: text(descendants(root, SAML_PROTOCOL_NS, "StatusMessage")[0]),
    signed: children(root, XML_SIGNATURE_NS, "Signature").length > 0,
  } : null;

  const findings: SamlFinding[] = [{ severity: "info", title: "XML signature not validated", description: "This viewer only detects ds:Signature elements. It does not verify signatures, trust keys, or establish that the issuer is authentic." }];
  if (assertions.some((assertion) => assertion.signed) || response?.signed) {
    findings.push({ severity: "info", title: "Signature element present", description: "A signature element was found, but its cryptographic validity and coverage were not checked." });
  } else if (!encryptedAssertionCount) {
    findings.push({ severity: "high", title: "No XML signature element found", description: "The parsed response/assertions contain no XML Signature element. This viewer cannot establish issuer-authenticated protection." });
  }
  if (encryptedAssertionCount > 0) {
    findings.push({ severity: "medium", title: "Encrypted assertion not decrypted", description: `${encryptedAssertionCount} EncryptedAssertion element(s) were found. This viewer does not handle decryption or key material.` });
  }
  if (!assertions.length && !encryptedAssertionCount && rootIsResponse) {
    findings.push({ severity: "medium", title: "Response contains no assertion", description: "No plaintext Assertion or EncryptedAssertion was found in the response." });
  }
  if (assertions.some((assertion) => !assertion.conditions.notOnOrAfter || !assertion.conditions.audiences.length)) {
    findings.push({ severity: "medium", title: "Conditions need relying-party validation", description: "At least one assertion has no NotOnOrAfter or Audience value visible to this viewer. Applicability and acceptance must be checked against the service provider's policy." });
  }
  if (assertions.some((assertion) => assertion.attributes.length >= MAX_ATTRIBUTES)) {
    findings.push({ severity: "info", title: "Attribute display limit reached", description: `Attribute output is limited to ${MAX_ATTRIBUTES} entries per assertion.` });
  }

  return {
    ok: true,
    report: {
      inputEncoding: decoded.encoding,
      rootType: rootIsResponse ? "Response" : "Assertion",
      response,
      assertions,
      encryptedAssertionCount,
      findings,
    },
  };
}
