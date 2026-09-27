export type InspectionFinding = {
  severity: "high" | "medium" | "info";
  title: string;
  description: string;
};

export type InspectedParameter = {
  name: string;
  value: string;
  redacted: boolean;
};

export type InspectedHeader = {
  name: string;
  value: string;
  redacted: boolean;
};

export type HttpInspection = {
  kind: "url" | "request" | "response";
  summary: string;
  endpoint: string;
  headers: InspectedHeader[];
  parameters: InspectedParameter[];
  bodyLength: number;
  findings: InspectionFinding[];
};

export type HttpInspectionResult =
  | { ok: true; inspection: HttpInspection }
  | { ok: false; error: string };

const MAX_INPUT_LENGTH = 64 * 1024;
const MAX_HEADERS = 200;
const SENSITIVE_NAME = /(?:token|secret|password|authorization|cookie|assertion|samlresponse|api[-_]?key|private[-_]?key|credential|signature|dpop|^jwt$|^code$|^state$|nonce|verifier)/i;
const HEADER_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

function isSensitiveName(name: string) {
  return SENSITIVE_NAME.test(name.replace(/[^a-zA-Z0-9_-]/g, ""));
}

function safeHeaderValue(name: string, value: string): InspectedHeader {
  const lowerName = name.toLowerCase();
  if (lowerName === "location") {
    const destination = parseDestination(value, true);
    if ("error" in destination) return { name, value: "********", redacted: true };
    const queryMarker = destination.parameters.length > 0 ? "?[query omitted]" : "";
    return { name, value: `${destination.endpoint}${queryMarker}`, redacted: destination.parameters.length > 0 };
  }
  if (lowerName === "referer") return { name, value: "********", redacted: true };
  if (lowerName === "set-cookie") {
    const [cookiePair, ...attributes] = value.split(";");
    const cookieName = cookiePair.split("=", 1)[0]?.trim() || "cookie";
    return { name, value: [
      `${cookieName}=********`,
      ...attributes.map((attribute) => attribute.trim()).filter(Boolean),
    ].join("; "), redacted: true };
  }
  if (lowerName === "authorization" || lowerName === "proxy-authorization") {
    const scheme = value.trim().match(/^([A-Za-z][A-Za-z0-9_-]*)\s+/)?.[1];
    return { name, value: scheme ? `${scheme} ********` : "********", redacted: true };
  }
  if (isSensitiveName(name)) return { name, value: "********", redacted: true };
  return { name, value, redacted: false };
}

