export type JwtJsonObject = Record<string, unknown>;

export type JwtFinding = {
  severity: "high" | "medium" | "info";
  title: string;
  description: string;
};

export type JwtClaim = {
  name: string;
  value: string;
  meaning: string;
};

export type JwtInspection = {
  algorithm: string;
  header: JwtJsonObject;
  payload: JwtJsonObject;
  signatureSegment: string;
  claims: JwtClaim[];
  findings: JwtFinding[];
};

export type JwtInspectionResult =
  | { ok: true; inspection: JwtInspection }
  | { ok: false; error: string };

const MAX_TOKEN_LENGTH = 64 * 1024;
const REGISTERED_CLAIMS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires at",
  nbf: "Not valid before",
  iat: "Issued at",
  jti: "Token ID",
};

function isJsonObject(value: unknown): value is JwtJsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeJsonSegment(segment: string, name: string): JwtJsonObject {
  if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment) || segment.length % 4 === 1) {
    throw new Error(`The JWT ${name} segment is not valid base64url.`);
  }

  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  let bytes: Uint8Array;
  try {
    const binary = atob(padded);
    bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new Error(`The JWT ${name} segment could not be decoded.`);
  }

  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new Error(`The JWT ${name} segment must contain valid UTF-8 JSON.`);
  }
  if (!isJsonObject(value)) {
    throw new Error(`The JWT ${name} segment must contain a JSON object.`);
  }
  return value;
}

function displayClaim(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function addTemporalFindings(payload: JwtJsonObject, nowMs: number, findings: JwtFinding[]) {
  const nowSeconds = Math.floor(nowMs / 1000);
  for (const claim of ["exp", "nbf", "iat"] as const) {
    if (!(claim in payload)) continue;
    const value = payload[claim];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      findings.push({
        severity: "medium",
        title: `Invalid ${claim} claim`,
        description: `${claim} should be a numeric date in seconds. This inspector cannot assess its time validity.`,
      });
      continue;
    }
    const date = new Date(value * 1000);
    if (!Number.isFinite(date.getTime())) {
      findings.push({
        severity: "medium",
        title: `Out-of-range ${claim} claim`,
        description: `${claim} is outside the date range this inspector can display.`,
      });
      continue;
    }
    if (claim === "exp" && value <= nowSeconds) {
      findings.push({ severity: "high", title: "Token is expired", description: "The exp time is at or before the current time. A relying application must still validate it under its own policy." });
    } else if (claim === "nbf" && value > nowSeconds) {
      findings.push({ severity: "medium", title: "Token is not yet valid", description: "The nbf time is in the future. A relying application must still validate it under its own policy." });
    } else if (claim === "iat" && value > nowSeconds) {
      findings.push({ severity: "medium", title: "Issued-at time is in the future", description: "The iat time is later than the current time; check the issuer and clock assumptions." });
    }
  }
}

export function inspectCompactJwt(tokenInput: string, nowMs = Date.now()): JwtInspectionResult {
  const token = tokenInput.trim();
  if (!token) return { ok: false, error: "Paste a compact JWT to inspect." };
  if (token.length > MAX_TOKEN_LENGTH) return { ok: false, error: "Token is too large to inspect (maximum 64 KiB)." };

  const parts = token.split(".");
  if (parts.length === 5) {
    return { ok: false, error: "This appears to be an encrypted JWE (five segments). This inspector only decodes three-segment compact JWS tokens." };
  }
  if (parts.length !== 3) {
    return { ok: false, error: "A compact signed JWT must contain three dot-separated segments." };
  }

  let header: JwtJsonObject;
  let payload: JwtJsonObject;
  try {
    header = decodeJsonSegment(parts[0], "header");
    payload = decodeJsonSegment(parts[1], "payload");
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The token could not be decoded." };
  }

  const algorithm = header.alg;
  if (typeof algorithm !== "string" || algorithm.length === 0) {
    return { ok: false, error: "The JWT header must declare a non-empty alg value." };
  }
  if (parts[2] && (!/^[A-Za-z0-9_-]+$/.test(parts[2]) || parts[2].length % 4 === 1)) {
    return { ok: false, error: "The JWT signature segment is not valid base64url." };
  }

  const findings: JwtFinding[] = [
    {
      severity: "info",
      title: "Signature not verified",
      description: "The header and claims are decoded only. This tool does not establish who issued this token or whether its contents are authentic.",
    },
  ];
  if (algorithm.toLowerCase() === "none") {
    findings.push({ severity: "high", title: "Unsecured algorithm declared", description: "The untrusted header declares alg=none. Do not accept an unsigned token as authenticated." });
  }
  if (parts[2] === "" && algorithm.toLowerCase() !== "none") {
    findings.push({ severity: "high", title: "Signature segment is empty", description: "The header declares a signing algorithm but the compact token has no signature bytes." });
  }
  if ("crit" in header) {
    findings.push({ severity: "high", title: "Critical header parameters need processing", description: "This inspector does not implement JOSE critical extensions. A verifier must reject extensions it does not understand." });
  }
  for (const parameter of ["jku", "x5u"] as const) {
    if (parameter in header) {
      findings.push({ severity: "medium", title: `Untrusted ${parameter} header parameter`, description: `The token references ${displayClaim(header[parameter])}. This inspector never fetches key URLs; verifiers must not trust token-directed key locations without an explicit policy.` });
    }
  }
  addTemporalFindings(payload, nowMs, findings);

  const claims = Object.entries(REGISTERED_CLAIMS)
    .filter(([name]) => name in payload)
    .map(([name, meaning]) => {
      const value = payload[name];
      const shown = displayClaim(value);
      if (["exp", "nbf", "iat"].includes(name) && typeof value === "number" && Number.isFinite(value)) {
        const date = new Date(value * 1000);
        if (Number.isFinite(date.getTime())) {
          return { name, value: `${shown} (${date.toISOString()})`, meaning };
        }
      }
      return { name, value: shown, meaning };
    });

  return { ok: true, inspection: { algorithm, header, payload, signatureSegment: parts[2], claims, findings } };
}
