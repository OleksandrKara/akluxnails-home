import { SquareClient, SquareEnvironment } from "square";

// One shared SDK client instance, mirroring salonLandings' pattern (backend/app/integrations/
// square/client.py: a single cached client, env-driven token/environment, injected into a thin
// gateway per concern). This app talks to the *same* production Square account independently —
// no shared code/process with salonLandings' own backend, so a bug here can never affect mani.
declare global {
  var __squareClient: SquareClient | undefined;
}

export function getSquareClient(): SquareClient {
  if (!global.__squareClient) {
    const environment = process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? SquareEnvironment.Sandbox
      : SquareEnvironment.Production;
    global.__squareClient = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment,
      // The SDK's own default (60s timeout, 2 retries) means a single slow/unresponsive call to
      // Square could leave one of our own request handlers hanging for up to 3 minutes — a
      // visitor staring at "Loading available times…" that long is as good as broken. A shorter
      // timeout fails faster so our own retry/timeout logic (see DateTimeStep's fetchWithTimeout)
      // gets a real chance to try again instead of one attempt eating the whole budget.
      timeoutInSeconds: 15,
    });
  }
  return global.__squareClient;
}

export function locationId(): string {
  const id = process.env.SQUARE_LOCATION_ID;
  if (!id) throw new Error("SQUARE_LOCATION_ID is not configured");
  return id;
}