function parseDestination(raw: string, allowRelative = false): { endpoint: string; parameters: InspectedParameter[]; isHttp: boolean } | { error: string } {
  let url: URL;
  try {
    const absolute = /^https?:\/\//i.test(raw);
    if (!absolute && !allowRelative) return { error: "The request target or redirect destination is not a valid URL." };
    url = new URL(raw, "https://offline.invalid");
    if (!absolute && url.origin !== "https://offline.invalid") {
      return { error: "The request target or redirect destination is not a valid URL." };
    }
    const endpoint = absolute ? `${url.origin}${url.pathname}` : url.pathname;
    const parameters = [...url.searchParams.entries()].map(([name, value]) => {
      const redacted = isSensitiveName(name);
      return { name, value: redacted ? "********" : value, redacted };
    });
    if (url.hash) parameters.push({ name: "(fragment)", value: "********", redacted: true });
    return { endpoint, parameters, isHttp: /^http:\/\//i.test(raw) };
  } catch {
    return { error: "The request target or redirect destination is not a valid URL." };
  }
}

function addDestinationFindings(destination: { isHttp: boolean; parameters: InspectedParameter[] }, findings: InspectionFinding[]) {
  if (destination.isHttp) {
    findings.push({
      severity: "medium",
      title: "Destination uses HTTP",
      description: "The URL explicitly uses unencrypted HTTP. Whether this is acceptable depends on the environment; credentials should not cross an untrusted network this way.",
    });
  }
  if (destination.parameters.some((parameter) => parameter.redacted && parameter.name !== "(fragment)")) {
    findings.push({
      severity: "medium",
      title: "Sensitive-looking value is in the URL",
      description: "Values such as tokens, codes, state, and secrets in URLs can be exposed through browser history, logs, or referrer handling. Values are masked in this view.",
    });
  }
  if (destination.parameters.some((parameter) => parameter.name === "(fragment)")) {
    findings.push({ severity: "info", title: "URL fragment omitted", description: "The fragment is not displayed because it may contain credentials or other sensitive values." });
  }
}

function inspectRawUrl(input: string): HttpInspectionResult {
  const destination = parseDestination(input);
  if ("error" in destination) return { ok: false, error: destination.error };
  const findings: InspectionFinding[] = [{ severity: "info", title: "Offline inspection", description: "This URL was parsed locally. The tool did not send a request or follow a redirect." }];
  addDestinationFindings(destination, findings);
  return {
    ok: true,
    inspection: {
      kind: "url",
      summary: "Redirect URL / destination",
      endpoint: destination.endpoint,
      headers: [],
      parameters: destination.parameters,
      bodyLength: 0,
      findings,
    },
  };
}

export function inspectHttpInput(input: string): HttpInspectionResult {
  const text = input.trim();
  if (!text) return { ok: false, error: "Paste a redirect URL or raw HTTP request/response to inspect." };
  if (text.length > MAX_INPUT_LENGTH) return { ok: false, error: "Input is too large to inspect (maximum 64 KiB)." };
  if (/^https?:\/\//i.test(text)) return inspectRawUrl(text);

  const lines = text.split(/\r?\n/);
  const startLine = lines[0]?.trim() ?? "";
  const requestMatch = startLine.match(/^([!#$%&'*+.^_`|~0-9A-Za-z-]+)\s+(\S+)\s+(HTTP\/(?:1\.[01]|2))$/i);
  const responseMatch = startLine.match(/^HTTP\/(1\.[01]|2)\s+(\d{3})(?:\s+.*)?$/i);
  if (!requestMatch && !responseMatch) {
    return { ok: false, error: "Expected an HTTP request line, HTTP response status line, or absolute HTTP(S) URL." };
  }

  const headers: InspectedHeader[] = [];
  const rawHeaders: Array<{ name: string; value: string }> = [];
  let separator = lines.findIndex((line, index) => index > 0 && line.trim() === "");
  if (separator < 0) separator = lines.length;
  let malformedHeader = false;
  for (const line of lines.slice(1, separator)) {
    const colon = line.indexOf(":");
    if (colon < 1) {
      malformedHeader = true;
      continue;
    }
    const name = line.slice(0, colon).trim();
    if (!HEADER_NAME.test(name)) {
      malformedHeader = true;
      continue;
    }
    rawHeaders.push({ name, value: line.slice(colon + 1).trim() });
    if (rawHeaders.length > MAX_HEADERS) return { ok: false, error: "Input contains too many headers (maximum 200)." };
  }
  for (const header of rawHeaders) headers.push(safeHeaderValue(header.name, header.value));

  const findings: InspectionFinding[] = [{ severity: "info", title: "Offline inspection", description: "This message was parsed locally. The tool did not send it, replay it, or follow any redirect." }];
  if (malformedHeader) findings.push({ severity: "medium", title: "Some header lines could not be parsed", description: "Malformed lines are omitted from the header list. Inspect the original message format before relying on this summary." });

  const body = separator < lines.length ? lines.slice(separator + 1).join("\n") : "";
  const bodyLength = new TextEncoder().encode(body).length;
  if (bodyLength > 0) {
    findings.push({ severity: "info", title: "Message body omitted", description: `The body (${bodyLength} bytes) is intentionally not displayed because it may contain credentials or personal data.` });
  }

  let kind: HttpInspection["kind"];
  let summary: string;
  let endpoint = "(not available)";
  let parameters: InspectedParameter[] = [];

  if (requestMatch) {
    kind = "request";
    const [, method, target, version] = requestMatch;
    if (target === "*") {
      endpoint = "*";
    } else {
      const absoluteTarget = /^https?:\/\//i.test(target);
      if (method.toUpperCase() === "CONNECT") {
        endpoint = target;
      } else {
        const destination = parseDestination(target, !absoluteTarget);
        if ("error" in destination) return { ok: false, error: destination.error };
        endpoint = absoluteTarget ? destination.endpoint : target.split(/[?#]/, 1)[0] || "/";
        parameters = destination.parameters;
        addDestinationFindings(destination, findings);
      }
    }
    summary = `${method.toUpperCase()} ${endpoint} (${version.toUpperCase()})`;
  } else {
    kind = "response";
    const [, version, statusCode] = responseMatch!;
    summary = `HTTP/${version} ${statusCode}`;
    if (statusCode.startsWith("3")) {
      const location = rawHeaders.find((header) => header.name.toLowerCase() === "location");
      if (location) {
        const destination = parseDestination(location.value, true);
        if ("error" in destination) {
          findings.push({ severity: "medium", title: "Redirect destination could not be parsed", description: "The Location header is present but is not a supported HTTP(S) destination." });
        } else {
          endpoint = destination.endpoint;
          parameters = destination.parameters;
          addDestinationFindings(destination, findings);
        }
      } else {
        findings.push({ severity: "medium", title: "Redirect response has no Location header", description: "A 3xx response normally identifies its destination in a Location header; this message does not contain one." });
      }
    }
  }

  for (const header of rawHeaders) {
    const lower = header.name.toLowerCase();
    if (lower === "set-cookie") {
      const attributes = header.value.split(";").slice(1).map((value) => value.trim().toLowerCase());
      if (!attributes.some((attribute) => attribute === "secure")) findings.push({ severity: "medium", title: "Cookie lacks Secure", description: "This Set-Cookie value has no Secure attribute. If used for a session, review its transport and deployment context." });
      if (!attributes.some((attribute) => attribute === "httponly")) findings.push({ severity: "info", title: "Cookie lacks HttpOnly", description: "Scripts may be able to read this cookie, depending on browser and application behavior." });
      if (!attributes.some((attribute) => attribute.startsWith("samesite="))) findings.push({ severity: "info", title: "Cookie has no explicit SameSite", description: "Cross-site cookie behavior may depend on browser defaults; set an explicit policy when appropriate." });
    }
    if (lower === "authorization" || lower === "proxy-authorization" || lower === "cookie") {
      findings.push({ severity: "info", title: `${header.name} header redacted`, description: "Credential-bearing header values are hidden in the inspection output." });
    }
  }

  return { ok: true, inspection: { kind, summary, endpoint, headers, parameters, bodyLength, findings } };
}
